import "server-only";

import { eq } from "drizzle-orm";

import { type Database, db, type Transaction } from "../db";
import { invitations } from "../db/schema";
import { authService, projectUserService, userService } from "./";

async function create(projectId: string) {
  const projectUser = await authService.getCurrentProjectUser(projectId);

  const [invitation] = await db
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
}

async function get(invitationId: string) {
  const invitation = await db.query.invitations.findFirst({
    where: eq(invitations.id, invitationId),
  });

  if (!invitation) {
    throw new Error("Invitation not found");
  }

  return invitation;
}

async function accept(
  invitationId: string,
  userId: string,
  tx: Transaction | Database = db,
) {
  const invitation = await get(invitationId);

  if (invitation.expiresAt.getTime() < Date.now()) {
    throw new Error("Invitation expired");
  }

  await userService.syncCurrentUser(tx);

  await projectUserService.create(
    {
      projectId: invitation.projectId,
      userId,
      role: "member",
    },
    tx,
  );
}

export const invitationService = {
  create,
  get,
  accept,
};
