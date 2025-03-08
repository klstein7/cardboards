"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  ArrowUpDown,
  Calendar,
  Clock,
  MoreHorizontal,
  Shield,
  User,
} from "lucide-react";

import { type ProjectUser } from "~/app/(project)/_types";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

import { ProjectUserRoleSelect } from "../../../../(settings)/_components/project-users-data-table/project-user-role-select";

export const columns: ColumnDef<ProjectUser>[] = [
  {
    accessorKey: "user.name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4 h-8 data-[state=open]:bg-accent"
        >
          User
          <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-4">
          <Avatar className="h-9 w-9 border">
            <AvatarImage
              src={row.original.user.imageUrl ?? undefined}
              alt={row.original.user.name}
            />
            <AvatarFallback className="bg-accent text-accent-foreground">
              {row.original.user.name[0] ?? row.original.user.email[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="text-sm font-medium text-card-foreground">
              {row.original.user.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {row.original.user.email}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4 h-8 data-[state=open]:bg-accent"
        >
          Role
          <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const role = row.original.role;

      return (
        <div className="flex items-center gap-3">
          {role === "admin" ? (
            <Badge className="flex items-center gap-1 bg-primary/10 py-1 text-primary hover:bg-primary/20">
              <Shield className="h-3 w-3" />
              <span>Admin</span>
            </Badge>
          ) : (
            <Badge className="flex items-center gap-1 bg-secondary py-1 text-secondary-foreground hover:bg-secondary/80">
              <User className="h-3 w-3" />
              <span>Member</span>
            </Badge>
          )}
          <ProjectUserRoleSelect
            role={role}
            projectId={row.original.projectId}
            userId={row.original.userId}
          />
        </div>
      );
    },
    filterFn: (row, id, value: string) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4 h-8 data-[state=open]:bg-accent"
        >
          Last Activity
          <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />
        </Button>
      );
    },
    cell: ({ row }) => {
      // Use updated date if available, otherwise use created date
      const date = row.original.updatedAt ?? row.original.createdAt;
      const formattedDate = format(date, "MMM d, yyyy");
      const fullDate = format(date, "MMMM d, yyyy 'at' h:mm a");

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-card-foreground">
                  {formattedDate}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-popover text-popover-foreground">
              <p>{fullDate}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4 h-8 data-[state=open]:bg-accent"
        >
          Joined
          <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const formattedDate = format(row.original.createdAt, "MMM d, yyyy");
      const fullDate = format(
        row.original.createdAt,
        "MMMM d, yyyy 'at' h:mm a",
      );

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-card-foreground">
                  {formattedDate}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-popover text-popover-foreground">
              <p>{fullDate}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;

      return (
        <DropdownMenu>
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
            <DropdownMenuItem className="focus:bg-accent focus:text-accent-foreground">
              Change role
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-muted" />
            <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
              Remove from project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
