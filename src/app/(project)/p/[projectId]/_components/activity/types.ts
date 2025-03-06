export type EntityType =
  | "project"
  | "board"
  | "column"
  | "card"
  | "user"
  | "project_user"
  | "invitation"
  | "card_comment";

export type ActionType = "create" | "update" | "delete" | "move";

export interface ActivityItem {
  id: string;
  action: ActionType;
  entityType: EntityType;
  entityId: string;
  changes: string | null;
  createdAt: Date | string;
  projectId: string | null;
  performedById: string | null;
  performedBy?: {
    user: {
      name?: string;
      imageUrl?: string | null;
    };
  } | null;
}

export interface ActivityCardMoveDetails {
  cardTitle?: string;
  from?: {
    columnId: string;
    columnName: string;
  };
  to?: {
    columnId: string;
    columnName: string;
  };
  sameName?: boolean;
}

export interface FieldChange<T> {
  new?: T;
  old?: T;
}

export interface EntityData {
  title?: string;
  name?: string;
  [key: string]: string | number | boolean | undefined | null;
}

export interface ChangesData {
  title?: string | FieldChange<string>;
  name?: string | FieldChange<string>;
  before?: EntityData;
  after?: EntityData;
  [key: string]:
    | string
    | number
    | boolean
    | undefined
    | null
    | EntityData
    | FieldChange<string>;
}

export interface ChangeDetails {
  title?: string;
  text?: string;
}
