import { formatDistanceToNow } from "date-fns";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

import { CardMove } from "./card-move";
import { type ActivityItem as ActivityItemType } from "./types";
import { formatEntityType, getChangeDetailsForDisplay } from "./utils";

interface ActivityItemProps {
  item: ActivityItemType;
}

export function ActivityItem({ item }: ActivityItemProps) {
  const user = item.performedBy?.user;
  const isCardMove = item.entityType === "card" && item.action === "move";
  const details = getChangeDetailsForDisplay(
    item.changes,
    item.entityType,
    item.action,
  );

  const timestamp = formatDistanceToNow(new Date(item.createdAt));

  return (
    <div className="flex items-start gap-4 py-5">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage
          src={user?.imageUrl ?? undefined}
          alt={user?.name ?? "User"}
          className="object-cover"
        />
        <AvatarFallback className="text-xs">
          {user?.name?.charAt(0) ?? "U"}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <p className="break-words text-sm leading-relaxed">
          <span className="font-medium">{user?.name ?? "System"}</span>{" "}
          {isCardMove ? (
            <CardMove item={item} />
          ) : (
            <span className="text-muted-foreground">
              {item.action}d a {formatEntityType(item.entityType)}
              {details.title ? (
                <>
                  {" "}
                  <span className="font-medium text-foreground">
                    &ldquo;{details.title}&rdquo;
                  </span>
                </>
              ) : (
                details.text && (
                  <span className="font-medium text-foreground">
                    {details.text}
                  </span>
                )
              )}
            </span>
          )}
        </p>
        <p className="mt-1.5 font-mono text-[10px] text-muted-foreground">
          {timestamp} ago
        </p>
      </div>
    </div>
  );
}
