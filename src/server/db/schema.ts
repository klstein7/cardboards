// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTableCreator,
  serial,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `kanban_${name}`);

export const projects = createTable("project", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => createId()),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

export const boards = createTable(
  "board",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => createId()),
    projectId: varchar("project_id", { length: 255 })
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    color: varchar("color", { length: 7 }).notNull().default("#3B82F6"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [index("board_name_idx").on(table.name)],
);

export const columns = createTable(
  "column",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => createId()),
    boardId: varchar("board_id", { length: 255 })
      .notNull()
      .references(() => boards.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    description: varchar("description", { length: 1000 }),
    order: integer("order").notNull(),
    isCompleted: boolean("is_completed").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    index("column_board_id_idx").on(table.boardId),
    index("column_order_idx").on(table.order),
  ],
);

export const cards = createTable(
  "card",
  {
    id: serial("id").primaryKey(),
    columnId: varchar("column_id", { length: 255 })
      .notNull()
      .references(() => columns.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    description: varchar("description"),
    order: integer("order").notNull(),
    dueDate: timestamp("due_date"),
    priority: varchar("priority", {
      length: 20,
      enum: ["low", "medium", "high", "urgent"],
    }),
    assignedToId: varchar("assigned_to_id", { length: 255 }).references(
      () => projectUsers.id,
      { onDelete: "set null" },
    ),
    labels: text("labels").array(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    index("card_column_id_idx").on(table.columnId),
    index("card_order_idx").on(table.order),
    index("card_assigned_to_idx").on(table.assignedToId),
    index("card_due_date_idx").on(table.dueDate),
  ],
);

export const cardComments = createTable("card_comment", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => createId()),
  cardId: integer("card_id")
    .notNull()
    .references(() => cards.id, { onDelete: "cascade" }),
  projectUserId: varchar("project_user_id", { length: 255 })
    .notNull()
    .references(() => projectUsers.id, { onDelete: "cascade" }),
  content: varchar("content", { length: 1000 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

export const users = createTable("user", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  imageUrl: varchar("image_url", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

export const projectUsers = createTable(
  "project_user",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => createId()),
    projectId: varchar("project_id", { length: 255 })
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 255, enum: ["admin", "member"] }).notNull(),
    isFavorite: boolean("is_favorite").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    unique("project_user_project_id_user_id_idx").on(
      table.projectId,
      table.userId,
    ),
    index("project_user_project_id_idx").on(table.projectId),
    index("project_user_user_id_idx").on(table.userId),
    index("project_user_is_favorite_idx").on(table.isFavorite),
  ],
);

export const invitations = createTable(
  "invitation",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => createId()),
    projectId: varchar("project_id", { length: 255 })
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    invitedById: varchar("invited_by_id", { length: 255 })
      .notNull()
      .references(() => projectUsers.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at")
      .notNull()
      .$defaultFn(() => {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        return date;
      }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    index("invitation_project_id_idx").on(table.projectId),
    index("invitation_invited_by_id_idx").on(table.invitedById),
  ],
);

export const history = createTable(
  "history",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => createId()),
    entityType: varchar("entity_type", {
      length: 50,
      enum: [
        "project",
        "board",
        "column",
        "card",
        "user",
        "project_user",
        "invitation",
        "card_comment",
      ],
    }).notNull(),
    entityId: varchar("entity_id", { length: 255 }).notNull(),
    action: varchar("action", {
      length: 20,
      enum: ["create", "update", "delete", "move"],
    }).notNull(),
    projectId: varchar("project_id", { length: 255 }).references(
      () => projects.id,
      { onDelete: "cascade" },
    ),
    performedById: varchar("performed_by_id", { length: 255 }).references(
      () => projectUsers.id,
      { onDelete: "set null" },
    ),
    changes: text("changes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("history_entity_type_entity_id_idx").on(
      table.entityType,
      table.entityId,
    ),
    index("history_project_id_idx").on(table.projectId),
    index("history_performed_by_id_idx").on(table.performedById),
    index("history_created_at_idx").on(table.createdAt),
  ],
);

