import "server-only";

import { format, isWithinInterval, startOfWeek, subDays } from "date-fns";
import { eq } from "drizzle-orm";

import { columns, projects } from "../db/schema";
import { BaseService } from "./base.service";

/**
 * Interface for analytics data points
 */
interface DataPoint {
  name: string;
  value: number;
}

/**
 * Service for analytics operations
 */
class AnalyticsService extends BaseService {
  /**
   * Filter data by date range
   */
  private filterByDateRange<T extends { updatedAt?: Date | null }>(
    data: T[],
    startDate?: Date | null,
    endDate?: Date | null,
  ): T[] {
    if (!startDate || !endDate) return data;

    return data.filter((item) => {
      const date = item.updatedAt ?? new Date();
      return isWithinInterval(date, { start: startDate, end: endDate });
    });
  }

  /**
   * Get project progress data
   */
  async getProjectProgress(
    projectId: string,
    startDate?: Date | null,
    endDate?: Date | null,
  ): Promise<DataPoint[]> {
    return this.executeWithTx(async (txOrDb) => {
      if (!projectId) throw new Error("Project ID is required");

      const project = await txOrDb.query.projects.findFirst({
        where: eq(projects.id, projectId),
        with: {
          boards: {
            with: {
              columns: {
                with: {
                  cards: true,
                },
              },
            },
          },
        },
      });

      if (!project) {
        throw new Error("Project not found");
      }

      if (!project.boards || project.boards.length === 0) {
        return [];
      }

      return project.boards.map((board) => {
        if (!board.columns || board.columns.length === 0) {
          return {
            name: board.name || "Unnamed Board",
            value: 0,
          };
        }

        const completedColumns = board.columns.filter(
          (column) => column.isCompleted,
        );

        if (completedColumns.length === 0) {
          return {
            name: board.name || "Unnamed Board",
            value: 0,
          };
        }

        const completedCards = completedColumns.flatMap(
          (column) => column.cards ?? [],
        );

        const filteredCompletedCards = this.filterByDateRange(
          completedCards,
          startDate,
          endDate,
        );

        const totalCards = board.columns
          .flatMap((column) => column.cards ?? [])
          .filter((card) => card).length;

        return {
          name: board.name || "Unnamed Board",
          value:
            totalCards > 0
              ? Math.round((filteredCompletedCards.length / totalCards) * 100)
              : 0,
        };
      });
    });
  }

