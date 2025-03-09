"use client";

import { MoreHorizontal } from "lucide-react";
import { useState } from "react";

import { type ProjectUser } from "~/app/(project)/_types";
import { Button } from "~/components/ui/button";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
} from "~/components/ui/dropdown-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

import { ProjectUserRoleDialog } from "./project-user-role-dialog";

interface ProjectMembersDataTableProps {
  projectUser: ProjectUser;
}

export function ProjectMembersTableActions({
  projectUser,
}: ProjectMembersDataTableProps) {
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="border-border bg-popover">
          <DropdownMenuLabel className="text-popover-foreground">
            Actions
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-muted" />
          <DropdownMenuItem className="focus:bg-accent focus:text-accent-foreground">
            View profile
          </DropdownMenuItem>
          <DropdownMenuItem
            className="focus:bg-accent focus:text-accent-foreground"
            onClick={() => setIsRoleDialogOpen(true)}
          >
            Change role
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-muted" />
          <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
            Remove from project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {isRoleDialogOpen && (
        <ProjectUserRoleDialog
          isOpen={isRoleDialogOpen}
          onClose={() => setIsRoleDialogOpen(false)}
          user={projectUser}
        />
      )}
    </>
  );
}
