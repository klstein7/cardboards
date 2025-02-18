"use server";

import { authService, cardService } from "~/server/services";
import {
  type CardCreate,
  type CardCreateMany,
  CardCreateManySchema,
  CardCreateSchema,
  type CardGenerate,
  CardGenerateSchema,
  type CardMove,
  CardMoveSchema,
  type CardUpdate,
  CardUpdateSchema,
} from "~/server/zod";

export async function create(data: CardCreate) {
  const parsed = CardCreateSchema.parse(data);
  await authService.canAccessColumn(parsed.columnId);
  return cardService.create(parsed);
}

export async function createMany(data: CardCreateMany) {
  const { boardId, data: payload } = CardCreateManySchema.parse(data);
  await authService.canAccessBoard(boardId);
  return cardService.createMany(boardId, payload);
}

export async function get(cardId: number) {
  await authService.canAccessCard(cardId);
  return cardService.get(cardId);
}

export async function update(data: CardUpdate) {
  const { cardId, data: payload } = CardUpdateSchema.parse(data);
  await authService.canAccessCard(cardId);
  return cardService.update(cardId, payload);
}

export async function move(data: CardMove) {
  const parsed = CardMoveSchema.parse(data);
  await authService.canAccessCard(parsed.cardId);
  return cardService.move(parsed);
}

export async function del(cardId: number) {
  await authService.canAccessCard(cardId);
  return cardService.del(cardId);
}

export async function list(columnId: string) {
  await authService.canAccessColumn(columnId);
  return cardService.list(columnId);
}

export async function generate(data: CardGenerate) {
  const { boardId, prompt } = CardGenerateSchema.parse(data);
  await authService.canAccessBoard(boardId);
  return cardService.generate(boardId, prompt);
}

export async function assignToCurrentUser(cardId: number) {
  await authService.canAccessCard(cardId);
  return cardService.assignToCurrentUser(cardId);
}
