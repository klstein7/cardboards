"use client";

import {
  ActivityIcon,
  ArrowRightIcon,
  CalendarIcon,
  ClockIcon,
  LayoutGridIcon,
  StarIcon,
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
  const isFavorite = project.isFavorite ?? false;

  // Calculate project age in days
  const projectAgeDays = Math.floor(
    (Date.now() - project.createdAt.getTime()) / (1000 * 60 * 60 * 24),
  );

  // Determine project activity level
  const getActivityLevel = () => {
    // Consider a project active if it has boards and team members
    if (boardCount >= 3 && userCount >= 3) return "high";
    if (boardCount >= 1 && userCount >= 1) return "medium";
    return "low";
  };

  const activityLevel = getActivityLevel();

  // Get activity status color and label
  const getActivityColor = () => {
    switch (activityLevel) {
      case "high":
        return "text-primary";
      case "medium":
        return "text-foreground";
      case "low":
        return "text-muted-foreground";
    }
  };

  const getActivityLabel = () => {
    switch (activityLevel) {
      case "high":
        return "High activity";
      case "medium":
        return "Active";
      case "low":
        return "New project";
    }
  };

  return (
    <Link
      href={`/p/${project.id}/overview/boards`}
      className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label={`Open ${project.name} project`}
    >
      <Card
        className={cn(
          "relative flex h-full flex-col overflow-hidden border-border bg-transparent transition-colors duration-200",
          "hover:border-primary/60",
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isFavorite && (
          <div className="absolute right-3 top-3">
            <StarIcon className="h-4 w-4 fill-primary text-primary" />
          </div>
        )}

        <CardHeader className="pb-2 pt-4">
          <div className="space-y-1.5">
            <h3 className="text-base font-medium tracking-tight text-foreground">
              {project.name}
            </h3>
            <div className="flex items-center gap-2">
              <Badge>Active</Badge>
              <div className="flex items-center gap-1 text-xs text-muted-foreground/90">
                <CalendarIcon className="h-3 w-3" />
                <span>
                  {project.createdAt.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col pt-2">
          {/* Project status indicators */}
          <div className="mb-5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ActivityIcon className={cn("h-4 w-4", getActivityColor())} />
                <span className={cn("font-medium", getActivityColor())}>
                  {getActivityLabel()}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <ClockIcon className="h-3.5 w-3.5 text-muted-foreground/90" />
                <span className="text-muted-foreground/90">
                  {projectAgeDays === 0
                    ? "Today"
                    : projectAgeDays === 1
                      ? "Yesterday"
                      : `${projectAgeDays} days ago`}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-auto grid grid-cols-2 divide-x divide-border border-t border-border">
            <div className="flex flex-col py-3 pr-3">
              <div className="flex items-center gap-2">
                <LayoutGridIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-lg font-light tabular-nums">
                  {boardCount}
                </span>
              </div>
              <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {boardCount === 1 ? "Board" : "Boards"}
              </div>
            </div>

            <div className="flex flex-col py-3 pl-3">
              <div className="flex items-center gap-2">
                <UsersIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-lg font-light tabular-nums">
                  {userCount}
                </span>
              </div>
              <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {userCount === 1 ? "Member" : "Members"}
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="border-t border-border p-3">
          <div className="flex w-full items-center justify-end">
            <span
              className={cn(
                "flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors",
                isHovered && "text-primary",
              )}
            >
              View details
              <ArrowRightIcon
                className={cn(
                  "h-3.5 w-3.5 transition-transform duration-200",
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
