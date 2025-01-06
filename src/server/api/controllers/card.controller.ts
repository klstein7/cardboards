"use server";

import { cardService } from "~/server/services";
import { CardCreateSchema, type CardCreate } from "~/server/zod";

export async function create(data: CardCreate) {
  return cardService.create(CardCreateSchema.parse(data));
}

export async function list(columnId: string) {
  return cardService.list(columnId);
}
