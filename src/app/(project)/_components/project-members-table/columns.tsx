"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import { type ProjectUser } from "~/app/(project)/_types";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { getInitials } from "~/lib/utils";

import { ProjectMembersTableActions } from "./project-members-table-actions";

export const columns: ColumnDef<ProjectUser>[] = [
  {
    accessorKey: "user",
    header: "User",
    cell: ({ row }) => {
      const user = row.original.user;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            {user.imageUrl && (
              <AvatarImage src={user.imageUrl} alt={user.name} />
            )}
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{user.name}</span>
            <span className="text-sm text-muted-foreground">{user.email}</span>
          </div>
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const nameA = rowA.original.user.name.toLowerCase();
      const nameB = rowB.original.user.name.toLowerCase();
      return nameA.localeCompare(nameB);
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.original.role;
      return (
        <Badge
          variant={role === "admin" ? "default" : "outline"}
          className="capitalize"
        >
          {role}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) => {
      return (
        <span className="text-sm text-muted-foreground">
          {format(new Date(row.original.createdAt), "MMM d, yyyy")}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="flex justify-end pr-2">
          <ProjectMembersTableActions user={row.original} />
        </div>
      );
    },
  },
];
