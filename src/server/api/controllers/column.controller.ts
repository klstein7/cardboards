"use server";

import { authService } from "~/server/services";
import { columnService } from "~/server/services/column.service";
import {
  type ColumnCreate,
  type ColumnShift,
  type ColumnUpdate,
} from "~/server/zod";

export async function list(boardId: string) {
  await authService.canAccessBoard(boardId);
  return columnService.list(boardId);
}

export async function update(data: ColumnUpdate) {
  const { columnId, data: payload } = data;
  await authService.canAccessColumn(columnId);
  return columnService.update(columnId, payload);
}

export async function shift(data: ColumnShift) {
  const { columnId, data: payload } = data;
  await authService.canAccessColumn(columnId);
  return columnService.shift(columnId, payload);
}

export async function create(data: ColumnCreate) {
  await authService.canAccessBoard(data.boardId);
  return columnService.create(data);
}
