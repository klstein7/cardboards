import {
  ArrowRight,
  CalendarIcon,
  FolderKanbanIcon,
  LayoutGridIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { type Project } from "~/app/(project)/_types";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import { cn } from "~/lib/utils";

export function ProjectItem({ project }: { project: Project }) {
  const [isHovered, setIsHovered] = useState(false);
  const boardCount = project.boards?.length ?? 0;
  const userCount = project.projectUsers?.length ?? 0;

  const progressPercentage = Math.min(
    100,
    (boardCount > 0 ? 50 : 0) + (userCount > 1 ? 50 : 25),
  );

  return (
    <Link
      href={`/p/${project.id}`}
      className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
    >
      <Card
        className="group relative flex h-full flex-col overflow-hidden border-border/80 bg-background/50 shadow-sm transition-all duration-200 hover:border-primary/40 hover:bg-secondary/10 hover:shadow-md"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-primary/70 opacity-50 transition-opacity group-hover:opacity-100" />

        <CardHeader className="pb-2 pt-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
                  {project.name}
                </h3>
                <Badge
                  variant="outline"
                  className="bg-primary/5 text-xs font-normal"
                >
                  Active
                </Badge>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <CalendarIcon className="h-3.5 w-3.5" />
                <span>
                  Created{" "}
                  {project.createdAt.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
            <div className="rounded-full bg-primary/10 p-2 transition-colors group-hover:bg-primary/20">
              <FolderKanbanIcon className="h-5 w-5 text-primary" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col pt-4">
          <div className="mb-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Project Status</span>
              <span className="font-medium text-primary">
                {progressPercentage}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary/70 transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          <div className="mt-auto grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-muted/30 p-3">
              <div className="flex items-center gap-2">
                <div className="rounded-md bg-primary/10 p-1.5">
                  <LayoutGridIcon className="h-4 w-4 text-primary" />
                </div>
                <div className="text-lg font-medium">{boardCount}</div>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {boardCount === 1 ? "Board" : "Boards"}
              </div>
            </div>

            <div className="rounded-lg bg-muted/30 p-3">
              <div className="flex items-center gap-2">
                <div className="rounded-md bg-primary/10 p-1.5">
                  <UsersIcon className="h-4 w-4 text-primary" />
                </div>
                <div className="text-lg font-medium">{userCount}</div>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {userCount === 1 ? "Member" : "Members"}
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter
          className={cn(
            "bg-muted/20 p-3 transition-colors",
            isHovered && "bg-muted/40",
          )}
        >
          <div className="flex w-full items-center justify-end">
            <span
              className={cn(
                "flex items-center gap-1 text-xs font-medium",
                isHovered ? "text-primary" : "text-muted-foreground",
              )}
            >
              View project details
              <ArrowRight
                className={cn(
                  "h-3 w-3 transition-transform",
                  isHovered && "translate-x-0.5",
                )}
              />
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
