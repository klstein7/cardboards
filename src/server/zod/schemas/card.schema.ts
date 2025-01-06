import { createInsertSchema } from "drizzle-zod";
import { type z } from "zod";
import { cards } from "~/server/db/schema";

export const CardCreateSchema = createInsertSchema(cards).omit({
  order: true,
});

export type CardCreate = z.infer<typeof CardCreateSchema>;
