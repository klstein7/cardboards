// Illustrative mock data for the /design-variants board mockups. Sample
// values only; nothing here is read by the real app.

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
  isCompleted?: boolean;
  cards: MockCard[];
}

export const priorityColor: Record<MockPriority, string> = {
  urgent: "var(--priority-urgent-color)",
  high: "var(--priority-high-color)",
  medium: "var(--priority-medium-color)",
  low: "var(--priority-low-color)",
};

export function avatarStyle(person: MockPerson): {
  backgroundColor: string;
  color: string;
} {
  return {
    backgroundColor: `hsl(${person.hue} 40% 30%)`,
    color: "hsl(0 0% 96%)",
  };
}

export const maren: MockPerson = {
  name: "Maren Holt",
  initials: "MH",
  hue: 152,
};
export const tomas: MockPerson = {
  name: "Tomás Rivera",
  initials: "TR",
  hue: 210,
};
export const aisha: MockPerson = {
  name: "Aisha Karim",
  initials: "AK",
  hue: 268,
};
export const dana: MockPerson = {
  name: "Dana Okafor",
  initials: "DO",
  hue: 24,
};
export const yuki: MockPerson = {
  name: "Yuki Tanaka",
  initials: "YT",
  hue: 330,
};

export const members: MockPerson[] = [maren, tomas, aisha, dana, yuki];

export const boardName = "Launch checklist";
export const projectName = "Skylight";

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
    isCompleted: true,
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

export const totalCards = boardColumns.reduce(
  (sum, column) => sum + column.cards.length,
  0,
);

export const doneCards = boardColumns
  .filter((column) => column.isCompleted)
  .reduce((sum, column) => sum + column.cards.length, 0);
