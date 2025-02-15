"use server";

import { auth } from "@clerk/nextjs/server";

import { invitationService } from "~/server/services";

export async function create(projectId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  return invitationService.create(projectId, userId);
}

export async function get(invitationId: string) {
  return invitationService.get(invitationId);
}
