import "server-only";

import { format, startOfWeek } from "date-fns";
import { eq } from "drizzle-orm";

import { type AnalyticsData } from "~/app/(project)/_types";

import { db } from "../db";
import { projects, projectUsers } from "../db/schema";

async function getProjectProgress(projectId: string): Promise<AnalyticsData> {
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
    with: {
      boards: {
        with: {
          columns: {
            with: {
              cards: {
                columns: { id: true, columnId: true },
              },
            },
          },
        },
      },
    },
  });

  if (!project) throw new Error("Project not found");

  const data = project.boards.map((board) => {
    const totalCards = board.columns.reduce(
      (acc, col) => acc + col.cards.length,
      0,
    );
    const completedCards = board.columns
      .filter((col) => col.isCompleted)
      .reduce((acc, col) => acc + col.cards.length, 0);

    return {
      name: board.name,
      value:
        totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0,
    };
  });

  return {
    config: {
      progress: {
        label: "Completion Progress",
      },
    },
    series: [
      {
        name: "Progress",
        data,
      },
    ],
  };
}

async function getTaskCompletionTrend(
  projectId: string,
): Promise<AnalyticsData> {
  const project = await db.query.projects.findFirst({
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
                  createdAt: true,
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
  const completedCards = project.boards
    .flatMap((board) => board.columns)
    .filter((col) => col.isCompleted)
    .flatMap((col) => col.cards);

  const weeklyData = new Map<string, number>();

  completedCards.forEach((card) => {
    const updatedAt = card.updatedAt ?? new Date();
    const weekStart = startOfWeek(updatedAt);
    const weekKey = format(weekStart, "yyyy-MM-dd");
    weeklyData.set(weekKey, (weeklyData.get(weekKey) ?? 0) + 1);
  });

  const dates = [...weeklyData.keys()].map((d) => new Date(d));
  const latestDate =
    dates.length > 0
      ? new Date(Math.max(...dates.map((d) => d.getTime())))
      : new Date();

  const data: { name: string; value: number }[] = [];
  for (let i = 4; i >= 0; i--) {
    const currentDate = new Date(latestDate);
    currentDate.setDate(currentDate.getDate() - i * 7);
    const weekStart = startOfWeek(currentDate);
    const weekKey = format(weekStart, "yyyy-MM-dd");

    data.push({
      name: `Week ${5 - i}`,
      value: weeklyData.get(weekKey) ?? 0,
    });
  }

  return {
    config: {
      trend: {
        label: "Tasks Completed per Week",
      },
    },
    series: [
      {
        name: "Completed Tasks",
        data,
      },
    ],
  };
}

async function getUserActivity(projectId: string): Promise<AnalyticsData> {
  const projectUsersWithCards = await db.query.projectUsers.findMany({
    where: eq(projectUsers.projectId, projectId),
    with: {
      user: {
        columns: { name: true },
      },
      assignedCards: {
        columns: { id: true },
      },
    },
  });

  const data = projectUsersWithCards.map((user) => ({
    name: user.user.name || "Unknown",
    value: user.assignedCards.length,
  }));

  return {
    config: {
      activity: {
        label: "User Activity",
      },
    },
    series: [
      {
        name: "Cards Assigned",
        data,
      },
    ],
  };
}

export const analyticsService = {
  getProjectProgress,
  getTaskCompletionTrend,
  getUserActivity,
};
