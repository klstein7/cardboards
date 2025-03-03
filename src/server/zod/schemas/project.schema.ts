import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { projects } from "~/server/db/schema";

export const ProjectCreateSchema = createInsertSchema(projects);
export const ProjectUpdatePayloadSchema =
  createInsertSchema(projects).partial();
export const ProjectUpdateSchema = z.object({
  projectId: z.string(),
  data: ProjectUpdatePayloadSchema,
});

export type ProjectCreate = z.infer<typeof ProjectCreateSchema>;
export type ProjectUpdatePayload = z.infer<typeof ProjectUpdatePayloadSchema>;
export type ProjectUpdate = z.infer<typeof ProjectUpdateSchema>;
