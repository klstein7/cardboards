// src/app/(project)/_types.ts
import { type RouterOutputs } from "~/trpc/init";

export type Card = RouterOutputs["card"]["list"][number];
export type CardComment = RouterOutputs["cardComment"]["list"][number];

export type Column = RouterOutputs["column"]["list"][number];
export type Board = RouterOutputs["board"]["list"][number];
export type Project = RouterOutputs["project"]["list"][number];
export type ProjectDetail = RouterOutputs["project"]["get"];
export type ProjectUser = RouterOutputs["projectUser"]["list"][number];
export type RecentProjectHistory =
  RouterOutputs["history"]["getRecent"][number];

export type Position = "first" | "last" | "middle" | "only";

export interface CardDragData {
  type: "card";
  payload: Card;
  index: number;
  columnId: string;
}

export interface CardDropData {
  type: "card";
  payload: Card;
  index: number;
  columnId: string;
}

export interface ColumnDropData {
  type: "column";
  payload: Column;
  columnId: string;
}

export type DragData = CardDragData;
