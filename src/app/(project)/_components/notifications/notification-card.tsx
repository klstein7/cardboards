"use client";

import { CheckCircle2, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import {
  useDeleteNotification,
  useMarkNotificationAsRead,
} from "~/lib/hooks/notification";
import { cn } from "~/lib/utils";
import { type Notification } from "~/server/zod";

import { timeAgo } from "./notification-utils";

interface NotificationCardProps {
  notification: Notification;
  index?: number;
}

export function NotificationCard({
  notification,
  index = 0,
}: NotificationCardProps) {
  const [, setIsHovering] = useState(false);
  const { mutate: markAsRead } = useMarkNotificationAsRead();
  const { mutate: deleteNotification } = useDeleteNotification();

  const isUnread = !notification.isRead;

  // Calculate staggered animation delay based on index
  const animationDelay = `${index * 50}ms`;

  const handleMarkAsRead = () => {
    if (notification.isRead) return;
    markAsRead(notification.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering mark as read
    deleteNotification(notification.id);
  };

  return (
    <Card
      className={cn(
        "motion-safe:animate-fadeIn group relative flex cursor-pointer select-none flex-col overflow-hidden border-border/60 bg-card/95 transition-all duration-200 hover:bg-muted/40 dark:border-border/80 dark:bg-card/90 dark:hover:bg-muted/20",
        isUnread && "border-l-2 border-l-primary",
      )}
      style={{
        animationDelay,
        animationFillMode: "both",
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={handleMarkAsRead}
    >
      <div className="flex items-start gap-3 p-3">
        <div className="w-2 shrink-0">
          {isUnread && (
            <div className="mt-[5px] h-2 w-2 shrink-0 rounded-full bg-primary" />
          )}
        </div>
        <div className={cn("flex-1 space-y-1.5")}>
          <h3
            className={cn(
              "text-sm",
              isUnread
                ? "font-semibold text-foreground"
                : "font-normal text-muted-foreground",
            )}
          >
            {notification.title}
          </h3>

          <p
            className={cn(
              "text-xs",
              isUnread ? "text-foreground/80" : "text-muted-foreground/90",
            )}
          >
            {notification.content}
          </p>

          <p className="text-xs text-muted-foreground/80">
            {timeAgo(new Date(notification.createdAt))}
          </p>
        </div>

        <div
          className={cn(
            "flex shrink-0 flex-col items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100",
            isUnread && "opacity-100",
          )}
        >
          {isUnread && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                handleMarkAsRead();
              }}
              title="Mark as read"
            >
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full hover:bg-destructive/10 hover:text-destructive"
            onClick={handleDelete}
            title="Delete notification"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function NotificationCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-start gap-3 p-3">
        <Skeleton className="mt-[5px] h-2 w-2 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2.5">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <div className="flex shrink-0 flex-col gap-1">
          <Skeleton className="h-7 w-7 rounded-full" />
          <Skeleton className="h-7 w-7 rounded-full" />
        </div>
      </div>
    </Card>
  );
}
