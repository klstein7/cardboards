// Illustrative mock data for the /design-variants mockups. All numbers and
// names are sample values, not real metrics.

export interface MockPerson {
  name: string;
  initials: string;
  hue: number;
}

export type MockPriority = "urgent" | "high" | "medium" | "low";

export interface MockCard {
  title: string;
  label: string;
  priority: MockPriority;
  assignee?: MockPerson;
  due?: string;
  overdue?: boolean;
  comments?: number;
}

export interface MockColumn {
  name: string;
  cards: MockCard[];
}

export interface MockBoard {
  name: string;
  hue: number;
  cardCount: number;
  doneCount: number;
  members: MockPerson[];
}

export interface MockActivity {
  person: MockPerson;
  action: string;
  target?: string;
  time: string;
}

export interface MockStat {
  label: string;
  value: string;
}

export const maren: MockPerson = { name: "Maren Holt", initials: "MH", hue: 152 };
export const tomas: MockPerson = { name: "Tomás Rivera", initials: "TR", hue: 210 };
export const aisha: MockPerson = { name: "Aisha Karim", initials: "AK", hue: 268 };
export const dana: MockPerson = { name: "Dana Okafor", initials: "DO", hue: 24 };
export const yuki: MockPerson = { name: "Yuki Tanaka", initials: "YT", hue: 330 };

export const boardColumns: MockColumn[] = [
  {
    name: "Backlog",
    cards: [
      {
        title: "Board sharing links expire without warning",
        label: "Bug",
        priority: "high",
        assignee: tomas,
        comments: 3,
      },
      {
        title: "Empty state for archived boards",
        label: "Design",
        priority: "low",
        assignee: maren,
      },
      {
        title: "Slow board load past 200 cards",
        label: "Performance",
        priority: "medium",
        comments: 5,
      },
      {
        title: "Export a board to CSV",
        label: "Idea",
        priority: "low",
      },
    ],
  },
  {
    name: "In progress",
    cards: [
      {
        title: "Fix drag preview offset in Safari",
        label: "Bug",
        priority: "urgent",
        assignee: dana,
        due: "Due Fri",
        comments: 4,
      },
      {
        title: "Inline due date picker on the card face",
        label: "Feature",
        priority: "medium",
        assignee: aisha,
      },
      {
        title: "Live column reorder for everyone",
        label: "Feature",
        priority: "medium",
        assignee: yuki,
        comments: 2,
      },
    ],
  },
  {
    name: "In review",
    cards: [
      {
        title: "Comment mentions notify the wrong user",
        label: "Bug",
        priority: "high",
        assignee: tomas,
        due: "2d overdue",
        overdue: true,
        comments: 8,
      },
      {
        title: "Compact card density setting",
        label: "Feature",
        priority: "low",
        assignee: maren,
        comments: 1,
      },
    ],
  },
  {
    name: "Done",
    cards: [
      {
        title: "Archive a whole column",
        label: "Feature",
        priority: "medium",
        assignee: dana,
      },
      {
        title: "Faster board switcher",
        label: "Performance",
        priority: "high",
        assignee: yuki,
        comments: 6,
      },
      {
        title: "Board member roles",
        label: "Feature",
        priority: "medium",
        assignee: aisha,
        comments: 2,
      },
    ],
  },
];

export const heroColumns: MockColumn[] = boardColumns
  .slice(1, 3)
  .map((column) => ({ ...column, cards: column.cards.slice(0, 3) }));

export const dashboardStats: MockStat[] = [
  { label: "Open cards", value: "47" },
  { label: "Due this week", value: "6" },
  { label: "In review", value: "5" },
  { label: "Done, last 7 days", value: "12" },
];

export const dashboardBoards: MockBoard[] = [
  { name: "Launch checklist", hue: 200, cardCount: 18, doneCount: 11, members: [maren, dana, tomas] },
  { name: "Bug triage", hue: 15, cardCount: 24, doneCount: 9, members: [aisha, tomas] },
  { name: "Marketing site", hue: 280, cardCount: 9, doneCount: 7, members: [yuki, maren] },
];

export const recentActivity: MockActivity[] = [
  {
    person: dana,
    action: "moved a card to In review",
    target: "Fix drag preview offset in Safari",
    time: "12m",
  },
  {
    person: aisha,
    action: "commented on",
    target: "Comment mentions notify the wrong user",
    time: "41m",
  },
  {
    person: tomas,
    action: "created",
    target: "Board sharing links expire without warning",
    time: "2h",
  },
  {
    person: maren,
    action: "completed",
    target: "Compact card density setting",
    time: "5h",
  },
  {
    person: yuki,
    action: "joined the project",
    time: "1d",
  },
];
