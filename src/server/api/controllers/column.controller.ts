"use server";

import { columnService } from "~/server/services/column.service";

export async function list(boardId: string) {
  return columnService.list(boardId);
}
