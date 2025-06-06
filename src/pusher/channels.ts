export type PusherEvent<TData = unknown> = {
  name: string;
  payloadType?: TData;
};

export type PusherChannel<TEvents extends Record<string, PusherEvent>> = {
  name: string;
  events: TEvents;
};

export const pusherChannels = {
  board: {
    name: "board",
    events: {
      created: { name: "board-created" },
      updated: { name: "board-updated" },
      deleted: { name: "board-deleted" },
    },
  },
  column: {
    name: "column",
    events: {
      created: { name: "column-created" },
      updated: { name: "column-updated" },
      deleted: { name: "column-deleted" },
    },
  },
  card: {
    name: "card",
    events: {
      created: { name: "card-created" },
      updated: { name: "card-updated" },
      deleted: { name: "card-deleted" },
      moved: { name: "card-moved" },
      assignedToCurrentUser: { name: "card-assigned-to-current-user" },
    },
  },
  project: {
    name: "project",
    events: {
      created: { name: "project-created" },
      updated: { name: "project-updated" },
      deleted: { name: "project-deleted" },
    },
  },
  projectUser: {
    name: "project-user",
    events: {
      added: { name: "project-user-added" },
      removed: { name: "project-user-removed" },
      updated: { name: "project-user-updated" },
    },
  },
  notification: {
    name: "notification",
    events: {
      created: { name: "notification-created" },
      updated: { name: "notification-updated" },
      deleted: { name: "notification-deleted" },
      markedAsRead: { name: "notification-marked-as-read" },
      allMarkedAsRead: { name: "notification-all-marked-as-read" },
    },
  },
} as const;
