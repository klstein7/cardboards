import "server-only";

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { db } from "../db";
import { invitations } from "../db/schema";
import { projectUserService } from "./";

async function create(projectId: string, invitedById: string) {
  const projectUser = await projectUserService.getByProjectIdAndUserId(
    projectId,
    invitedById,
  );

  if (!projectUser) {
    throw new Error("Project user not found");
  }

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

export const invitationService = {
  create,
  get,
};
