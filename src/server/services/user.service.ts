import "server-only";

import { db } from "../db";
import { users } from "../db/schema";
import { type UserSync } from "../zod";

async function sync(data: UserSync) {
  const [user] = await db
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
