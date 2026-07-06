"use client";

import { CheckCircle2, Trash2 } from "lucide-react";

import { Button } from "~/components/ui/button";
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
}

export function NotificationCard({ notification }: NotificationCardProps) {
  const { mutate: markAsRead } = useMarkNotificationAsRead();
  const { mutate: deleteNotification } = useDeleteNotification();

  const isUnread = !notification.isRead;

  const handleMarkAsRead = () => {
    if (notification.isRead) return;
    markAsRead(notification.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering mark as read
    deleteNotification(notification.id);
  };

  return (
    <div
      className="group relative cursor-pointer select-none py-4 pl-4 pr-14"
      onClick={handleMarkAsRead}
    >
      {isUnread && (
        <span
          className="absolute left-0 top-[21px] h-3.5 w-0.5 bg-primary"
          aria-hidden
        />
      )}

      <h3
        className={cn(
          "text-sm leading-snug",
          isUnread ? "font-medium text-foreground" : "text-muted-foreground",
        )}
      >
        {notification.title}
      </h3>

      <p
        className={cn(
          "mt-1 text-xs leading-relaxed",
          isUnread ? "text-foreground/80" : "text-muted-foreground/80",
        )}
      >
        {notification.content}
      </p>

      <p className="mt-1.5 font-mono text-[10px] text-muted-foreground">
        {timeAgo(new Date(notification.createdAt))}
      </p>

      <div className="absolute right-0 top-1/2 flex -translate-y-1/2 flex-col items-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
        {isUnread && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              handleMarkAsRead();
            }}
            title="Mark as read"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          onClick={handleDelete}
          title="Delete notification"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

export function NotificationCardSkeleton() {
  return (
    <div className="py-4 pl-4 pr-14">
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}
