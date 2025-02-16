import "server-only";

import { currentUser } from "@clerk/nextjs/server";

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

async function syncCurrentUser(tx: Transaction | Database = db) {
  const user = await currentUser();

  if (!user) {
    throw new Error("No current user found");
  }

  const primaryEmailAddress = user.emailAddresses.find(
    (emailAddress) => emailAddress.id === user.primaryEmailAddressId,
  );

  if (!primaryEmailAddress) {
    throw new Error("No primary email address found");
  }

  await sync(
    {
      id: user.id,
      email: primaryEmailAddress.emailAddress,
      name: user.fullName ?? "",
      imageUrl: user.imageUrl,
    },
    tx,
  );
}

export const userService = {
  sync,
  syncCurrentUser,
};
