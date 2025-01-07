import { type api } from "~/server/api";

export interface DragData {
  type: "card";
  payload: Awaited<ReturnType<typeof api.card.list>>[number];
}

interface CardDropData {
  type: "card";
  payload: Awaited<ReturnType<typeof api.card.list>>[number];
}

interface ColumnDropData {
  type: "column";
  payload: Awaited<ReturnType<typeof api.column.list>>[number];
}

export type DropData = CardDropData | ColumnDropData;
