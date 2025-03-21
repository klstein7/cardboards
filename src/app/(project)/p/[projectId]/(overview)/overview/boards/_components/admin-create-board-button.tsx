"use client";

import { PlusIcon } from "lucide-react";

import { CreateBoardDialog } from "~/app/(project)/_components/create-board-dialog";
import { Button } from "~/components/ui/button";
import { useIsAdmin } from "~/lib/hooks/project-user/use-is-admin";

interface AdminCreateBoardButtonProps {
  projectId: string;
}

export function AdminCreateBoardButton({
  projectId,
}: AdminCreateBoardButtonProps) {
  const isAdmin = useIsAdmin();

  if (!isAdmin) {
    return null;
  }

  return (
    <CreateBoardDialog
      trigger={
        <Button className="gap-1.5">
          <PlusIcon className="h-4 w-4" />
          <span>New Board</span>
        </Button>
      }
      projectId={projectId}
    />
  );
}
