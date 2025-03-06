import {
  type ActionType,
  type ActivityCardMoveDetails,
  type ChangeDetails,
  type ChangesData,
  type EntityType,
} from "./types";

/**
 * Format entity type for display
 */
export function formatEntityType(type: EntityType): string {
  switch (type) {
    case "project":
      return "project";
    case "board":
      return "board";
    case "column":
      return "column";
    case "card":
      return "card";
    case "card_comment":
      return "comment";
    case "project_user":
      return "team member";
    case "invitation":
      return "invitation";
    default:
      return type.replace("_", " ");
  }
}

/**
 * Get action color based on action type
 */
export function getActionColor(action: ActionType): string {
  switch (action) {
    case "create":
      return "text-emerald-500";
    case "update":
      return "text-blue-500";
    case "delete":
      return "text-rose-500";
    case "move":
      return "text-amber-500";
    default:
      return "";
  }
}

/**
 * Parse changes and get relevant details for display
 */
export function getChangeDetailsForDisplay(
  changes: string | null,
  entityType: EntityType,
  action: ActionType,
): ChangeDetails {
  if (!changes) {
    if (action === "delete" && entityType === "card") {
      return { text: " that was removed from the board" };
    }
    return {};
  }

  try {
    const parsedChanges = JSON.parse(changes) as ChangesData;

    if (entityType === "card") {
      if (action === "create" || action === "update") {
        if (parsedChanges.title) {
          // Handle both string and object with new property
          const titleValue =
            typeof parsedChanges.title === "object" &&
            "new" in parsedChanges.title
              ? (parsedChanges.title.new ?? "")
              : parsedChanges.title;

          // Ensure we're working with a string
          const titleString = typeof titleValue === "string" ? titleValue : "";
          return { title: titleString };
        }
        if (parsedChanges.after?.title) {
          const titleString =
            typeof parsedChanges.after.title === "string"
              ? parsedChanges.after.title
              : "";
          return { title: titleString };
        }
      } else if (action === "delete") {
        if (parsedChanges.before?.title) {
          const titleString =
            typeof parsedChanges.before.title === "string"
              ? parsedChanges.before.title
              : "";
          return { title: titleString };
        }
      }
    } else if (
      entityType === "board" ||
      entityType === "column" ||
      entityType === "project"
    ) {
      let nameValue: unknown = undefined;

      if (parsedChanges.name) {
        // Handle both string and object with new property
        nameValue =
          typeof parsedChanges.name === "object" && "new" in parsedChanges.name
            ? parsedChanges.name.new
            : parsedChanges.name;
      } else if (parsedChanges.after?.name) {
        nameValue = parsedChanges.after.name;
      }

      // Only proceed if we have a valid string
      if (typeof nameValue === "string" && nameValue) {
        return { text: ` "${nameValue}"` };
      }
    }

    return {};
  } catch (e) {
    console.error("Error parsing changes:", e);
    return {};
  }
}

/**
 * Parse changes for card move events
 */
export function parseCardMoveChanges(
  changes: string | null,
): ActivityCardMoveDetails | null {
  if (!changes) return null;

  try {
    return JSON.parse(changes) as ActivityCardMoveDetails;
  } catch (e) {
    console.error("Error parsing card move changes:", e);
    return null;
  }
}
