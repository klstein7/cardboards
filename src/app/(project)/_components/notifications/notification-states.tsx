"use client";

import { Bell } from "lucide-react";

import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

import { NotificationCardSkeleton } from "./notification-card";

interface EmptyStateProps {
  hideButton?: boolean;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function NotificationsEmpty({
  hideButton = false,
  title = "No notifications",
  description = "You don't have any notifications at the moment.",
  actionLabel = "Dismiss",
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-8 text-center",
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Bell className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-base font-medium text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
      {!hideButton && onAction && (
        <Button variant="outline" size="sm" onClick={onAction} className="mt-4">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export function NotificationsLoading({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-3 px-3">
      {Array.from({ length: count }).map((_, index) => (
        <NotificationCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function NotificationsLoadingMore() {
  return (
    <div className="py-2 text-center text-xs text-muted-foreground">
      Loading more notifications...
    </div>
  );
}

export function NotificationsError({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <h3 className="text-base font-medium text-foreground">
        Could not load notifications
      </h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        There was an error loading your notifications.
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-4">
          Try again
        </Button>
      )}
    </div>
  );
}
