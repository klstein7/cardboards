import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { cards } from "~/server/db/schema";

export const CardCreateSchema = createInsertSchema(cards).omit({
  order: true,
});

export const CardMoveSchema = z.object({
  cardId: z.string(),
  destinationColumnId: z.string(),
  newOrder: z.number(),
});

export type CardCreate = z.infer<typeof CardCreateSchema>;
export type CardMove = z.infer<typeof CardMoveSchema>;
