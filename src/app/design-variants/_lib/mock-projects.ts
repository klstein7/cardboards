// Illustrative mock data for the /design-variants projects-page mockups.
// Sample values only; nothing here is read by the real app.

import { aisha, dana, maren, type MockPerson, tomas, yuki } from "./mock-data";

export interface MockBoard {
  name: string;
  cards: number;
  done: number;
}

export interface MockProject {
  name: string;
  isFavorite?: boolean;
  boards: MockBoard[];
  members: MockPerson[];
  updated: string;
}

export const mockProjects: MockProject[] = [
  {
    name: "Skylight",
    isFavorite: true,
    boards: [
      { name: "Launch checklist", cards: 16, done: 5 },
      { name: "Mobile beta", cards: 9, done: 2 },
      { name: "Marketing site", cards: 7, done: 7 },
    ],
    members: [maren, tomas, aisha, dana, yuki],
    updated: "Today",
  },
  {
    name: "Atlas CRM",
    isFavorite: true,
    boards: [
      { name: "Pipeline rework", cards: 12, done: 4 },
      { name: "Data migration", cards: 21, done: 13 },
    ],
    members: [tomas, dana, yuki],
    updated: "Yesterday",
  },
  {
    name: "Fieldnotes",
    boards: [
      { name: "Editor v2", cards: 14, done: 6 },
      { name: "Sync engine", cards: 8, done: 1 },
      { name: "Onboarding", cards: 6, done: 3 },
    ],
    members: [maren, aisha],
    updated: "3d ago",
  },
  {
    name: "Beacon Analytics",
    boards: [
      { name: "Dashboards", cards: 11, done: 8 },
      { name: "Alerting", cards: 5, done: 0 },
    ],
    members: [yuki, tomas, maren, dana],
    updated: "1w ago",
  },
  {
    name: "Handoff",
    boards: [{ name: "Design tokens", cards: 4, done: 2 }],
    members: [aisha],
    updated: "2w ago",
  },
  {
    name: "Sandbox",
    boards: [],
    members: [maren],
    updated: "Mar 12",
  },
];

export const favoriteProjects = mockProjects.filter(
  (project) => project.isFavorite,
);
export const regularProjects = mockProjects.filter(
  (project) => !project.isFavorite,
);

export const totalBoards = mockProjects.reduce(
  (sum, project) => sum + project.boards.length,
  0,
);

export const workspaceMembers = [maren, tomas, aisha, dana, yuki];

export function donePercent(board: MockBoard): number {
  return board.cards > 0 ? Math.round((board.done / board.cards) * 100) : 0;
}
