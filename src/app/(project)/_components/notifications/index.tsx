"use client";

import { Bell, CheckCircle, Loader2, Trash } from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import {
  Sidebar,
  SidebarHeader,
  SidebarSection,
  SidebarTitle,
} from "~/components/ui/sidebar";
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

interface NotificationsSidebarProps {
  className?: string;
}

export function NotificationsSidebar({ className }: NotificationsSidebarProps) {
  const [filter, setFilter] = useState<"all" | "unread">("all");

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
    <Sidebar
      position="right"
      size="lg"
      open={true}
      persistent={true}
      className={cn(
        "h-full w-full overflow-auto border-l bg-background shadow-md dark:bg-background/95",
        className,
      )}
    >
      <div className="flex h-full flex-col">
        <SidebarHeader className="pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20">
              <Bell className="h-4.5 w-4.5 text-primary" />
            </div>
            <SidebarTitle className="text-lg">Notifications</SidebarTitle>
          </div>
          <p className="mt-1.5 text-sm text-muted-foreground/90 dark:text-muted-foreground/95">
            Stay updated on activity in your projects and assigned tasks.
          </p>
        </SidebarHeader>

        <SidebarSection className="border-0 pb-0">
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
        </SidebarSection>

        <SidebarSection className="border-0 pb-0 pt-4">
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
        </SidebarSection>

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
    </Sidebar>
  );
}
