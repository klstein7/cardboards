import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { cardComments } from "../../db/schema";

export const CardCommentCreateSchema = createInsertSchema(cardComments).omit({
  projectUserId: true,
});

export const CardCommentUpdatePayloadSchema = createInsertSchema(cardComments)
  .omit({
    projectUserId: true,
  })
  .partial();

export const CardCommentUpdateSchema = z.object({
  cardCommentId: z.string(),
  data: CardCommentUpdatePayloadSchema,
});

export type CardCommentCreate = z.infer<typeof CardCommentCreateSchema>;
export type CardCommentUpdatePayload = z.infer<
  typeof CardCommentUpdatePayloadSchema
>;
export type CardCommentUpdate = z.infer<typeof CardCommentUpdateSchema>;
