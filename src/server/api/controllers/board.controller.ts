"use server";

import { boardService } from "~/server/services";
import { type BoardCreate, BoardCreateSchema } from "~/server/zod";

export async function create(data: BoardCreate) {
  return boardService.create(BoardCreateSchema.parse(data));
}

export async function list(projectId: string) {
  return boardService.list(projectId);
}

export async function get(boardId: string) {
  return boardService.get(boardId);
}
