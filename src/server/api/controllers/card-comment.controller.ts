"use server";

import { cardCommentService } from "~/server/services";
import {
  type CardCommentCreate,
  type CardCommentUpdate,
  CardCommentUpdateSchema,
} from "~/server/zod";

export async function create(data: CardCommentCreate) {
  return cardCommentService.create(data);
}

export async function list(cardId: number) {
  return cardCommentService.list(cardId);
}

export async function remove(id: string) {
  return cardCommentService.remove(id);
}

export async function update(data: CardCommentUpdate) {
  const { cardCommentId, data: payload } = CardCommentUpdateSchema.parse(data);
  return cardCommentService.update(cardCommentId, payload);
}
