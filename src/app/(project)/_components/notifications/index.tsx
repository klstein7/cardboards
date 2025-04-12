"use client";

import { Bell, CheckCircle, Loader2, Trash } from "lucide-react";
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
          "overflow-auto p-0 shadow-lg dark:bg-neutral-900/95",
          isMobile && "w-[344px] sm:w-[400px]",
          className,
        )}
      >
        <SheetTitle className="sr-only">Notifications</SheetTitle>

        <div className="flex h-full flex-col">
          <div className="border-b p-6 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20">
                <Bell className="h-4.5 w-4.5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                Notifications
              </h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Stay updated on activity in your projects and assigned tasks.
            </p>
          </div>

          <div className="border-b px-6 py-3">
            <div className="flex items-center gap-2 rounded-md border bg-muted/50 p-1">
              <Button
                size="sm"
                variant={filter === "all" ? "secondary" : "ghost"}
                onClick={() => setFilter("all")}
                className="flex-1 justify-center"
              >
                All
              </Button>
              <Button
                size="sm"
                variant={filter === "unread" ? "secondary" : "ghost"}
                onClick={() => setFilter("unread")}
                className="flex-1 justify-center"
              >
                Unread
              </Button>
            </div>
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

          <div className="flex-1 overflow-y-auto p-4 px-2">
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
              <div className="grid grid-cols-1 gap-2">
                {notifications.map((notification, index) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    index={index}
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
