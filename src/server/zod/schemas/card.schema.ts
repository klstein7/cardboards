import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { cards } from "~/server/db/schema";

export const CardSchema = createSelectSchema(cards);

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

export const CardCreateManyPayloadSchema = z.array(
  CardCreateSchema.partial({
    columnId: true,
  }),
);

export const CardCreateManySchema = z.object({
  boardId: z.string(),
  data: CardCreateManyPayloadSchema,
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

export const CardGenerateSchema = z.object({
  boardId: z.string(),
  prompt: z.string(),
});

export const CardGenerateResponseSchema = z.object({
  cards: z.array(
    z.object({
      title: z.string().describe("A short concise title for the card"),
      description: z
        .string()
        .describe("A detailed description of the card in HTML format."),
      priority: z.string().describe("The priority of the card"),
      labels: z.array(z.string()).describe("The labels of the card"),
    }),
  ),
});

export type CardCreate = z.infer<typeof CardCreateSchema>;
export type CardCreateMany = z.infer<typeof CardCreateManySchema>;
export type CardCreateManyPayload = z.infer<typeof CardCreateManyPayloadSchema>;
export type CardMove = z.infer<typeof CardMoveSchema>;
export type CardUpdatePayload = z.infer<typeof CardUpdatePayloadSchema>;
export type CardUpdate = z.infer<typeof CardUpdateSchema>;
export type CardSearchPayload = z.infer<typeof CardSearchSchemaPayload>;
export type CardList = z.infer<typeof CardListSchema>;
export type CardGenerate = z.infer<typeof CardGenerateSchema>;
export type CardGenerateResponse = z.infer<typeof CardGenerateResponseSchema>;
