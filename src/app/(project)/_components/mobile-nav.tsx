"use client";

import { ChartArea, Kanban, Menu, Plus, Settings, Star } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

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
import { cn } from "~/lib/utils";

import { CreateBoardDialog } from "./create-board-dialog";

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
    loading: () => <div className="h-8 w-8 rounded-full bg-muted" />,
  },
);

interface MobileNavProps {
  projectId: string;
}

export function MobileNav({ projectId }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const params = useParams();
  const boards = useBoards(projectId);

  const currentBoardId = params.boardId as string | undefined;

  if (boards.isError) {
    return <div>Error: {boards.error.message}</div>;
  }

  return (
    <Sheet open={open} onOpenChange={setOpen} modal={false}>
      <SheetTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className="fixed right-4 top-4 z-50 h-10 w-10 rounded-full shadow-md sm:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0 sm:hidden">
        <div className="flex h-full flex-col px-4 py-6">
          <SheetHeader className="text-left">
            <div className="mb-6 flex items-center">
              <Star className="h-6 w-6 flex-shrink-0 fill-yellow-400 text-yellow-400" />
              <SheetTitle className="ml-3 text-lg">Starboard</SheetTitle>
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
              <SheetClose asChild>
                <Link href={`/p/${projectId}/analytics`}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2"
                  >
                    <ChartArea className="h-4 w-4" />
                    Analytics
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
                            currentBoardId === board.id && "bg-muted/75",
                          )}
                        >
                          <div
                            className="h-4 w-4 flex-shrink-0 rounded-full"
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
  );
}
