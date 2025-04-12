"use client";

import { Bell, CheckCircle, Loader2, Trash } from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { Sheet, SheetContent, SheetTitle } from "~/components/ui/sheet";
import { useIsMobile } from "~/lib/hooks";
import {
  useDeleteAllNotifications,
  useMarkAllNotificationsAsRead,
  useNotifications,
  useNotificationUnreadCount,
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
  const { data: unreadCount = 0 } = useNotificationUnreadCount();

  const { data, isLoading, error, refetch } = useNotifications({
    isRead: filter === "unread" ? false : undefined,
  });

  const { mutate: markAllAsRead, isPending: isMarkingAllAsRead } =
    useMarkAllNotificationsAsRead();
  const { mutate: deleteAllNotifications, isPending: isDeletingAll } =
    useDeleteAllNotifications();

  const notifications = data?.notifications ?? [];
  const hasUnread = notifications.some((n) => !n.isRead);
  const hasNotifications = unreadCount > 0;

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
          "overflow-auto p-0 shadow-md dark:bg-background/95",
          isMobile && "w-[344px]",
          className,
        )}
      >
        <SheetTitle className="sr-only">Notifications</SheetTitle>

        <div className="flex h-full flex-col p-6">
          <div className="pb-4 text-left">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20">
                <Bell className="h-4.5 w-4.5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">Notifications</h2>
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground/90 dark:text-muted-foreground/95">
              Stay updated on activity in your projects and assigned tasks.
            </p>
          </div>

          <div className="border-b py-3">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => setFilter("all")}
                className="flex-1"
              >
                All
              </Button>
              <Button
                size="sm"
                variant={filter === "unread" ? "default" : "outline"}
                onClick={() => setFilter("unread")}
                className="flex-1"
              >
                Unread
              </Button>
            </div>
          </div>

          <div className="border-b py-3">
            <div className="flex items-center gap-4">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleMarkAllAsRead}
                disabled={!hasUnread || isPending}
                className="h-9 flex-1 font-medium shadow-sm"
              >
                {isMarkingAllAsRead ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                <span>Mark all read</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDeleteAll}
                disabled={notifications.length === 0 || isPending}
                className="h-9 flex-1 font-medium shadow-sm"
              >
                {isDeletingAll ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash className="mr-2 h-4 w-4" />
                )}
                <span>Clear all</span>
              </Button>
            </div>
          </div>

          <Separator className="my-4 opacity-50" />

          <div className="flex-1 pb-4">
            {isLoading ? (
              <NotificationsLoading />
            ) : error ? (
              <NotificationsError onRetry={() => refetch()} />
            ) : notifications.length === 0 ? (
              <NotificationsEmpty
                title={
                  filter === "unread"
                    ? "No unread notifications"
                    : "No notifications"
                }
                description={
                  filter === "unread"
                    ? "You don't have any unread notifications."
                    : "You don't have any notifications at the moment."
                }
                hideButton={true}
              />
            ) : (
              <div className="grid grid-cols-1 gap-3 px-3">
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