export const aiInsights = createTable(
  "ai_insight",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => createId()),
    entityType: varchar("entity_type", {
      length: 20,
      enum: ["project", "board"],
    }).notNull(),
    entityId: varchar("entity_id", { length: 255 }).notNull(),
    projectId: varchar("project_id", { length: 255 }).references(
      () => projects.id,
      { onDelete: "cascade" },
    ),
    boardId: varchar("board_id", { length: 255 }).references(() => boards.id, {
      onDelete: "cascade",
    }),
    insightType: varchar("insight_type", {
      length: 50,
      enum: [
        "sprint_prediction",
        "bottleneck",
        "productivity",
        "risk_assessment",
        "recommendation",
      ],
    }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    content: varchar("content", { length: 2000 }).notNull(),
    metadata: text("metadata"),
    severity: varchar("severity", {
      length: 20,
      enum: ["info", "warning", "critical"],
    }).default("info"),
    isActive: boolean("is_active").default(true),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    index("ai_insight_entity_idx").on(table.entityType, table.entityId),
    index("ai_insight_type_idx").on(table.insightType),
    index("ai_insight_created_at_idx").on(table.createdAt),
    index("ai_insight_project_id_idx").on(table.projectId),
    index("ai_insight_board_id_idx").on(table.boardId),
  ],
);

export const notifications = createTable(
  "notification",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    projectId: varchar("project_id", { length: 255 }).references(
      () => projects.id,
      { onDelete: "cascade" },
    ),
    entityType: varchar("entity_type", {
      length: 50,
      enum: [
        "project",
        "board",
        "column",
        "card",
        "card_comment",
        "invitation",
        "project_user",
        "ai_insight",
      ],
    }).notNull(),
    entityId: varchar("entity_id", { length: 255 }).notNull(),
    type: varchar("type", {
      length: 50,
      enum: [
        "mention",
        "assignment",
        "comment",
        "due_date",
        "invitation",
        "column_update",
        "card_move",
        "insight",
        "project_update",
      ],
    }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    content: varchar("content", { length: 1000 }),
    isRead: boolean("is_read").notNull().default(false),
    metadata: text("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    index("notification_user_id_idx").on(table.userId),
    index("notification_project_id_idx").on(table.projectId),
    index("notification_entity_idx").on(table.entityType, table.entityId),
    index("notification_is_read_idx").on(table.isRead),
    index("notification_created_at_idx").on(table.createdAt),
  ],
);

export const invitationRelations = relations(invitations, ({ one }) => ({
  project: one(projects, {
    fields: [invitations.projectId],
    references: [projects.id],
  }),
  invitedBy: one(projectUsers, {
    fields: [invitations.invitedById],
    references: [projectUsers.id],
  }),
}));

export const notificationRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [notifications.projectId],
    references: [projects.id],
  }),
}));

export const aiInsightRelations = relations(aiInsights, ({ one }) => ({
  project: one(projects, {
    fields: [aiInsights.projectId],
    references: [projects.id],
  }),
  board: one(boards, {
    fields: [aiInsights.boardId],
    references: [boards.id],
  }),
}));

export const userRelations = relations(users, ({ many }) => ({
  projectUsers: many(projectUsers),
  notifications: many(notifications),
}));

export const projectUserRelations = relations(
  projectUsers,
  ({ one, many }) => ({
    project: one(projects, {
      fields: [projectUsers.projectId],
      references: [projects.id],
    }),
    user: one(users, {
      fields: [projectUsers.userId],
      references: [users.id],
    }),
    assignedCards: many(cards),
  }),
);

export const projectRelations = relations(projects, ({ many }) => ({
  boards: many(boards),
  projectUsers: many(projectUsers),
  insights: many(aiInsights),
  notifications: many(notifications),
}));

export const boardRelations = relations(boards, ({ many, one }) => ({
  project: one(projects, {
    fields: [boards.projectId],
    references: [projects.id],
  }),
  columns: many(columns),
  insights: many(aiInsights),
}));

export const columnRelations = relations(columns, ({ one, many }) => ({
  board: one(boards, {
    fields: [columns.boardId],
    references: [boards.id],
  }),
  cards: many(cards),
}));

export const cardRelations = relations(cards, ({ one, many }) => ({
  column: one(columns, {
    fields: [cards.columnId],
    references: [columns.id],
  }),
  assignedTo: one(projectUsers, {
    fields: [cards.assignedToId],
    references: [projectUsers.id],
  }),
  comments: many(cardComments),
}));

export const cardCommentRelations = relations(cardComments, ({ one }) => ({
  card: one(cards, {
    fields: [cardComments.cardId],
    references: [cards.id],
  }),
  projectUser: one(projectUsers, {
    fields: [cardComments.projectUserId],
    references: [projectUsers.id],
  }),
}));

export const historyRelations = relations(history, ({ one }) => ({
  project: one(projects, {
    fields: [history.projectId],
    references: [projects.id],
  }),
  performedBy: one(projectUsers, {
    fields: [history.performedById],
    references: [projectUsers.id],
  }),
}));
