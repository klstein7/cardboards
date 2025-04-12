"use client";

import { BellOff, Loader2, RefreshCw, ServerCrash } from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface StateProps {
  className?: string;
}

interface ErrorStateProps extends StateProps {
  onRetry?: () => void;
}

interface EmptyStateProps extends StateProps {
  title?: string;
  description?: string;
  onRefetch?: () => Promise<unknown> | void;
}

// Consistent centered layout component
function StateContainer({
  className,
  children,
}: React.PropsWithChildren<StateProps>) {
  return (
    <div
      className={cn(
        "flex h-full flex-col items-center justify-center p-10 text-center",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function NotificationsLoading({ className }: StateProps) {
  return (
    <StateContainer className={className}>
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="mt-4 text-sm font-medium text-muted-foreground">
        Loading notifications...
      </p>
    </StateContainer>
  );
}

export function NotificationsError({ className, onRetry }: ErrorStateProps) {
  return (
    <StateContainer className={className}>
      <ServerCrash className="h-10 w-10 text-destructive/80" />
      <h3 className="mt-4 text-lg font-semibold text-foreground">
        Failed to load notifications
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        There was an issue fetching your notifications. Please try again.
      </p>
      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          className="mt-6"
        >
          Retry
        </Button>
      )}
    </StateContainer>
  );
}

export function NotificationsEmpty({
  className,
  title = "No notifications yet",
  description = "You don't have any notifications at the moment.",
  onRefetch,
}: EmptyStateProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshClick = async () => {
    if (!onRefetch || isRefreshing) return;

    setIsRefreshing(true);
    try {
      await onRefetch();
    } catch (error) {
      console.error("Failed to refetch notifications:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <StateContainer className={className}>
      <BellOff className="h-10 w-10 text-muted-foreground/80" />
      <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      {onRefetch && (
        <Button
          variant="secondary"
          size="sm"
          onClick={handleRefreshClick}
          disabled={isRefreshing}
          className="mt-6 gap-1.5"
        >
          {isRefreshing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </Button>
      )}
    </StateContainer>
  );
}
