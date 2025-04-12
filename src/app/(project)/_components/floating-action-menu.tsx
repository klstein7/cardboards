"use client";

import { Bell, Lightbulb, MoreVertical, Plus, X } from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import { useIsMobile } from "~/lib/hooks";
import { useNotificationUnreadCount } from "~/lib/hooks/notification";
import { cn } from "~/lib/utils";

import { AiInsights } from "./ai-insights";
import { Notifications } from "./notifications";

interface FloatingActionMenuProps {
  entityType: "project" | "board";
  entityId: string;
  className?: string;
}

export function FloatingActionMenu({
  entityType,
  entityId,
  className,
}: FloatingActionMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const isMobile = useIsMobile();
  const { data: unreadCount = 0 } = useNotificationUnreadCount();

  const toggleMenu = () => {
    // Close panels if open when toggling the main menu
    if (notificationsOpen) setNotificationsOpen(false);
    if (insightsOpen) setInsightsOpen(false);
    setMenuOpen(!menuOpen);
  };

  const openNotifications = () => {
    setNotificationsOpen(true);
    setMenuOpen(false); // Close the main menu when a panel opens
    if (insightsOpen) setInsightsOpen(false); // Close other panel
  };

  const openInsights = () => {
    setInsightsOpen(true);
    setMenuOpen(false); // Close the main menu when a panel opens
    if (notificationsOpen) setNotificationsOpen(false); // Close other panel
  };

  // For mobile we use a simplified menu
  if (isMobile) {
    return (
      <>
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            onClick={toggleMenu}
            size="icon"
            className={cn(
              "h-12 w-12 rounded-full shadow-md hover:shadow-lg",
              "border border-border bg-background text-foreground transition-all",
              className,
            )}
            variant="outline"
          >
            {menuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Plus className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle action menu</span>
          </Button>
          {!menuOpen &&
            !notificationsOpen &&
            !insightsOpen &&
            unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
        </div>

        {/* Action menu options */}
        {menuOpen && (
          <div className="fixed bottom-[88px] right-6 z-30 flex flex-col gap-4">
            {/* Notifications button */}
            <Button
              onClick={openNotifications}
              size="icon"
              className={cn(
                "h-12 w-12 rounded-full shadow-md transition-all hover:shadow-lg",
                "border border-border bg-background text-primary",
              )}
              variant="outline"
            >
              <div className="relative flex h-full w-full items-center justify-center">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <span className="sr-only">Notifications</span>
            </Button>

            {/* Insights button */}
            <Button
              onClick={openInsights}
              size="icon"
              className={cn(
                "h-12 w-12 rounded-full shadow-md transition-all hover:shadow-lg",
                "border border-border bg-background text-amber-500",
              )}
              variant="outline"
            >
              <Lightbulb className="h-5 w-5" />
              <span className="sr-only">AI Insights</span>
            </Button>
          </div>
        )}

        {/* Render controlled Sheet components */}
        <Notifications
          open={notificationsOpen}
          onOpenChange={setNotificationsOpen}
        />
        <AiInsights
          entityType={entityType}
          entityId={entityId}
          open={insightsOpen}
          onOpenChange={setInsightsOpen}
        />
      </>
    );
  }

  // For desktop we show a more traditional menu
  return (
    <>
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          onClick={toggleMenu}
          size="icon"
          className={cn(
            "h-12 w-12 rounded-full shadow-md hover:shadow-lg",
            "border border-border bg-background text-foreground transition-all",
            className,
          )}
          variant="outline"
        >
          {menuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <MoreVertical className="h-5 w-5" />
          )}
          <span className="sr-only">Toggle action menu</span>
        </Button>
        {!menuOpen &&
          !notificationsOpen &&
          !insightsOpen &&
          unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
      </div>

      {/* Action menu options */}
      {menuOpen && (
        <div className="fixed bottom-[88px] right-6 z-30 flex flex-col gap-4">
          {/* Notifications button */}
          <Button
            onClick={openNotifications}
            size="icon"
            className={cn(
              "h-12 w-12 rounded-full shadow-md transition-all hover:shadow-lg",
              "border border-border bg-background text-primary",
            )}
            variant="outline"
          >
            <div className="relative flex h-full w-full items-center justify-center">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            <span className="sr-only">Notifications</span>
          </Button>

          {/* Insights button */}
          <Button
            onClick={openInsights}
            size="icon"
            className={cn(
              "h-12 w-12 rounded-full shadow-md transition-all hover:shadow-lg",
              "border border-border bg-background text-amber-500",
            )}
            variant="outline"
          >
            <Lightbulb className="h-5 w-5" />
            <span className="sr-only">AI Insights</span>
          </Button>
        </div>
      )}

      {/* Render controlled Sheet components */}
      <Notifications
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
      />
      <AiInsights
        entityType={entityType}
        entityId={entityId}
        open={insightsOpen}
        onOpenChange={setInsightsOpen}
      />
    </>
  );
}
