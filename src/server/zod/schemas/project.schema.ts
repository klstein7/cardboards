import { createInsertSchema } from "drizzle-zod";
import { type z } from "zod";

import { projects } from "~/server/db/schema";

export const ProjectCreateSchema = createInsertSchema(projects);
export const ProjectUpdateSchema = createInsertSchema(projects).partial();

export type ProjectCreate = z.infer<typeof ProjectCreateSchema>;
export type ProjectUpdate = z.infer<typeof ProjectUpdateSchema>;
