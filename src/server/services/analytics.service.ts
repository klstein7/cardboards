import "server-only";

import { format, isWithinInterval, startOfWeek, subDays } from "date-fns";
import { eq } from "drizzle-orm";

import { type Database, type Transaction } from "../db";
import { columns, projects, projectUsers } from "../db/schema";
import { authService } from "./auth.service";
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

      // Verify user can access the project
      await authService.canAccessProject(projectId, txOrDb);

      const project = await txOrDb.query.projects.findFirst({
        where: eq(projects.id, projectId),
        with: {
          boards: {
            with: {
              columns: {
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

      return project.boards.map((board) => {
        if (!board?.columns) {
          return { name: "Unknown Board", value: 0 };
        }

        const allCards = board.columns.flatMap((col) => col.cards || []);
        const filteredCards = this.filterByDateRange(
          allCards,
          startDate,
          endDate,
        );

        const completedCards = board.columns
          .filter((col) => col.isCompleted)
          .flatMap((col) =>
            this.filterByDateRange(col.cards || [], startDate, endDate),
          );

        const totalCards = filteredCards.length;

        return {
          name: board.name || "Unnamed Board",
          value:
            totalCards > 0
              ? Math.round((completedCards.length / totalCards) * 100)
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

      // Verify user can access the project
      await authService.canAccessProject(projectId, txOrDb);

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

      const completedCards = project.boards
        .flatMap((board) => board.columns || [])
        .flatMap((col) => col.cards || [])
        .filter(
          (card) =>
            card.updatedAt && card.updatedAt >= start && card.updatedAt <= end,
        );

      const weeklyData = new Map<string, number>();
      completedCards.forEach((card) => {
        if (!card.updatedAt) return;

        const updatedAt = card.updatedAt;
        const weekStart = startOfWeek(updatedAt);
        const weekKey = format(weekStart, "yyyy-MM-dd");
        weeklyData.set(weekKey, (weeklyData.get(weekKey) ?? 0) + 1);
      });

      const weeks: Date[] = [];
      const currentWeek = startOfWeek(start);
      const endWeek = startOfWeek(end);

      while (currentWeek <= endWeek) {
        weeks.push(new Date(currentWeek));
        currentWeek.setDate(currentWeek.getDate() + 7);
      }

      return weeks.map((weekDate, i) => {
        const weekKey = format(weekDate, "yyyy-MM-dd");
        return {
          name: `Week ${i + 1}`,
          value: weeklyData.get(weekKey) ?? 0,
        };
      });
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

      // Verify user can access the project
      await authService.canAccessProject(projectId, txOrDb);

      const projectUsersWithCards = await txOrDb.query.projectUsers.findMany({
        where: eq(projectUsers.projectId, projectId),
        with: {
          user: {
            columns: { name: true },
          },
          assignedCards: {
            columns: { id: true, updatedAt: true },
          },
        },
      });

      if (!projectUsersWithCards || projectUsersWithCards.length === 0) {
        return [];
      }

      return projectUsersWithCards
        .map((user) => {
          if (!user?.assignedCards) {
            return { name: "Unknown User", value: 0 };
          }

          const filteredCards = this.filterByDateRange(
            user.assignedCards,
            startDate,
            endDate,
          );

          return {
            name: user.user?.name || "Unknown",
            value: filteredCards.length,
          };
        })
        .sort((a, b) => b.value - a.value);
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

      // Verify user can access the project
      await authService.canAccessProject(projectId, txOrDb);

      const project = await txOrDb.query.projects.findFirst({
        where: eq(projects.id, projectId),
        with: {
          boards: {
            with: {
              columns: {
                with: {
                  cards: {
                    columns: { id: true, priority: true, updatedAt: true },
                  },
                },
              },
            },
          },
        },
      });

      if (!project) throw new Error("Project not found");
      if (!project.boards || project.boards.length === 0) {
        return [
          { name: "Low", value: 0 },
          { name: "Medium", value: 0 },
          { name: "High", value: 0 },
          { name: "Urgent", value: 0 },
          { name: "Unassigned", value: 0 },
        ];
      }

      const allCards = project.boards
        .flatMap((board) => board.columns || [])
        .flatMap((column) => column.cards || []);

      const filteredCards = this.filterByDateRange(
        allCards,
        startDate,
        endDate,
      );

      const priorityCounts = {
        low: 0,
        medium: 0,
        high: 0,
        urgent: 0,
        unassigned: 0,
      };

      filteredCards.forEach((card) => {
        if (!card.priority) {
          priorityCounts.unassigned++;
        } else {
          priorityCounts[card.priority as keyof typeof priorityCounts]++;
        }
      });

      return [
        { name: "Low", value: priorityCounts.low },
        { name: "Medium", value: priorityCounts.medium },
        { name: "High", value: priorityCounts.high },
        { name: "Urgent", value: priorityCounts.urgent },
        { name: "Unassigned", value: priorityCounts.unassigned },
      ];
    });
  }

  /**
   * Get tasks by due date data
   */
  async getTasksPerDueDate(
    projectId: string,
    startDate?: Date | null,
    endDate?: Date | null,
  ): Promise<DataPoint[]> {
    return this.executeWithTx(async (txOrDb) => {
      if (!projectId) throw new Error("Project ID is required");

      // Verify user can access the project
      await authService.canAccessProject(projectId, txOrDb);

      const today = new Date();

      const project = await txOrDb.query.projects.findFirst({
        where: eq(projects.id, projectId),
        with: {
          boards: {
            with: {
              columns: {
                with: {
                  cards: {
                    columns: { id: true, dueDate: true, updatedAt: true },
                  },
                },
              },
            },
          },
        },
      });

      if (!project) throw new Error("Project not found");
      if (!project.boards || project.boards.length === 0) {
        return [
          { name: "Overdue", value: 0 },
          { name: "Due Today", value: 0 },
          { name: "Due This Week", value: 0 },
          { name: "Due Later", value: 0 },
          { name: "No Due Date", value: 0 },
        ];
      }

      const allCards = project.boards
        .flatMap((board) => board.columns || [])
        .flatMap((column) => column.cards || []);

      const filteredCards = this.filterByDateRange(
        allCards,
        startDate,
        endDate,
      );

      const overdue = filteredCards.filter(
        (card) => card.dueDate && card.dueDate < today,
      ).length;

      const dueToday = filteredCards.filter((card) => {
        if (!card.dueDate) return false;
        const cardDate = new Date(card.dueDate);
        return cardDate.toDateString() === today.toDateString();
      }).length;

      const dueThisWeek = filteredCards.filter((card) => {
        if (!card.dueDate || card.dueDate < today) return false;
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        return card.dueDate <= nextWeek;
      }).length;

      const dueLater = filteredCards.filter((card) => {
        if (!card.dueDate) return false;
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        return card.dueDate > nextWeek;
      }).length;

      const noDueDate = filteredCards.filter((card) => !card.dueDate).length;

      return [
        { name: "Overdue", value: overdue },
        { name: "Due Today", value: dueToday },
        { name: "Due This Week", value: dueThisWeek },
        { name: "Due Later", value: dueLater },
        { name: "No Due Date", value: noDueDate },
      ];
    });
  }
}

export const analyticsService = new AnalyticsService();
