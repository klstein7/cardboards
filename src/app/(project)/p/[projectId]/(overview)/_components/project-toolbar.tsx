"use client";

import {
  Edit,
  MoreHorizontal,
  Settings,
  Star,
  UserPlus,
  Users,
} from "lucide-react";

import { BaseToolbar } from "~/components/shared/base-toolbar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useProjectUsers } from "~/lib/hooks";

interface ProjectToolbarProps {
  projectId: string;
}

export function ProjectToolbar({ projectId }: ProjectToolbarProps) {
  const projectUsers = useProjectUsers(projectId);
  const userCount = projectUsers.data?.length ?? 0;

  const projectInfo = (
    <>
      <h2 className="text-lg font-semibold">Overview</h2>
      <Badge variant="outline" className="text-xs font-normal">
        Active
      </Badge>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <Star className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Favorite project</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );

  const projectActions = (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="text-xs font-medium">{userCount}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Project members</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Button variant="outline" size="sm" className="gap-2">
        <UserPlus className="h-4 w-4" />
        <span className="hidden text-xs font-medium sm:inline">Invite</span>
      </Button>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Edit className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Edit project</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span className="text-sm">Project settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <UserPlus className="mr-2 h-4 w-4" />
            <span className="text-sm">Manage members</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive focus:text-destructive">
            <span className="text-sm">Delete project</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  return <BaseToolbar left={projectInfo} right={projectActions} />;
}
