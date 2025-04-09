"use client";

import { Bell, Lightbulb, MoreVertical, Plus, X } from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import { useIsMobile } from "~/lib/hooks";
import { useNotificationUnreadCount } from "~/lib/hooks/notification";
import { cn } from "~/lib/utils";

import { AiInsightsSidebar } from "./ai-insights";
import { NotificationsSidebar } from "./notifications";

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
  const [isOpen, setIsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const isMobile = useIsMobile();
  const { data: unreadCount = 0 } = useNotificationUnreadCount();

  const toggleMenu = () => {
    if (notificationsOpen || insightsOpen) {
      // If a panel is open, close it instead of toggling the menu
      setNotificationsOpen(false);
      setInsightsOpen(false);
      return;
    }

    setIsOpen(!isOpen);
  };

  const openNotifications = () => {
    setNotificationsOpen(true);
    setIsOpen(false);
  };

  const openInsights = () => {
    setInsightsOpen(true);
    setIsOpen(false);
  };

  const handleClosePanel = () => {
    setNotificationsOpen(false);
    setInsightsOpen(false);
  };

  // For mobile we handle our own UI state
  if (isMobile) {
    return (
      <>
        {/* Only show main action button when no panels are open */}
        {!notificationsOpen && !insightsOpen && (
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
              {isOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Plus className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle action menu</span>
            </Button>
            {!isOpen && unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
        )}

        {/* Action menu options */}
        {isOpen && !notificationsOpen && !insightsOpen && (
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

        {/* Notifications panel */}
        {notificationsOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-20 bg-black/20 backdrop-blur-sm transition-opacity duration-300"
              onClick={handleClosePanel}
            />
            <div className="fixed bottom-0 right-0 top-0 z-30 h-full w-[344px]">
              <Button
                onClick={handleClosePanel}
                size="icon"
                className="absolute right-4 top-4 z-10 h-8 w-8 rounded-full bg-background/80 shadow-sm hover:bg-background"
                variant="ghost"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
              <NotificationsSidebar className="h-full" />
            </div>
          </>
        )}

        {/* Insights panel */}
        {insightsOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-20 bg-black/20 backdrop-blur-sm transition-opacity duration-300"
              onClick={handleClosePanel}
            />
            <div className="fixed bottom-0 right-0 top-0 z-30 h-full w-[344px]">
              <Button
                onClick={handleClosePanel}
                size="icon"
                className="absolute right-4 top-4 z-10 h-8 w-8 rounded-full bg-background/80 shadow-sm hover:bg-background"
                variant="ghost"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
              <AiInsightsSidebar
                entityType={entityType}
                entityId={entityId}
                className="h-full"
              />
            </div>
          </>
        )}
      </>
    );
  }

  // For desktop we use direct DOM for better control instead of Sheet
  return (
    <>
      {/* Only show main action button when no panels are open */}
      {!notificationsOpen && !insightsOpen && (
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
            {isOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <MoreVertical className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle action menu</span>
          </Button>
          {!isOpen && unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>
      )}

      {/* Action menu options */}
      {isOpen && !notificationsOpen && !insightsOpen && (
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

      {/* Notifications panel */}
      {notificationsOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-20 bg-black/20 backdrop-blur-sm transition-opacity duration-300"
            onClick={handleClosePanel}
          />
          <div className="fixed bottom-0 right-0 top-0 z-30 h-full w-[400px] duration-300 animate-in slide-in-from-right">
            <Button
              onClick={handleClosePanel}
              size="icon"
              className="absolute right-4 top-4 z-10 h-8 w-8 rounded-full bg-background/80 shadow-sm hover:bg-background"
              variant="ghost"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
            <NotificationsSidebar className="h-full" />
          </div>
        </>
      )}

      {/* Insights panel */}
      {insightsOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-20 bg-black/20 backdrop-blur-sm transition-opacity duration-300"
            onClick={handleClosePanel}
          />
          <div className="fixed bottom-0 right-0 top-0 z-30 h-full w-[400px] duration-300 animate-in slide-in-from-right">
            <Button
              onClick={handleClosePanel}
              size="icon"
              className="absolute right-4 top-4 z-10 h-8 w-8 rounded-full bg-background/80 shadow-sm hover:bg-background"
              variant="ghost"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
            <AiInsightsSidebar
              entityType={entityType}
              entityId={entityId}
              className="h-full"
            />
          </div>
        </>
      )}
    </>
  );
}
