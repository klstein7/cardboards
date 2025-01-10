import { createInsertSchema } from "drizzle-zod";
import { type z } from "zod";

import { projectUsers } from "~/server/db/schema";

export const ProjectUserCreateSchema = createInsertSchema(projectUsers);

export type ProjectUserCreate = z.infer<typeof ProjectUserCreateSchema>;
