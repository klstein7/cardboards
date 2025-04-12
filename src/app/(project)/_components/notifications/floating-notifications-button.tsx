"use client";

import { Bell } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import { useIsMobile } from "~/lib/hooks";
import { useNotificationUnreadCount } from "~/lib/hooks/notification";
import { cn } from "~/lib/utils";

import { Notifications } from ".";

interface FloatingNotificationsButtonProps {
  className?: string;
}

export function FloatingNotificationsButton({
  className,
}: FloatingNotificationsButtonProps) {
  const isMobile = useIsMobile();
  const { data: unreadCount = 0 } = useNotificationUnreadCount();

  const hasNotifications = unreadCount > 0;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="icon"
          className={cn(
            "fixed bottom-6 right-6 z-40 rounded-full shadow-lg transition-all hover:shadow-xl",
            "bg-gradient-to-br from-primary to-primary-foreground hover:from-primary hover:to-primary-foreground/80",
            "ring-2 ring-primary/20 hover:ring-primary/30",
            isMobile ? "h-10 w-10" : "h-12 w-12",
            className,
          )}
          variant="default"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <Bell className="relative z-10 h-5 w-5 text-white" />
            {hasNotifications && (
              <span
                className={cn(
                  "absolute flex items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground",
                  isMobile ? "right-0 top-0 h-4 w-4" : "right-1 top-1 h-5 w-5",
                )}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
          <span className="sr-only">Open Notifications</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className={cn(
          "overflow-auto p-0 shadow-md dark:bg-background/95",
          isMobile && "w-[344px]",
        )}
      >
        <Notifications />
      </SheetContent>
    </Sheet>
  );
}
