"use server";

import { boardService } from "~/server/services";
import {
  type BoardCreate,
  BoardCreateSchema,
  type BoardUpdate,
  BoardUpdateSchema,
} from "~/server/zod";

export async function create(data: BoardCreate) {
  return boardService.create(BoardCreateSchema.parse(data));
}

export async function list(projectId: string) {
  return boardService.list(projectId);
}

export async function get(boardId: string) {
  return boardService.get(boardId);
}

export async function update(data: BoardUpdate) {
  const { boardId, data: payload } = BoardUpdateSchema.parse(data);
  return boardService.update(boardId, payload);
}

export async function del(boardId: string) {
  return boardService.del(boardId);
}
