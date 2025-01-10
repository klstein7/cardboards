import { createInsertSchema } from "drizzle-zod";
import { type z } from "zod";

import { columns } from "~/server/db/schema";

export const ColumnCreateSchema = createInsertSchema(columns);

export type ColumnCreate = z.infer<typeof ColumnCreateSchema>;
