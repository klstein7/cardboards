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
    <span className="mx-1 inline-flex items-center gap-1 break-all rounded-md bg-muted/50 px-2 py-0.5 text-xs font-medium">
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
    <div className="group flex items-start gap-3 p-4 transition-colors hover:bg-muted/30">
      <Avatar className="h-8 w-8 shrink-0 border">
        <AvatarImage src={user?.imageUrl ?? undefined} />
        <AvatarFallback className="bg-primary/10 text-primary">
          {user?.name?.charAt(0) ?? "U"}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-1.5">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-1.5">
          <span className="font-medium">{user?.name ?? "System"}</span>
          <div className="flex-1 break-words text-sm">
            {isCardMove ? (
              <CardMove item={item} />
            ) : (
              <span className="inline-flex flex-wrap items-center gap-1">
                <span className={cn("font-medium", actionColor)}>
                  {item.action}d
                </span>{" "}
                a {formatEntityType(item.entityType)}
                {item.entityType === "card" && details.title ? (
                  <CardTitle title={details.title} />
                ) : (
                  details.text
                )}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{formatDistanceToNow(new Date(item.createdAt))} ago</span>
        </div>
      </div>
    </div>
  );
}
