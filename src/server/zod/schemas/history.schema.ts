import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { history } from "~/server/db/schema";

// Create schemas from database schema
export const HistorySchema = createSelectSchema(history);
export const HistoryInsertSchema = createInsertSchema(history);

// Schema for creating a history entry
export const HistoryCreateSchema = z.object({
  entityType: z.enum([
    "project",
    "board",
    "column",
    "card",
    "user",
    "project_user",
    "invitation",
    "card_comment",
  ]),
  entityId: z.string(),
  action: z.enum(["create", "update", "delete", "move"]),
  projectId: z.string().optional(),
  changes: z.string().optional(), // JSON string containing the changes
});

// Schema for listing history entries by entity
export const HistoryListByEntitySchema = z.object({
  entityType: z.enum([
    "project",
    "board",
    "column",
    "card",
    "user",
    "project_user",
    "invitation",
    "card_comment",
  ]),
  entityId: z.string(),
});

// Schema for listing history entries by project
export const HistoryListByProjectSchema = z.object({
  projectId: z.string(),
});

// Export types
export type HistoryCreate = z.infer<typeof HistoryCreateSchema>;
export type HistoryListByEntity = z.infer<typeof HistoryListByEntitySchema>;
export type HistoryListByProject = z.infer<typeof HistoryListByProjectSchema>;
