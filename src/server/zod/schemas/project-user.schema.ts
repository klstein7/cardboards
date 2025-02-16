import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { projectUsers } from "~/server/db/schema";

export const ProjectUserCreateSchema = createInsertSchema(projectUsers);

export const ProjectUserUpdatePayloadSchema = ProjectUserCreateSchema.partial();

export const ProjectUserUpdateSchema = z.object({
  projectId: z.string(),
  userId: z.string(),
  data: ProjectUserUpdatePayloadSchema,
});

export type ProjectUserUpdate = z.infer<typeof ProjectUserUpdateSchema>;
export type ProjectUserCreate = z.infer<typeof ProjectUserCreateSchema>;
export type ProjectUserUpdatePayload = z.infer<
  typeof ProjectUserUpdatePayloadSchema
>;
