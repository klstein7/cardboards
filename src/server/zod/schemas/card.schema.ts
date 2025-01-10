import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { cards } from "~/server/db/schema";

export const CardCreateSchema = createInsertSchema(cards)
  .omit({
    order: true,
    labels: true,
  })
  .extend({
    labels: z.array(
      z.object({
        id: z.string(),
        text: z.string(),
      }),
    ),
  });

export const CardMoveSchema = z.object({
  cardId: z.string(),
  destinationColumnId: z.string(),
  sourceColumnId: z.string(),
  newOrder: z.number(),
});

export type CardCreate = z.infer<typeof CardCreateSchema>;
export type CardMove = z.infer<typeof CardMoveSchema>;
