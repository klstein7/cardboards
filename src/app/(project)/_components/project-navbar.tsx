"use client";

import { Bell, Menu, Plus } from "lucide-react";
import dynamic from "next/dynamic";
import { Nunito } from "next/font/google";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { BrandIcon } from "~/components/brand/brand-icon";
import { ProjectSelector } from "~/components/shared/project-selector";
import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { useBoards } from "~/lib/hooks";
import { useNotificationUnreadCount } from "~/lib/hooks/notification";
import { useIsAdmin } from "~/lib/hooks/project-user/use-is-admin";
import { cn } from "~/lib/utils";

import { CreateBoardDialog } from "./create-board-dialog";
import { Notifications } from "./notifications";

const ThemeToggle = dynamic(
  () => import("./theme-toggle").then((mod) => mod.ThemeToggle),
  { ssr: false },
);

const UserButton = dynamic(
  () => import("@clerk/nextjs").then((mod) => mod.UserButton),
  {
    ssr: false,
    loading: () => <div className="h-8 w-8 border border-border bg-muted" />,
  },
);

const nunito = Nunito({ subsets: ["latin"], weight: ["800"] });

interface ProjectNavbarProps {
  projectId: string;
  projectName: string;
}

export function ProjectNavbar({ projectId, projectName }: ProjectNavbarProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const boards = useBoards(projectId);
  const isAdmin = useIsAdmin();
  const { data: unreadCount = 0 } = useNotificationUnreadCount();

  const navItems = [
    {
      label: "Boards",
      href: `/p/${projectId}/overview/boards`,
      active:
        pathname.includes(`/p/${projectId}/overview/boards`) ||
        pathname.includes(`/p/${projectId}/b/`),
    },
    {
      label: "Activity",
      href: `/p/${projectId}/overview/activity`,
      active: pathname.includes(`/p/${projectId}/overview/activity`),
    },
    {
      label: "Members",
      href: `/p/${projectId}/overview/members`,
      active: pathname.includes(`/p/${projectId}/overview/members`),
    },
    {
      label: "Settings",
      href: `/p/${projectId}/settings`,
      active: pathname.includes(`/p/${projectId}/settings`),
    },
  ];

  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-border bg-background">
      <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
        <Link
          href="/projects"
          className="flex shrink-0 items-center gap-2 outline-none focus-visible:ring-1 focus-visible:ring-ring"
          aria-label="All projects"
        >
          <BrandIcon variant="xsmall" />
          <span
            className={cn("hidden text-lg font-extrabold lg:inline", nunito.className)}
          >
            cardboards
          </span>
        </Link>

        <span className="shrink-0 text-border" aria-hidden>
          /
        </span>

        <div className="min-w-0">
          <ProjectSelector
            projectId={projectId}
            label={projectName}
            className="max-w-[45vw] truncate md:max-w-none"
          />
        </div>

        <nav className="ml-6 hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "border-b-2 pb-0.5 text-sm transition-colors",
                item.active
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9"
            onClick={() => setNotificationsOpen(true)}
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>

          <div className="hidden md:block">
            <ThemeToggle side="bottom" align="end" />
          </div>

          <div className="hidden pl-1 md:flex md:items-center">
            <UserButton afterSignOutUrl="/" />
          </div>

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 md:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex w-[280px] flex-col p-0">
              <SheetHeader className="border-b border-border px-4 py-4 text-left">
                <SheetTitle asChild>
                  <Link
                    href="/projects"
                    className="flex items-center gap-2"
                    onClick={() => setMenuOpen(false)}
                  >
                    <BrandIcon variant="xsmall" />
                    <span className={cn("text-lg font-extrabold", nunito.className)}>
                      cardboards
                    </span>
                  </Link>
                </SheetTitle>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto py-2">
                <nav className="px-2">
                  {navItems.map((item) => (
                    <SheetClose asChild key={item.label}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center border-l-2 px-3 py-2 text-sm transition-colors",
                          item.active
                            ? "border-primary font-medium text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {item.label}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>

                <p className="mt-4 px-5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Boards
                </p>
                <div className="mt-1 px-2">
                  {boards.isPending ? (
                    <p className="px-3 py-2 text-sm text-muted-foreground">
                      Loading boards…
                    </p>
                  ) : boards.isError ? (
                    <p className="px-3 py-2 text-sm text-destructive">
                      Failed to load boards
                    </p>
                  ) : boards.data.length === 0 ? (
                    <p className="px-3 py-2 text-sm text-muted-foreground">
                      No boards yet
                    </p>
                  ) : (
                    boards.data.map((board) => (
                      <SheetClose asChild key={board.id}>
                        <Link
                          href={`/p/${projectId}/b/${board.id}`}
                          className={cn(
                            "flex items-center gap-2.5 px-3 py-2 text-sm transition-colors",
                            pathname === `/p/${projectId}/b/${board.id}`
                              ? "text-primary"
                              : "text-muted-foreground hover:text-foreground",
                          )}
                        >
                          <span
                            className="size-2 shrink-0"
                            style={{ backgroundColor: board.color }}
                          />
                          <span className="truncate">{board.name}</span>
                        </Link>
                      </SheetClose>
                    ))
                  )}

                  {isAdmin && (
                    <CreateBoardDialog
                      trigger={
                        <button className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                          <Plus className="h-3.5 w-3.5" />
                          Add board
                        </button>
                      }
                      projectId={projectId}
                    />
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <UserButton afterSignOutUrl="/" />
                  <span className="text-sm text-muted-foreground">Account</span>
                </div>
                <ThemeToggle side="top" align="end" />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <Notifications
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
      />
    </header>
  );
}
