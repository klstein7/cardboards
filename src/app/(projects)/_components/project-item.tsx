import {
  ArrowRight,
  CalendarIcon,
  FolderKanbanIcon,
  LayoutGridIcon,
  Star,
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

  const progressPercentage = Math.min(
    100,
    (boardCount > 0 ? 50 : 0) + (userCount > 1 ? 50 : 25),
  );

  return (
    <Link
      href={`/p/${project.id}/overview/boards`}
      className="block h-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20"
    >
      <Card
        className={cn(
          "group relative flex h-full flex-col overflow-hidden border-border/60 bg-background shadow-sm transition-all duration-150 hover:border-primary/40 hover:shadow-md",
          isFavorite && "border-yellow-400/50 bg-yellow-50/10 shadow",
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className={cn(
            "absolute inset-x-0 top-0 h-0.5 bg-primary/60 opacity-40 transition-opacity group-hover:opacity-100",
            isFavorite && "bg-yellow-400 opacity-80",
          )}
        />

        <CardHeader className="pb-2 pt-5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-medium tracking-tight text-foreground transition-colors group-hover:text-primary">
                  {project.name}
                </h3>
                {isFavorite && (
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                )}
                <Badge
                  variant="outline"
                  className="bg-primary/5 text-[10px] font-normal"
                >
                  Active
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground/80">
                <CalendarIcon className="h-3 w-3" />
                <span>
                  {project.createdAt.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
            </div>
            <div
              className={cn(
                "rounded-full bg-primary/5 p-1.5 transition-colors group-hover:bg-primary/10",
                isFavorite && "bg-yellow-400/10 group-hover:bg-yellow-400/20",
              )}
            >
              <FolderKanbanIcon
                className={cn(
                  "h-4 w-4 text-primary",
                  isFavorite && "text-yellow-500",
                )}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col pt-2">
          <div className="mb-3 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground/80">Status</span>
              <span
                className={cn(
                  "font-medium text-primary/90",
                  isFavorite && "text-yellow-500",
                )}
              >
                {progressPercentage}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary/50">
              <div
                className={cn(
                  "h-full rounded-full bg-primary/70 transition-all duration-500",
                  isFavorite && "bg-yellow-400/70",
                )}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          <div className="mt-auto grid grid-cols-2 gap-3">
            <div className="rounded-md bg-secondary/40 p-2.5">
              <div className="flex items-center gap-1.5">
                <div
                  className={cn(
                    "rounded-md bg-primary/10 p-1",
                    isFavorite && "bg-yellow-400/10",
                  )}
                >
                  <LayoutGridIcon
                    className={cn(
                      "h-3.5 w-3.5 text-primary",
                      isFavorite && "text-yellow-500",
                    )}
                  />
                </div>
                <div className="text-base font-medium">{boardCount}</div>
              </div>
              <div className="mt-0.5 text-[10px] text-muted-foreground/80">
                {boardCount === 1 ? "Board" : "Boards"}
              </div>
            </div>

            <div className="rounded-md bg-secondary/40 p-2.5">
              <div className="flex items-center gap-1.5">
                <div
                  className={cn(
                    "rounded-md bg-primary/10 p-1",
                    isFavorite && "bg-yellow-400/10",
                  )}
                >
                  <UsersIcon
                    className={cn(
                      "h-3.5 w-3.5 text-primary",
                      isFavorite && "text-yellow-500",
                    )}
                  />
                </div>
                <div className="text-base font-medium">{userCount}</div>
              </div>
              <div className="mt-0.5 text-[10px] text-muted-foreground/80">
                {userCount === 1 ? "Member" : "Members"}
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter
          className={cn(
            "bg-secondary/30 p-2 transition-colors",
            isHovered && "bg-secondary/50",
            isFavorite && !isHovered && "bg-yellow-50/20",
            isFavorite && isHovered && "bg-yellow-50/30",
          )}
        >
          <div className="flex w-full items-center justify-end">
            <span
              className={cn(
                "flex items-center gap-1 text-xs font-medium",
                isHovered ? "text-primary" : "text-muted-foreground/90",
                isFavorite && isHovered && "text-yellow-500",
              )}
            >
              View details
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
