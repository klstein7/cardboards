"use client";

import { Bell } from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { useIsMobile } from "~/lib/hooks";
import { useNotificationUnreadCount } from "~/lib/hooks/notification";
import { cn } from "~/lib/utils";

import { NotificationsSidebar } from "./index";

interface FloatingNotificationsButtonProps {
  className?: string;
}

export function FloatingNotificationsButton({
  className,
}: FloatingNotificationsButtonProps) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const { data: unreadCount = 0 } = useNotificationUnreadCount();

  const hasNotifications = unreadCount > 0;

  return (
    <>
      {isMobile ? (
        <>
          <Button
            onClick={() => setOpen(!open)}
            size="icon"
            className={cn(
              "fixed bottom-6 right-6 z-40 h-10 w-10 rounded-full shadow-lg transition-all hover:shadow-xl",
              "bg-gradient-to-br from-primary to-primary-foreground hover:from-primary hover:to-primary-foreground/80",
              "ring-2 ring-primary/20 hover:ring-primary/30",
              open && "translate-x-[-344px]",
              className,
            )}
            variant="default"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <Bell className="relative z-10 h-5 w-5 text-white" />
              {hasNotifications && (
                <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            <span className="sr-only">Toggle Notifications</span>
          </Button>

          {open && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-20 bg-black/20 backdrop-blur-sm"
                onClick={() => setOpen(false)}
              />

              <NotificationsSidebar className="fixed bottom-0 right-0 top-0 z-30 h-full w-[344px] shadow-xl" />
            </>
          )}
        </>
      ) : (
        <Sheet>
          <SheetTrigger asChild>
            <Button
              size="icon"
              className={cn(
                "fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full shadow-lg transition-all hover:shadow-xl",
                "bg-gradient-to-br from-primary to-primary-foreground hover:from-primary hover:to-primary-foreground/80",
                "ring-2 ring-primary/20 hover:ring-primary/30",
                className,
              )}
              variant="default"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <Bell className="relative z-10 h-5 w-5 text-white" />
                {hasNotifications && (
                  <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <span className="sr-only">Open Notifications</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="p-0" hideCloseButton>
            <SheetTitle className="sr-only">Notifications</SheetTitle>
            <NotificationsSidebar className="h-full border-0" />
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}
