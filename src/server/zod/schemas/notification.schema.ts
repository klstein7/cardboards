import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { notifications } from "~/server/db/schema";

// Schema for selecting notifications
export const NotificationSchema = createSelectSchema(notifications);

// Schema for creating notifications
export const NotificationCreateSchema = createInsertSchema(notifications, {
  type: z.enum([
    "mention",
    "assignment",
    "comment",
    "due_date",
    "invitation",
    "column_update",
    "card_move",
    "insight",
    "project_update",
  ]),
  entityType: z.enum([
    "project",
    "board",
    "column",
    "card",
    "card_comment",
    "invitation",
    "project_user",
    "ai_insight",
  ]),
});

// Schema for updating notifications
export const NotificationUpdatePayloadSchema = z.object({
  isRead: z.boolean().optional(),
  content: z.string().optional(),
  title: z.string().optional(),
  metadata: z.string().optional(),
});

// Schema for notification filters and pagination
export const NotificationFilterSchema = z.object({
  isRead: z.boolean().optional(),
  type: z
    .enum([
      "mention",
      "assignment",
      "comment",
      "due_date",
      "invitation",
      "column_update",
      "card_move",
      "insight",
      "project_update",
    ])
    .optional(),
  limit: z.number().int().positive().optional().default(20),
  offset: z.number().int().min(0).optional().default(0),
});

// Types
export type Notification = z.infer<typeof NotificationSchema>;
export type NotificationCreate = z.infer<typeof NotificationCreateSchema>;
export type NotificationUpdatePayload = z.infer<
  typeof NotificationUpdatePayloadSchema
>;
export type NotificationFilter = z.infer<typeof NotificationFilterSchema>;
