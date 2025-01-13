"use server";

import { cardService } from "~/server/services";
import {
  type CardCreate,
  CardCreateSchema,
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

export async function list(data: CardList) {
  const { columnId, search } = CardListSchema.parse(data);
  return cardService.list(columnId, search);
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
