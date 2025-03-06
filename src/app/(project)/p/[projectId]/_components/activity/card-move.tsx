import { ArrowRight, FileText } from "lucide-react";

import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";

import { type ActivityItem } from "./types";
import {
  formatEntityType,
  getActionColor,
  parseCardMoveChanges,
} from "./utils";

interface CardMoveProps {
  item: ActivityItem;
}

/**
 * Renders a card move activity with enhanced column display
 */
export function CardMove({ item }: CardMoveProps) {
  const parsedChanges = parseCardMoveChanges(item.changes);
  if (!parsedChanges) {
    return (
      <span>
        <span className={cn("font-medium", getActionColor(item.action))}>
          {item.action}d
        </span>{" "}
        a {formatEntityType(item.entityType)}
      </span>
    );
  }

  const hasCardTitle = !!parsedChanges.cardTitle;

  // Render the card title
  const renderCardTitle = () => {
    if (!hasCardTitle) return null;
    return (
      <span className="mx-1 inline-flex items-center gap-1 break-all rounded-md bg-muted/50 px-2 py-0.5 text-xs font-medium">
        <FileText className="h-3 w-3 shrink-0 opacity-70" />
        <span className="line-clamp-1">{parsedChanges.cardTitle}</span>
      </span>
    );
  };

  // Same column move
  if (
    parsedChanges.sameName ||
    (parsedChanges.from?.columnName &&
      parsedChanges.to?.columnName &&
      parsedChanges.from.columnName === parsedChanges.to.columnName)
  ) {
    return (
      <span>
        <span className={cn("font-medium", getActionColor(item.action))}>
          {item.action}d
        </span>{" "}
        a {formatEntityType(item.entityType)}
        {hasCardTitle && renderCardTitle()} within{" "}
        <Badge variant="outline" className="font-normal">
          {parsedChanges.from?.columnName ?? "a column"}
        </Badge>
      </span>
    );
  }

  // Different column move
  if (parsedChanges.from?.columnName && parsedChanges.to?.columnName) {
    return (
      <span>
        <span className={cn("font-medium", getActionColor(item.action))}>
          {item.action}d
        </span>{" "}
        a {formatEntityType(item.entityType)}
        {hasCardTitle && renderCardTitle()} from{" "}
        <Badge variant="outline" className="font-normal">
          {parsedChanges.from.columnName}
        </Badge>{" "}
        <ArrowRight className="mx-1 inline h-3 w-3" />{" "}
        <Badge variant="outline" className="font-normal">
          {parsedChanges.to.columnName}
        </Badge>
      </span>
    );
  }

  // Fallback case
  return (
    <span>
      <span className={cn("font-medium", getActionColor(item.action))}>
        {item.action}d
      </span>{" "}
      a {formatEntityType(item.entityType)}
      {hasCardTitle && renderCardTitle()}
      {parsedChanges.from &&
      parsedChanges.to &&
      parsedChanges.from.columnId !== parsedChanges.to.columnId
        ? " to a different column"
        : " within the same column"}
    </span>
  );
}
