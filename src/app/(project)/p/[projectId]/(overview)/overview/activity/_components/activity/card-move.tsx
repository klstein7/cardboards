import { ArrowRight, ArrowRightLeft, FileText } from "lucide-react";

import { Badge } from "~/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
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
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-medium shadow-sm",
            getActionColor(item.action),
          )}
        >
          <ArrowRightLeft className="h-3 w-3" />
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
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="mx-1 inline-flex items-center gap-1.5 break-all rounded-md bg-muted/70 px-2 py-0.5 text-xs font-medium shadow-sm transition-colors group-hover:bg-muted/90">
              <FileText className="h-3 w-3 shrink-0 opacity-80" />
              <span className="line-clamp-1">{parsedChanges.cardTitle}</span>
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" align="center" className="max-w-[300px]">
            <p className="break-words text-xs">{parsedChanges.cardTitle}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
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
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-medium shadow-sm",
            getActionColor(item.action),
          )}
        >
          <ArrowRightLeft className="h-3 w-3" />
          {item.action}d
        </span>{" "}
        a {formatEntityType(item.entityType)}
        {hasCardTitle && renderCardTitle()} within{" "}
        <Badge
          variant="outline"
          className="border-border/70 font-normal shadow-sm transition-colors group-hover:border-border/90"
        >
          {parsedChanges.from?.columnName ?? "a column"}
        </Badge>
      </span>
    );
  }

  // Different column move
  if (parsedChanges.from?.columnName && parsedChanges.to?.columnName) {
    return (
      <span>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-medium shadow-sm",
            getActionColor(item.action),
          )}
        >
          <ArrowRightLeft className="h-3 w-3" />
          {item.action}d
        </span>{" "}
        a {formatEntityType(item.entityType)}
        {hasCardTitle && renderCardTitle()} from{" "}
        <Badge
          variant="outline"
          className="border-border/70 font-normal shadow-sm transition-colors group-hover:border-border/90"
        >
          {parsedChanges.from.columnName}
        </Badge>{" "}
        <ArrowRight className="mx-1 inline h-3.5 w-3.5 text-muted-foreground/70" />{" "}
        <Badge
          variant="outline"
          className="border-border/70 font-normal shadow-sm transition-colors group-hover:border-border/90"
        >
          {parsedChanges.to.columnName}
        </Badge>
      </span>
    );
  }

  // Fallback case
  return (
    <span>
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-medium shadow-sm",
          getActionColor(item.action),
        )}
      >
        <ArrowRightLeft className="h-3 w-3" />
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
