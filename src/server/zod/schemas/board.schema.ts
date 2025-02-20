import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { boards } from "~/server/db/schema";

import { GeneratedCardSchema } from "./card.schema";

export const BoardCreateSchema = createInsertSchema(boards);
export const BoardUpdatePayloadSchema = createInsertSchema(boards).partial();
export const BoardUpdateSchema = z.object({
  boardId: z.string(),
  data: BoardUpdatePayloadSchema,
});
export const BoardGenerateSchema = z.object({
  projectId: z.string(),
  prompt: z.string(),
});
export const BoardGenerateResponseSchema = z.object({
  name: z.string().describe("The name of the board"),
  columns: z
    .array(
      z.object({
        name: z
          .string()
          .describe(
            "The name of the column. E.g. 'To Do', 'In Progress', 'Done'",
          ),
        order: z
          .number()
          .describe(
            "The order of the column. Starts at 0 and increments by 1 for each column.",
          ),
        isCompleted: z
          .boolean()
          .describe(
            "Whether tasks in this column are completed. Must only have 1 column with this set to true.",
          ),
        cards: z
          .array(GeneratedCardSchema)
          .describe("The starter cards of the board"),
      }),
    )
    .describe("The columns of the board"),
});

export type BoardCreate = z.infer<typeof BoardCreateSchema>;
export type BoardUpdatePayload = z.infer<typeof BoardUpdatePayloadSchema>;
export type BoardUpdate = z.infer<typeof BoardUpdateSchema>;
export type BoardGenerate = z.infer<typeof BoardGenerateSchema>;
export type BoardGenerateResponse = z.infer<typeof BoardGenerateResponseSchema>;
