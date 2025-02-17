"use server";

import { authService } from "~/server/services";
import { columnService } from "~/server/services/column.service";

export async function list(boardId: string) {
  await authService.canAccessBoard(boardId);
  return columnService.list(boardId);
}
