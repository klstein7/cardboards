"use server";

import { cardService } from "~/server/services";
import {
  type CardCreate,
  type CardCreateMany,
  CardCreateManySchema,
  CardCreateSchema,
  type CardGenerate,
  CardGenerateSchema,
  type CardList,
  CardListSchema,
  type CardMove,
  CardMoveSchema,
  type CardUpdate,
  CardUpdateSchema,
} from "~/server/zod";

export async function create(data: CardCreate) {
  return cardService.create(CardCreateSchema.parse(data));
}

export async function list(columnId: string) {
  return cardService.list(columnId);
}

export async function move(data: CardMove) {
  return cardService.move(CardMoveSchema.parse(data));
}

export async function get(cardId: number) {
  return cardService.get(cardId);
}

export async function update(data: CardUpdate) {
  const { cardId, data: payload } = CardUpdateSchema.parse(data);
  return cardService.update(cardId, payload);
}

export async function generate(data: CardGenerate) {
  const { prompt, boardId } = CardGenerateSchema.parse(data);
  return cardService.generate(boardId, prompt);
}

export async function createMany(data: CardCreateMany) {
  const { boardId, data: payload } = CardCreateManySchema.parse(data);
  return cardService.createMany(boardId, payload);
}

export async function del(cardId: number) {
  return cardService.del(cardId);
}
