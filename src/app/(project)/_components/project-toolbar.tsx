"use client";

import { Settings, Star, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { BaseToolbar } from "~/components/shared/base-toolbar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import {
  useCurrentProjectUser,
  useProjectUsers,
  useUpdateCurrentUserPreferences,
} from "~/lib/hooks";

interface ProjectToolbarProps {
  projectId: string;
  className?: string;
}

export function ProjectToolbar({ projectId, className }: ProjectToolbarProps) {
  const projectUsers = useProjectUsers(projectId);
  const currentUser = useCurrentProjectUser();
  const updatePreferences = useUpdateCurrentUserPreferences();
  const userCount = projectUsers.data?.length ?? 0;
  const isAdmin = currentUser.data?.role === "admin";
  const isFavorite = currentUser.data?.isFavorite ?? false;

  const toggleFavorite = () => {
    updatePreferences.mutate(
      {
        projectId,
        data: { isFavorite: !isFavorite },
      },
      {
        onSuccess: () => {
          toast.success(
            isFavorite
              ? "Project removed from favorites"
              : "Project added to favorites",
          );
        },
        onError: (error) => {
          toast.error(`Failed to update favorite status: ${error.message}`);
        },
      },
    );
  };

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
              onClick={toggleFavorite}
            >
              <Star
                className={`h-4 w-4 ${isFavorite ? "fill-yellow-400 text-yellow-400" : ""}`}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isFavorite ? "Remove from favorites" : "Add to favorites"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );

  const projectActions = (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={`/p/${projectId}/overview/members`}>
              <Button variant="outline" size="sm" className="gap-2">
                <Users className="h-4 w-4" />
                <span className="text-xs font-medium">{userCount}</span>
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent>Project members</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {isAdmin && (
        <Link href={`/p/${projectId}/settings/members`}>
          <Button variant="outline" size="sm" className="gap-2">
            <UserPlus className="h-4 w-4" />
            <span className="hidden text-xs font-medium sm:inline">Invite</span>
          </Button>
        </Link>
      )}

      {isAdmin && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href={`/p/${projectId}/settings`}>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent>Project settings</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </>
  );

  return (
    <BaseToolbar
      className={className}
      left={projectInfo}
      right={projectActions}
    />
  );
}
