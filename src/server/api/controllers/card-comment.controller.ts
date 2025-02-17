"use server";

import { authService, cardCommentService } from "~/server/services";
import {
  type CardCommentCreate,
  type CardCommentUpdate,
  CardCommentUpdateSchema,
} from "~/server/zod";

export async function create(data: CardCommentCreate) {
  await authService.canAccessCard(data.cardId);
  return cardCommentService.create(data);
}

export async function list(cardId: number) {
  await authService.canAccessCard(cardId);
  return cardCommentService.list(cardId);
}

export async function remove(id: string) {
  const comment = await cardCommentService.get(id);
  const projectUser = await authService.canAccessCard(comment.cardId);
  if (
    projectUser.role !== "admin" ||
    projectUser.id !== comment.projectUserId
  ) {
    throw new Error("Unauthorized");
  }
  return cardCommentService.remove(id);
}

export async function update(data: CardCommentUpdate) {
  const { cardCommentId, data: payload } = CardCommentUpdateSchema.parse(data);
  const comment = await cardCommentService.get(cardCommentId);
  await authService.canAccessCard(comment.cardId);
  return cardCommentService.update(cardCommentId, payload);
}
