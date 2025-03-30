import { formatDistanceToNow } from "date-fns";
import {
  ArrowRightLeft,
  Clock,
  FileText,
  Pencil,
  PlusCircle,
  Trash2,
} from "lucide-react";

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

// Define a map for action icons
const actionIcons: Record<ActivityItemType["action"], React.ElementType> = {
  create: PlusCircle,
  update: Pencil,
  delete: Trash2,
  move: ArrowRightLeft,
};

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
          <span className="mx-1 inline-flex items-center gap-1.5 break-all rounded-md bg-muted/70 px-2.5 py-0.5 text-xs font-medium shadow-sm transition-all duration-200 ease-in-out group-hover:bg-muted group-hover:shadow">
            <FileText className="h-3 w-3 shrink-0 text-primary/70 opacity-80 transition-colors duration-200 ease-in-out group-hover:text-primary/90" />
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
  const ActionIcon = actionIcons[item.action];

  return (
    <div className="group flex items-start gap-4 rounded-lg border-b p-4 transition-all duration-200 ease-in-out last:border-b-0 hover:bg-muted/50 hover:shadow-sm">
      <Avatar className="h-10 w-10 shrink-0 border border-border/50 shadow-sm transition-all duration-200 ease-in-out group-hover:border-border/80 group-hover:shadow-md">
        <AvatarImage
          src={user?.imageUrl ?? undefined}
          alt={user?.name ?? "User"}
          className="object-cover opacity-95 transition-opacity duration-200 ease-in-out group-hover:opacity-100"
        />
        <AvatarFallback className="bg-primary/10 text-primary">
          {user?.name?.charAt(0) ?? "U"}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-3 pt-0.5">
        <div className="flex flex-col space-y-1.5 sm:flex-row sm:items-baseline sm:gap-2.5 sm:space-y-0">
          <span className="font-medium text-foreground/90 transition-colors duration-200 ease-in-out group-hover:text-foreground">
            {user?.name ?? "System"}
          </span>
          <div className="flex-1 break-words text-sm text-foreground/80 transition-colors duration-200 ease-in-out group-hover:text-foreground/90">
            {isCardMove ? (
              <CardMove item={item} />
            ) : (
              <span className="inline-flex flex-wrap items-center gap-1.5">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-medium shadow-sm transition-all duration-200 ease-in-out group-hover:shadow",
                    actionColor,
                  )}
                >
                  <ActionIcon className="h-3 w-3" />
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

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70 transition-colors duration-200 ease-in-out group-hover:text-muted-foreground">
          <Clock className="h-3.5 w-3.5 text-muted-foreground/50 transition-colors duration-200 ease-in-out group-hover:text-muted-foreground/80" />
          <span>{timestamp} ago</span>
        </div>
      </div>
    </div>
  );
}
