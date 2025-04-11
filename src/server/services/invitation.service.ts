import "server-only";

import { eq } from "drizzle-orm";

import { type Database, type Transaction } from "../db";
import { invitations } from "../db/schema";
import { BaseService } from "./base.service";
import { type ProjectUserService } from "./project-user.service";
import { type UserService } from "./user.service";

/**
 * Service for managing invitation-related operations
 */
export class InvitationService extends BaseService {
  private readonly projectUserService: ProjectUserService;
  private readonly userService: UserService;

  constructor(
    db: Database,
    projectUserService: ProjectUserService,
    userService: UserService,
  ) {
    super(db);
    this.projectUserService = projectUserService;
    this.userService = userService;
  }

  /**
   * Create a new invitation
   */
  async create(projectId: string, tx?: Transaction | Database) {
    return this.executeWithTx(async (txOrDb) => {
      const projectUser = await this.projectUserService.getCurrentProjectUser(
        projectId,
        txOrDb,
      );

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
    }, tx ?? this.db);
  }

  /**
   * Get an invitation by ID
   */
  async get(invitationId: string, tx?: Transaction | Database) {
    return this.executeWithTx(async (txOrDb) => {
      const invitation = await txOrDb.query.invitations.findFirst({
        where: eq(invitations.id, invitationId),
      });

      if (!invitation) {
        throw new Error("Invitation not found");
      }

      return invitation;
    }, tx ?? this.db);
  }

  /**
   * Accept an invitation
   */
  async accept(
    invitationId: string,
    userId: string,
    tx?: Transaction | Database,
  ) {
    return this.executeWithTx(async (txOrDb) => {
      const invitation = await this.get(invitationId, txOrDb);

      if (invitation.expiresAt.getTime() < Date.now()) {
        throw new Error("Invitation expired");
      }

      await this.userService.syncCurrentUser(txOrDb);

      const projectUser = await this.projectUserService.create(
        {
          projectId: invitation.projectId,
          userId,
          role: "member",
        },
        txOrDb,
      );

      return projectUser;
    }, tx ?? this.db);
  }
}
