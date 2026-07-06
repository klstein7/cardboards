"use client";

import { CheckCircle, Loader2, Trash } from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "~/components/ui/sheet";
import { useIsMobile } from "~/lib/hooks";
import {
  useDeleteAllNotifications,
  useMarkAllNotificationsAsRead,
  useNotifications,
} from "~/lib/hooks/notification";
import { cn } from "~/lib/utils";

import { NotificationCard } from "./notification-card";
import {
  NotificationsEmpty,
  NotificationsError,
  NotificationsLoading,
} from "./notification-states";

interface NotificationsProps {
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Notifications({
  className,
  open,
  onOpenChange,
}: NotificationsProps) {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const isMobile = useIsMobile();

  const { data, isLoading, error, refetch } = useNotifications({
    isRead: filter === "unread" ? false : undefined,
  });

  const { mutate: markAllAsRead, isPending: isMarkingAllAsRead } =
    useMarkAllNotificationsAsRead();
  const { mutate: deleteAllNotifications, isPending: isDeletingAll } =
    useDeleteAllNotifications();

  const notifications = data?.notifications ?? [];
  const hasUnread = notifications.some((n) => !n.isRead);

  const handleMarkAllAsRead = () => {
    if (!hasUnread) return;
    markAllAsRead();
  };

  const handleDeleteAll = () => {
    if (notifications.length === 0) return;
    deleteAllNotifications();
  };

  const isPending = isMarkingAllAsRead || isDeletingAll;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn(
          "overflow-auto p-0",
          isMobile && "w-[344px] sm:w-[400px]",
          className,
        )}
      >
        <SheetTitle className="sr-only">Notifications</SheetTitle>

        <div className="flex h-full flex-col">
          <div className="border-b p-6 pb-4">
            <h2 className="text-xl font-light tracking-tight">
              Notifications
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Stay updated on activity in your projects and assigned tasks.
            </p>
          </div>

          <div className="flex items-center gap-5 border-b px-6">
            {(["all", "unread"] as const).map((option) => (
              <button
                key={option}
                onClick={() => setFilter(option)}
                className={cn(
                  "relative flex h-10 items-center text-sm font-medium capitalize transition-colors after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full",
                  filter === option
                    ? "text-foreground after:bg-primary"
                    : "text-muted-foreground after:bg-transparent hover:text-foreground",
                )}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between gap-4 border-b px-6 py-3">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleMarkAllAsRead}
              disabled={!hasUnread || isPending}
              className="h-8 gap-1.5 px-2 text-xs text-muted-foreground"
            >
              {isMarkingAllAsRead ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle className="h-3.5 w-3.5" />
              )}
              Mark all read
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDeleteAll}
              disabled={notifications.length === 0 || isPending}
              className="h-8 gap-1.5 px-2 text-xs text-muted-foreground hover:text-destructive"
            >
              {isDeletingAll ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash className="h-3.5 w-3.5" />
              )}
              Clear all
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto px-6">
            {isLoading ? (
              <NotificationsLoading />
            ) : error ? (
              <NotificationsError onRetry={refetch} />
            ) : notifications.length === 0 ? (
              <NotificationsEmpty
                onRefetch={refetch}
                title={
                  filter === "unread"
                    ? "No unread notifications"
                    : "No notifications"
                }
                description={
                  filter === "unread"
                    ? "You don\'t have any unread notifications."
                    : "You don\'t have any notifications at the moment."
                }
              />
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
