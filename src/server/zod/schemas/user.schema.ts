import { createInsertSchema } from "drizzle-zod";
import { type z } from "zod";

import { users } from "~/server/db/schema";

export const UserSyncSchema = createInsertSchema(users);

export type UserSync = z.infer<typeof UserSyncSchema>;
