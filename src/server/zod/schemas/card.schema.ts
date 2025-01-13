import { createInsertSchema, createSelectSchema } from "drizzle-zod";
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
  cardId: z.number(),
  destinationColumnId: z.string(),
  sourceColumnId: z.string(),
  newOrder: z.number(),
});

export const CardUpdatePayloadSchema = createSelectSchema(cards)
  .omit({
    id: true,
  })
  .partial();

export const CardUpdateSchema = z.object({
  cardId: z.number(),
  data: CardUpdatePayloadSchema,
});

export const CardSearchSchemaPayload = z.object({
  search: z.string().optional(),
});

export const CardListSchema = z.object({
  columnId: z.string(),
  search: CardSearchSchemaPayload.optional(),
});

export type CardCreate = z.infer<typeof CardCreateSchema>;
export type CardMove = z.infer<typeof CardMoveSchema>;
export type CardUpdatePayload = z.infer<typeof CardUpdatePayloadSchema>;
export type CardUpdate = z.infer<typeof CardUpdateSchema>;
export type CardSearchPayload = z.infer<typeof CardSearchSchemaPayload>;
export type CardList = z.infer<typeof CardListSchema>;