  /**
   * Get task completion trend data
   */
  async getTaskCompletionTrend(
    projectId: string,
    startDate?: Date | null,
    endDate?: Date | null,
  ): Promise<DataPoint[]> {
    return this.executeWithTx(async (txOrDb) => {
      if (!projectId) throw new Error("Project ID is required");

      const end = endDate ?? new Date();
      const start = startDate ?? subDays(end, 30);

      const project = await txOrDb.query.projects.findFirst({
        where: eq(projects.id, projectId),
        with: {
          boards: {
            with: {
              columns: {
                where: eq(columns.isCompleted, true),
                with: {
                  cards: {
                    columns: {
                      id: true,
                      columnId: true,
                      updatedAt: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!project) throw new Error("Project not found");
      if (!project.boards || project.boards.length === 0) {
        return [];
      }

      const allCompletedCards = project.boards
        .flatMap((board) => board.columns ?? [])
        .flatMap((column) => column.cards ?? []);

      const cardsByWeek: Record<string, number> = {};

      let currentDay = start;
      while (currentDay <= end) {
        const weekStart = startOfWeek(currentDay, { weekStartsOn: 1 });
        const weekKey = format(weekStart, "yyyy-MM-dd");
        cardsByWeek[weekKey] = 0;
        currentDay = subDays(currentDay, -7);
      }

      allCompletedCards.forEach((card) => {
        if (!card.updatedAt) return;

        const cardDate = new Date(card.updatedAt);
        if (cardDate >= start && cardDate <= end) {
          const weekStart = startOfWeek(cardDate, { weekStartsOn: 1 });
          const weekKey = format(weekStart, "yyyy-MM-dd");
          const currentCount = cardsByWeek[weekKey] ?? 0;
          cardsByWeek[weekKey] = currentCount + 1;
        }
      });

      return Object.entries(cardsByWeek).map(([week, count]) => ({
        name: format(new Date(week), "MMM d"),
        value: count,
      }));
    });
  }

  /**
   * Get user activity data
   */
  async getUserActivity(
    projectId: string,
    startDate?: Date | null,
    endDate?: Date | null,
  ): Promise<DataPoint[]> {
    return this.executeWithTx(async (txOrDb) => {
      if (!projectId) throw new Error("Project ID is required");

      const project = await txOrDb.query.projects.findFirst({
        where: eq(projects.id, projectId),
        with: {
          projectUsers: {
            with: {
              user: true,
            },
          },
          boards: {
            with: {
              columns: {
                with: {
                  cards: {
                    with: {
                      assignedTo: {
                        with: {
                          user: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!project) throw new Error("Project not found");
      if (!project.boards || project.boards.length === 0) {
        return [];
      }

      const userCardCounts: Record<string, { count: number; name: string }> =
        {};

      project.projectUsers.forEach((projectUser) => {
        if (projectUser.user) {
          userCardCounts[projectUser.id] = {
            count: 0,
            name: projectUser.user.name || projectUser.user.email,
          };
        }
      });

      project.boards.forEach((board) => {
        if (!board.columns) return;

        board.columns.forEach((column) => {
          if (!column.cards) return;

          column.cards.forEach((card) => {
            if (
              card.assignedToId &&
              userCardCounts[card.assignedToId] &&
              (!startDate ||
                !endDate ||
                !card.updatedAt ||
                isWithinInterval(new Date(card.updatedAt), {
                  start: startDate,
                  end: endDate,
                }))
            ) {
              const userCount = userCardCounts[card.assignedToId];
              if (userCount) {
                userCount.count += 1;
              }
            }
          });
        });
      });

      const result: DataPoint[] = Object.values(userCardCounts)
        .map((userData) => ({
          name: userData.name,
          value: userData.count,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

      return result;
    });
  }

  /**
   * Get priority distribution data
   */
  async getPriorityDistribution(
    projectId: string,
    startDate?: Date | null,
    endDate?: Date | null,
  ): Promise<DataPoint[]> {
    return this.executeWithTx(async (txOrDb) => {
      if (!projectId) throw new Error("Project ID is required");

      const project = await txOrDb.query.projects.findFirst({
        where: eq(projects.id, projectId),
        with: {
          boards: {
            with: {
              columns: {
                with: {
                  cards: true,
                },
              },
            },
          },
        },
      });

      if (!project) throw new Error("Project not found");
      if (!project.boards || project.boards.length === 0) {
        return [];
      }

      const priorityCounts = {
        low: 0,
        medium: 0,
        high: 0,
        urgent: 0,
        none: 0,
      };

      project.boards.forEach((board) => {
        if (!board.columns) return;

        board.columns.forEach((column) => {
          if (!column.cards) return;

          column.cards.forEach((card) => {
            if (
              startDate &&
              endDate &&
              card.updatedAt &&
              !isWithinInterval(new Date(card.updatedAt), {
                start: startDate,
                end: endDate,
              })
            ) {
              return;
            }

            const priority = card.priority?.toLowerCase() ?? "none";
            if (priority === "low") {
              priorityCounts.low += 1;
            } else if (priority === "medium") {
              priorityCounts.medium += 1;
            } else if (priority === "high") {
              priorityCounts.high += 1;
            } else if (priority === "urgent") {
              priorityCounts.urgent += 1;
            } else {
              priorityCounts.none += 1;
            }
          });
        });
      });

      const result: DataPoint[] = [
        { name: "Low", value: priorityCounts.low },
        { name: "Medium", value: priorityCounts.medium },
        { name: "High", value: priorityCounts.high },
        { name: "Urgent", value: priorityCounts.urgent },
        { name: "None", value: priorityCounts.none },
      ].filter((p) => p.value > 0);

      return result;
    });
  }

  /**
   * Get tasks per due date data
   */
  async getTasksPerDueDate(
    projectId: string,
    startDate?: Date | null,
    endDate?: Date | null,
  ): Promise<DataPoint[]> {
    return this.executeWithTx(async (txOrDb) => {
      if (!projectId) throw new Error("Project ID is required");

      const project = await txOrDb.query.projects.findFirst({
        where: eq(projects.id, projectId),
        with: {
          boards: {
            with: {
              columns: {
                with: {
                  cards: true,
                },
              },
            },
          },
        },
      });

      if (!project) throw new Error("Project not found");
      if (!project.boards || project.boards.length === 0) {
        return [];
      }

      const dueDateCounts = {
        "Past due": 0,
        "Due today": 0,
        "Due this week": 0,
        "Due next week": 0,
        "Due later": 0,
        "No due date": 0,
      };

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayEnd = new Date(today);
      todayEnd.setHours(23, 59, 59, 999);

      const thisWeekStart = startOfWeek(today, { weekStartsOn: 1 });
      const thisWeekEnd = new Date(thisWeekStart);
      thisWeekEnd.setDate(thisWeekStart.getDate() + 6);
      thisWeekEnd.setHours(23, 59, 59, 999);

      const nextWeekStart = new Date(thisWeekStart);
      nextWeekStart.setDate(thisWeekStart.getDate() + 7);
      const nextWeekEnd = new Date(nextWeekStart);
      nextWeekEnd.setDate(nextWeekStart.getDate() + 6);
      nextWeekEnd.setHours(23, 59, 59, 999);

      project.boards.forEach((board) => {
        if (!board.columns) return;

        board.columns.forEach((column) => {
          if (!column.cards) return;

          column.cards.forEach((card) => {
            if (
              startDate &&
              endDate &&
              card.updatedAt &&
              !isWithinInterval(new Date(card.updatedAt), {
                start: startDate,
                end: endDate,
              })
            ) {
              return;
            }

            if (!card.dueDate) {
              dueDateCounts["No due date"] += 1;
            } else {
              const dueDate = new Date(card.dueDate);
              if (dueDate < today) {
                dueDateCounts["Past due"] += 1;
              } else if (dueDate <= todayEnd) {
                dueDateCounts["Due today"] += 1;
              } else if (dueDate <= thisWeekEnd) {
                dueDateCounts["Due this week"] += 1;
              } else if (dueDate <= nextWeekEnd) {
                dueDateCounts["Due next week"] += 1;
              } else {
                dueDateCounts["Due later"] += 1;
              }
            }
          });
        });
      });

      const result: DataPoint[] = Object.entries(dueDateCounts).map(
        ([name, value]) => ({
          name,
          value,
        }),
      );

      return result;
    });
  }

  /**
   * Get all project analytics
   */
  async getProjectAnalytics(
    projectId: string,
    startDate?: Date | null,
    endDate?: Date | null,
  ) {
    return this.executeWithTx(async (txOrDb) => {
      return {
        progress: await this.getProjectProgress(projectId, startDate, endDate),
        taskCompletionTrend: await this.getTaskCompletionTrend(
          projectId,
          startDate,
          endDate,
        ),
        userActivity: await this.getUserActivity(projectId, startDate, endDate),
        priorityDistribution: await this.getPriorityDistribution(
          projectId,
          startDate,
          endDate,
        ),
        tasksPerDueDate: await this.getTasksPerDueDate(
          projectId,
          startDate,
          endDate,
        ),
      };
    });
  }
}

export const analyticsService = new AnalyticsService();
