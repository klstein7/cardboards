import { formatDistanceToNow } from "date-fns";
import { Clock, FileText } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
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
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="mx-1 inline-flex items-center gap-1.5 break-all rounded-md bg-muted/70 px-2 py-0.5 text-xs font-medium shadow-sm transition-colors group-hover:bg-muted/90">
            <FileText className="h-3 w-3 shrink-0 opacity-80" />
            <span className="line-clamp-1">{title}</span>
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" align="center" className="max-w-[300px]">
          <p className="break-words text-xs">{title}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
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

  const timestamp = formatDistanceToNow(new Date(item.createdAt));

  return (
    <div className="group flex items-start gap-4 rounded-lg p-4 transition-all hover:bg-muted/40 hover:shadow-sm">
      <Avatar className="h-9 w-9 shrink-0 border border-border/50 shadow-sm transition-all group-hover:border-border/80 group-hover:shadow">
        <AvatarImage
          src={user?.imageUrl ?? undefined}
          alt={user?.name ?? "User"}
        />
        <AvatarFallback className="bg-primary/10 text-primary">
          {user?.name?.charAt(0) ?? "U"}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-2.5 pt-0.5">
        <div className="flex flex-col space-y-1.5 sm:flex-row sm:items-baseline sm:gap-2 sm:space-y-0">
          <span className="font-medium text-foreground/90 transition-colors group-hover:text-foreground">
            {user?.name ?? "System"}
          </span>
          <div className="flex-1 break-words text-sm text-foreground/80 transition-colors group-hover:text-foreground/90">
            {isCardMove ? (
              <CardMove item={item} />
            ) : (
              <span className="inline-flex flex-wrap items-center gap-1.5">
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 font-medium shadow-sm",
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

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70 transition-colors group-hover:text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{timestamp} ago</span>
        </div>
      </div>
    </div>
  );
}
