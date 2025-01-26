// src/app/(project)/_types.ts
import { type api } from "~/server/api";

export type Card = Awaited<ReturnType<typeof api.card.list>>[number];
export type CardComment = Awaited<
  ReturnType<typeof api.cardComment.list>
>[number];

export type Column = Awaited<ReturnType<typeof api.column.list>>[number];
export type Board = Awaited<ReturnType<typeof api.board.list>>[number];
export type Project = Awaited<ReturnType<typeof api.project.list>>[number];
export type ProjectUser = Awaited<
  ReturnType<typeof api.projectUser.list>
>[number];

export type Position = "first" | "last" | "middle" | "only";

export interface CardDragData {
  type: "card";
  payload: Card;
  index: number;
  columnId: string;
  instanceId: symbol;
}

export interface CardDropData {
  type: "card";
  payload: Card;
  columnId: string;
}

export interface ColumnDropData {
  type: "column";
  payload: Column;
  columnId: string;
}

// General drag data type that can be either card or column
export type DragData = CardDragData;

// General drop data type that can be either card drop or column drop
export type DropData = CardDropData | ColumnDropData;

// Type guard to check if drop data is for a card
export function isCardDropData(data: DropData): data is CardDropData {
  return data.type === "card";
}

// Type guard to check if drop data is for a column
export function isColumnDropData(data: DropData): data is ColumnDropData {
  return data.type === "column";
}

// Interface for the move card operation
export interface MoveCardOperation {
  cardId: string;
  sourceColumnId: string;
  destinationColumnId: string;
  newOrder: number;
}

// Interface for card reorder operation within the same column
export interface ReorderCardOperation {
  columnId: string;
  startIndex: number;
  finishIndex: number;
}

// Custom error types for drag and drop operations
export class DragDropError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DragDropError";
  }
}

export class InvalidDropTargetError extends DragDropError {
  constructor(message = "Invalid drop target") {
    super(message);
    this.name = "InvalidDropTargetError";
  }
}

export class InvalidDragSourceError extends DragDropError {
  constructor(message = "Invalid drag source") {
    super(message);
    this.name = "InvalidDragSourceError";
  }
}
