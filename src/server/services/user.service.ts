import "server-only";

import { type Database, db, type Transaction } from "../db";
import { users } from "../db/schema";
import { type UserSync } from "../zod";

async function sync(data: UserSync, tx: Transaction | Database = db) {
  const [user] = await tx
    .insert(users)
    .values(data)
    .onConflictDoUpdate({
      target: [users.email],
      set: {
        ...data,
      },
    })
    .returning();

  if (!user) {
    throw new Error("Failed to sync user");
  }

  return user;
}

export const userService = {
  sync,
};
