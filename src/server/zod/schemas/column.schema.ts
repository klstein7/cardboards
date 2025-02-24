import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { columns } from "~/server/db/schema";

export const ColumnCreateSchema = createInsertSchema(columns).partial({
  order: true,
});

export const ColumnUpdatePayloadSchema = createInsertSchema(columns).pick({
  name: true,
  description: true,
  isCompleted: true,
});
export const ColumnUpdateSchema = z.object({
  columnId: z.string(),
  data: ColumnUpdatePayloadSchema,
});
export const ColumnShiftPayloadSchema = z.object({
  direction: z.enum(["up", "down"]),
});
export const ColumnShiftSchema = z.object({
  columnId: z.string(),
  data: ColumnShiftPayloadSchema,
});

export type ColumnCreate = z.infer<typeof ColumnCreateSchema>;
export type ColumnUpdatePayload = z.infer<typeof ColumnUpdatePayloadSchema>;
export type ColumnUpdate = z.infer<typeof ColumnUpdateSchema>;
export type ColumnShift = z.infer<typeof ColumnShiftSchema>;
export type ColumnShiftPayload = z.infer<typeof ColumnShiftPayloadSchema>;
