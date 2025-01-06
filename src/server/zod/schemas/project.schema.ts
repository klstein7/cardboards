import { createInsertSchema } from "drizzle-zod";
import { type z } from "zod";
import { projects } from "~/server/db/schema";

export const ProjectCreateSchema = createInsertSchema(projects);

export type ProjectCreate = z.infer<typeof ProjectCreateSchema>;
