"use server";

import { cardService } from "~/server/services";
import {
  type CardCreate,
  CardCreateSchema,
  type CardMove,
  CardMoveSchema,
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
