import { formatDistanceToNow } from "date-fns";
import { Clock, FileText } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { cn } from "~/lib/utils";

import { CardMove } from "./card-move";
import { type ActivityItem as ActivityItemType } from "./types";
import {
  formatEntityType,
  getActionColor,
  getChangeDetailsForDisplay,
} from "./utils";

interface ActivityItemProps {
  item: ActivityItemType;
}

/**
 * Renders a card title with appropriate styling and icon
 */
function CardTitle({ title }: { title: string }) {
  return (
    <span className="mx-1 inline-flex items-center gap-1.5 break-all rounded-md bg-muted/60 px-2 py-0.5 text-xs font-medium shadow-sm transition-colors group-hover:bg-muted/80">
      <FileText className="h-3 w-3 shrink-0 opacity-70" />
      <span className="line-clamp-1">{title}</span>
    </span>
  );
}

/**
 * Renders an individual activity item
 */
export function ActivityItem({ item }: ActivityItemProps) {
  const user = item.performedBy?.user;
  const actionColor = getActionColor(item.action);
  const isCardMove = item.entityType === "card" && item.action === "move";
  const details = getChangeDetailsForDisplay(
    item.changes,
    item.entityType,
    item.action,
  );

  return (
    <div className="group flex items-start gap-4 rounded-lg p-3 transition-all hover:bg-muted/40 hover:shadow-sm">
      <Avatar className="h-9 w-9 shrink-0 border border-border/50 shadow-sm transition-all group-hover:border-border/80 group-hover:shadow">
        <AvatarImage src={user?.imageUrl ?? undefined} />
        <AvatarFallback className="bg-primary/10 text-primary">
          {user?.name?.charAt(0) ?? "U"}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-2">
        <div className="flex flex-col space-y-1 sm:flex-row sm:items-baseline sm:gap-2 sm:space-y-0">
          <span className="font-medium text-foreground/90 group-hover:text-foreground">
            {user?.name ?? "System"}
          </span>
          <div className="flex-1 break-words text-sm text-foreground/80 group-hover:text-foreground/90">
            {isCardMove ? (
              <CardMove item={item} />
            ) : (
              <span className="inline-flex flex-wrap items-center gap-1.5">
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 font-medium",
                    actionColor,
                  )}
                >
                  {item.action}d
                </span>
                <span className="text-muted-foreground">
                  a {formatEntityType(item.entityType)}
                </span>
                {item.entityType === "card" && details.title ? (
                  <CardTitle title={details.title} />
                ) : (
                  <span className="font-medium">{details.text}</span>
                )}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80 group-hover:text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{formatDistanceToNow(new Date(item.createdAt))} ago</span>
        </div>
      </div>
    </div>
  );
}
