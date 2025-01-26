"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import { type ProjectUser } from "~/app/(project)/_types";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export const columns: ColumnDef<ProjectUser>[] = [
  {
    header: "User",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-4">
          <Avatar className="h-8 w-8">
            <AvatarImage src={row.original.user.imageUrl ?? undefined} />
            <AvatarFallback>
              {row.original.user.name[0] ?? row.original.user.email[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="text-sm font-medium">{row.original.user.name}</p>
            <p className="text-xs text-muted-foreground">
              {row.original.user.email}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    header: "Role",
    cell: ({ row }) => {
      return (
        <Select defaultValue={row.original.role}>
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="member">Member</SelectItem>
          </SelectContent>
        </Select>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      return <p>{format(row.original.createdAt, "MMM d, yyyy")}</p>;
    },
  },
];
