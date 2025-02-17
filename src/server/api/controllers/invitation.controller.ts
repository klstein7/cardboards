"use server";

import { auth } from "@clerk/nextjs/server";

import { authService, invitationService } from "~/server/services";

export async function create(projectId: string) {
  await authService.requireProjectAdmin(projectId);

  return invitationService.create(projectId);
}

export async function get(invitationId: string) {
  return invitationService.get(invitationId);
}

export async function accept(invitationId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  return invitationService.accept(invitationId, userId);
}
