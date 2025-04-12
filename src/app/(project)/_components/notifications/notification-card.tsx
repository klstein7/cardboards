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
        "motion-safe:animate-fadeIn group relative cursor-pointer select-none overflow-hidden border",
        "border-border/40 bg-card transition-all duration-200 hover:bg-muted/50 dark:border-neutral-700/60 dark:hover:bg-muted/30",
        isUnread ? "bg-card" : "bg-card/80 dark:bg-neutral-800/70", // Slightly different background for read
      )}
      style={{
        animationDelay,
        animationFillMode: "both",
      }}
      onClick={handleMarkAsRead}
    >
      <div className="flex items-start gap-3 p-3">
        <div className={cn("flex-1 space-y-1")}>
          <h3
            className={cn(
              "text-sm leading-tight",
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
              isUnread ? "text-foreground/90" : "text-muted-foreground/80",
            )}
          >
            {notification.content}
          </p>

          <p className="pt-1 text-xs text-muted-foreground/70">
            {timeAgo(new Date(notification.createdAt))}
          </p>
        </div>

        {/* Action Buttons - Appear on Hover */}
        <div
          className={cn(
            "absolute right-2 top-1/2 flex -translate-y-1/2 flex-col items-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100",
          )}
        >
          {isUnread && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full"
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
            className="h-6 w-6 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            onClick={handleDelete}
            title="Delete notification"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function NotificationCardSkeleton() {
  return (
    <Card className="border-border/40 bg-card/80 dark:border-neutral-700/60 dark:bg-neutral-800/70">
      <div className="flex items-start gap-3 p-3">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4 rounded" />
          <Skeleton className="h-3 w-full rounded" />
          <Skeleton className="h-3 w-1/2 rounded" />
        </div>
        <div className="flex shrink-0 flex-col gap-1 opacity-0">
          {/* Keep structure for spacing, but invisible */}
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
      </div>
    </Card>
  );
}
