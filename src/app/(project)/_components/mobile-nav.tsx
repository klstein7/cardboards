"use client";

import { Bell, Kanban, Menu, Plus, Settings } from "lucide-react";
import dynamic from "next/dynamic";
import { Nunito } from "next/font/google";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { BrandIcon } from "~/components/brand/brand-icon";
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
import { cn } from "~/lib/utils";

import { CreateBoardDialog } from "./create-board-dialog";
import { Notifications } from "./notifications";

const ThemeToggle = dynamic(
  () => import("./theme-toggle").then((mod) => mod.ThemeToggle),
  {
    ssr: false,
  },
);

const UserButton = dynamic(
  () => import("@clerk/nextjs").then((mod) => mod.UserButton),
  {
    ssr: false,
    loading: () => <div className="h-8 w-8 border border-border bg-muted" />,
  },
);

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "700", "800", "900", "1000"],
});

interface MobileNavProps {
  projectId: string;
}

export function MobileNav({ projectId }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const params = useParams();
  const boards = useBoards(projectId);
  const { data: unreadCount = 0 } = useNotificationUnreadCount();

  const currentBoardId = params.boardId as string | undefined;

  if (boards.isError) {
    return <div>Error: {boards.error.message}</div>;
  }

  return (
    <>
    <Sheet open={open} onOpenChange={setOpen} modal={false}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed right-4 top-4 z-50 h-10 w-10 rounded-none bg-background sm:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0 sm:hidden">
        <div className="flex h-full flex-col px-4 py-6">
          <SheetHeader className="text-left">
            <div className="mb-6 flex items-center">
              <SheetTitle asChild>
                <Link
                  href={`/p/${projectId}/overview/boards`}
                  className="flex flex-shrink-0 items-center gap-2 outline-none"
                  onClick={() => setOpen(false)}
                >
                  <div className="flex items-center justify-center">
                    <BrandIcon variant="small" />
                  </div>
                  <span
                    className={cn("text-2xl font-extrabold", nunito.className)}
                  >
                    cardboards
                  </span>
                </Link>
              </SheetTitle>
            </div>
          </SheetHeader>

          <div className="flex-1 space-y-6 overflow-y-auto">
            <div className="space-y-1">
              <h2 className="mb-2 text-sm font-semibold">Navigation</h2>
              <SheetClose asChild>
                <Link href={`/p/${projectId}`}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2"
                  >
                    <Kanban className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
              </SheetClose>
            </div>

            <div className="space-y-1">
              <h2 className="mb-2 text-sm font-semibold">Boards</h2>

              {boards.isPending ? (
                <div className="py-2 text-sm text-muted-foreground">
                  Loading boards...
                </div>
              ) : (
                <div className="max-h-[40vh] space-y-1 overflow-y-auto">
                  {boards.data.map((board) => (
                    <SheetClose key={board.id} asChild>
                      <Link href={`/p/${projectId}/b/${board.id}`}>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start gap-2",
                            currentBoardId === board.id &&
                              "border-l-2 border-primary font-medium text-primary",
                          )}
                        >
                          <div
                            className="h-3 w-3 flex-shrink-0 rounded-none"
                            style={{ backgroundColor: board.color }}
                          />
                          <span className="truncate">{board.name}</span>
                        </Button>
                      </Link>
                    </SheetClose>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 space-y-4 border-t pt-4">
            <CreateBoardDialog
              trigger={
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Board
                </Button>
              }
              projectId={projectId}
            />

            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={() => {
                setOpen(false);
                setNotificationsOpen(true);
              }}
            >
              <span className="relative">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </span>
              Notifications
            </Button>

            <SheetClose asChild>
              <Link href={`/p/${projectId}/settings`}>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
              </Link>
            </SheetClose>

            <div className="flex items-center justify-between">
              <ThemeToggle />
              <UserButton />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
    <Notifications
      open={notificationsOpen}
      onOpenChange={setNotificationsOpen}
    />
    </>
  );
}
