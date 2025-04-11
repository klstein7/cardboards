import "server-only";

import { currentUser } from "@clerk/nextjs/server";

import { type Database, type Transaction } from "../db";
import { users } from "../db/schema";
import { type UserSync } from "../zod";
import { BaseService } from "./base.service";

/**
 * Service for managing user-related operations
 */
export class UserService extends BaseService {
  constructor(db: Database) {
    super(db);
  }

  /**
   * Synchronize a user record in the database
   */
  async sync(data: UserSync, tx?: Transaction | Database) {
    return this.executeWithTx(async (txOrDb) => {
      const [user] = await txOrDb
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
    }, tx ?? this.db);
  }

  /**
   * Synchronize the current authenticated user
   */
  async syncCurrentUser(tx?: Transaction | Database) {
    return this.executeWithTx(async (txOrDb) => {
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

      await this.sync(
        {
          id: user.id,
          email: primaryEmailAddress.emailAddress,
          name: user.fullName ?? "",
          imageUrl: user.imageUrl,
        },
        txOrDb,
      );
    }, tx ?? this.db);
  }
}
