"use client";

import { Plus, Star, UserPlus } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { CreateBoardDialog } from "~/app/(project)/_components/create-board-dialog";
import { Button } from "~/components/ui/button";
import {
  useCurrentProjectUser,
  useProject,
  useUpdateCurrentUserPreferences,
} from "~/lib/hooks";
import { cn } from "~/lib/utils";

interface ProjectHeaderProps {
  projectId: string;
  className?: string;
}

export function ProjectHeader({ projectId, className }: ProjectHeaderProps) {
  const project = useProject(projectId);
  const currentUser = useCurrentProjectUser();
  const updatePreferences = useUpdateCurrentUserPreferences();

  const isAdmin = currentUser.data?.role === "admin";
  const isFavorite = currentUser.data?.isFavorite ?? false;

  const toggleFavorite = () => {
    updatePreferences.mutate(
      { projectId, data: { isFavorite: !isFavorite } },
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

  return (
    <div
      className={cn(
        "flex flex-wrap items-end justify-between gap-x-6 gap-y-4",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
          Project
        </p>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="truncate text-4xl font-extralight tracking-tight md:text-5xl">
            {project.data?.name ?? " "}
          </h1>
          <button
            onClick={toggleFavorite}
            className="shrink-0 text-muted-foreground transition-colors hover:text-primary"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Star
              className={cn("h-5 w-5", isFavorite && "fill-primary text-primary")}
            />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isAdmin && (
          <Link href={`/p/${projectId}/overview/members`}>
            <Button variant="outline" size="sm" className="gap-2">
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Invite</span>
            </Button>
          </Link>
        )}
        {isAdmin && (
          <CreateBoardDialog
            trigger={
              <Button className="gap-1.5">
                <Plus className="h-4 w-4" />
                New board
              </Button>
            }
            projectId={projectId}
          />
        )}
      </div>
    </div>
  );
}
