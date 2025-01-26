import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { boards } from "~/server/db/schema";

export const BoardCreateSchema = createInsertSchema(boards);
export const BoardUpdatePayloadSchema = createInsertSchema(boards).partial();
export const BoardUpdateSchema = z.object({
  boardId: z.string(),
  data: BoardUpdatePayloadSchema,
});

export type BoardCreate = z.infer<typeof BoardCreateSchema>;
export type BoardUpdatePayload = z.infer<typeof BoardUpdatePayloadSchema>;
export type BoardUpdate = z.infer<typeof BoardUpdateSchema>;
