// Illustrative mock data for the /design-variants card-detail mockups.
// Sample values only; nothing here is read by the real app.

export interface MockPerson {
  name: string;
  initials: string;
  hue: number;
}

export type MockPriority = "urgent" | "high" | "medium" | "low";

export interface MockComment {
  author: MockPerson;
  when: string;
  body: string;
}

export interface MockCard {
  id: number;
  title: string;
  label?: string;
  priority: MockPriority;
  assignee?: MockPerson;
  due?: string;
  dueFull?: string;
  overdue?: boolean;
  body?: string[];
  thread?: MockComment[];
  created: string;
  updated: string;
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

export const priorityLabel: Record<MockPriority, string> = {
  urgent: "Urgent",
  high: "High",
  medium: "Medium",
  low: "Low",
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

export const currentUser = maren;

export const boardName = "Launch checklist";
export const projectName = "Skylight";

export const boardColumns: MockColumn[] = [
  {
    name: "Backlog",
    cards: [
      {
        id: 208,
        title: "Board sharing links expire without warning",
        label: "Bug",
        priority: "high",
        assignee: tomas,
        created: "Jul 1",
        updated: "Jul 6",
        body: [
          "Shared board links stop working after 30 days with no notice to the person who created them. Visitors get a blank error page instead of an explanation.",
          "We should warn owners a few days before expiry and give visitors a page that says what happened and who to ask for a new link.",
        ],
        thread: [
          {
            author: tomas,
            when: "Jul 5",
            body: "The blank page is the worst part. Even without the warning email, a proper expired-link page would cut most of the support requests.",
          },
          {
            author: maren,
            when: "Jul 6",
            body: "Drafting the expired-link page this week. The warning email needs product sign-off on timing.",
          },
        ],
      },
      {
        id: 210,
        title: "Empty state for archived boards",
        label: "Design",
        priority: "low",
        assignee: maren,
        created: "Jul 2",
        updated: "Jul 2",
        body: [
          "Archived boards currently open into a blank grid. They need the standard dashed empty region with a route back to active boards.",
        ],
      },
      {
        id: 209,
        title: "Slow board load past 200 cards",
        label: "Performance",
        priority: "medium",
        created: "Jun 28",
        updated: "Jul 4",
        body: [
          "Boards with more than 200 cards take several seconds to first paint. Most of that time is spent rendering card entries that are far off screen.",
          "Virtualizing the column lists should get first paint under a second at any board size.",
        ],
        thread: [
          {
            author: aisha,
            when: "Jul 4",
            body: "Measured 3.8 seconds to first paint on a 320-card board. The virtualization prototype is at 0.9 seconds on the same data.",
          },
        ],
      },
      {
        id: 211,
        title: "Export a board to CSV",
        label: "Idea",
        priority: "low",
        created: "Jun 30",
        updated: "Jun 30",
      },
    ],
  },
  {
    name: "In progress",
    cards: [
      {
        id: 214,
        title: "Fix drag preview offset in Safari",
        label: "Bug",
        priority: "urgent",
        assignee: dana,
        due: "Due Fri",
        dueFull: "Fri, Jul 11",
        created: "Jul 2",
        updated: "Jul 8",
        body: [
          "The custom drag preview renders about 40 pixels below the pointer in Safari 17 and later. Chrome and Firefox position it correctly.",
          "The offset grows with the column's horizontal scroll position, which points at how the preview element is measured inside a transformed ancestor.",
        ],
        thread: [
          {
            author: dana,
            when: "Jul 7",
            body: "Reproduced on 17.4. The offset tracks the board's scroll position exactly, so the measurement is happening before the transform is applied.",
          },
          {
            author: tomas,
            when: "Jul 7",
            body: "Column drag previews have the same problem. Worth fixing both while we are in there.",
          },
          {
            author: dana,
            when: "Jul 8",
            body: "pragmatic-drag-and-drop exposes an offset option on setCustomNativeDragPreview. Testing a fix that measures from the drag source's bounding rect instead.",
          },
        ],
      },
      {
        id: 215,
        title: "Inline due date picker on the card face",
        label: "Feature",
        priority: "medium",
        assignee: aisha,
        created: "Jul 3",
        updated: "Jul 5",
        body: [
          "Editing a due date currently means opening the card. A small inline picker on the card face would make queue grooming much faster.",
        ],
      },
      {
        id: 216,
        title: "Live column reorder for everyone",
        label: "Feature",
        priority: "medium",
        assignee: yuki,
        created: "Jul 1",
        updated: "Jul 7",
        body: [
          "Column reordering currently only updates for the person doing the drag. Everyone else waits for a refresh.",
        ],
      },
    ],
  },
  {
    name: "Blocked",
    cards: [],
  },
  {
    name: "In review",
    cards: [
      {
        id: 217,
        title: "Comment mentions notify the wrong user",
        label: "Bug",
        priority: "high",
        assignee: tomas,
        due: "2d overdue",
        dueFull: "Mon, Jul 7",
        overdue: true,
        created: "Jun 26",
        updated: "Jul 8",
        body: [
          "When two members share a first name, @-mentions resolve to whichever account was created first. The notification goes to the wrong person and the right one never sees the thread.",
        ],
        thread: [
          {
            author: yuki,
            when: "Jul 6",
            body: "Mention resolution matches on display name instead of the stable member id. The fix is in review.",
          },
          {
            author: tomas,
            when: "Jul 8",
            body: "Confirmed the fix on staging with two accounts named Alex.",
          },
          {
            author: maren,
            when: "Jul 8",
            body: "Waiting on one more review before merge.",
          },
        ],
      },
      {
        id: 218,
        title: "Compact card density setting",
        label: "Feature",
        priority: "low",
        assignee: maren,
        created: "Jul 3",
        updated: "Jul 3",
        body: [
          "Some teams want more entries on screen at once. A board-level density setting could trim the description preview and tighten row padding.",
        ],
        thread: [
          {
            author: maren,
            when: "Jul 3",
            body: "Pairs well with the new card layout. Sketching both densities.",
          },
        ],
      },
    ],
  },
  {
    name: "Done",
    isCompleted: true,
    cards: [
      {
        id: 219,
        title: "Archive a whole column",
        label: "Feature",
        priority: "medium",
        assignee: dana,
        created: "Jun 20",
        updated: "Jul 2",
      },
      {
        id: 220,
        title: "Faster board switcher",
        label: "Performance",
        priority: "high",
        assignee: yuki,
        created: "Jun 18",
        updated: "Jun 30",
      },
      {
        id: 221,
        title: "Board member roles",
        label: "Feature",
        priority: "medium",
        assignee: aisha,
        created: "Jun 15",
        updated: "Jun 27",
      },
    ],
  },
];

export const defaultCard: MockCard = boardColumns[1]!.cards[0]!;

export function columnNameFor(card: MockCard): string {
  return (
    boardColumns.find((column) =>
      column.cards.some((entry) => entry.id === card.id),
    )?.name ?? ""
  );
}

export function isCompletedCard(card: MockCard): boolean {
  return (
    boardColumns.find((column) =>
      column.cards.some((entry) => entry.id === card.id),
    )?.isCompleted ?? false
  );
}

export const allCards: MockCard[] = boardColumns.flatMap(
  (column) => column.cards,
);

export const totalCards = allCards.length;

export const doneCards = boardColumns
  .filter((column) => column.isCompleted)
  .reduce((sum, column) => sum + column.cards.length, 0);
