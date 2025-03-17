"use client";

import { MoreHorizontal, Trash, UserCog } from "lucide-react";
import { useState } from "react";

import { type ProjectUser } from "~/app/(project)/_types";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useCurrentProjectUser } from "~/lib/hooks";

import { ProjectUserRoleDialog } from "./project-user-role-dialog";

interface ProjectMembersTableActionsProps {
  user: ProjectUser;
}

export function ProjectMembersTableActions({
  user,
}: ProjectMembersTableActionsProps) {
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);
  const currentUser = useCurrentProjectUser();

  const canEditUser =
    currentUser.data?.role === "admin" &&
    currentUser.data.userId !== user.userId;

  if (!canEditUser) return null;

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => setIsEditRoleOpen(true)}
          >
            <UserCog className="mr-2 h-4 w-4" />
            <span>Edit Role</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer">
            <Trash className="mr-2 h-4 w-4" />
            <span>Remove</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProjectUserRoleDialog
        isOpen={isEditRoleOpen}
        onClose={() => setIsEditRoleOpen(false)}
        user={user}
      />
    </>
  );
}
