import "server-only";

import { eq } from "drizzle-orm";

import { type Database, type Transaction } from "../db";
import { invitations } from "../db/schema";
import { projectUserService, userService } from "./";
import { BaseService } from "./base.service";

/**
 * Service for managing invitation-related operations
 */
class InvitationService extends BaseService {
  /**
   * Create a new invitation
   */
  async create(projectId: string) {
    return this.executeWithTx(async (txOrDb) => {
      const projectUser =
        await projectUserService.getCurrentProjectUser(projectId);

      const [invitation] = await txOrDb
        .insert(invitations)
        .values({
          projectId,
          invitedById: projectUser.id,
        })
        .returning();

      if (!invitation) {
        throw new Error("Failed to create invitation");
      }

      return invitation;
    });
  }

  /**
   * Get an invitation by ID
   */
  async get(invitationId: string) {
    return this.executeWithTx(async (txOrDb) => {
      const invitation = await txOrDb.query.invitations.findFirst({
        where: eq(invitations.id, invitationId),
      });

      if (!invitation) {
        throw new Error("Invitation not found");
      }

      return invitation;
    });
  }

  /**
   * Accept an invitation
   */
  async accept(
    invitationId: string,
    userId: string,
    tx: Transaction | Database = this.db,
  ) {
    return this.executeWithTx(async (txOrDb) => {
      const invitation = await this.get(invitationId);

      if (invitation.expiresAt.getTime() < Date.now()) {
        throw new Error("Invitation expired");
      }

      await userService.syncCurrentUser(txOrDb);

      // Create the project user and return it
      const projectUser = await projectUserService.create(
        {
          projectId: invitation.projectId,
          userId,
          role: "member",
        },
        txOrDb,
      );

      return projectUser;
    }, tx);
  }
}

export const invitationService = new InvitationService();
