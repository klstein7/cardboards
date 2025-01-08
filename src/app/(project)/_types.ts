import { type api } from "~/server/api";

export type Card = Awaited<ReturnType<typeof api.card.list>>[number];
export type Column = Awaited<ReturnType<typeof api.column.list>>[number];
export type Project = Awaited<ReturnType<typeof api.project.list>>[number];

export interface DragData {
  type: "card";
  payload: Card;
}

interface CardDropData {
  type: "card";
  payload: Card;
}

interface ColumnDropData {
  type: "column";
  payload: Column;
}

export type DropData = CardDropData | ColumnDropData;
