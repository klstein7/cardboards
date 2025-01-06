import { createInsertSchema } from "drizzle-zod";
import { type z } from "zod";
import { boards } from "~/server/db/schema";

export const BoardCreateSchema = createInsertSchema(boards);

export type BoardCreate = z.infer<typeof BoardCreateSchema>;
