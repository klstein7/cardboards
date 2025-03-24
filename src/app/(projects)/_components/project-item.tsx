import {
  ArrowRight,
  CalendarIcon,
  FolderKanbanIcon,
  LayoutGridIcon,
  Star,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

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
  const { resolvedTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  // Safely determine dark mode only on client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Always use a consistent initial render to prevent hydration mismatch
  const isDarkMode = isMounted ? resolvedTheme === "dark" : false;

  const boardCount = project.boards?.length ?? 0;
  const userCount = project.projectUsers?.length ?? 0;
  const isFavorite = project.isFavorite ?? false;

  const progressPercentage = Math.min(
    100,
    (boardCount > 0 ? 50 : 0) + (userCount > 1 ? 50 : 25),
  );

  // Determine the status color based on progress
  const getStatusColor = () => {
    if (progressPercentage < 30) return "bg-rose-500/70 dark:bg-rose-600/50";
    if (progressPercentage < 70) return "bg-amber-500/70 dark:bg-amber-500/50";
    return "bg-emerald-500/70 dark:bg-emerald-500/50";
  };

  return (
    <Link
      href={`/p/${project.id}/overview/boards`}
      className="group block h-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20"
      aria-label={`Open ${project.name} project`}
    >
      <Card
        className={cn(
          "relative flex h-full flex-col overflow-hidden border-border/60 bg-background shadow-sm transition-all duration-300 ease-in-out",
          "hover:translate-y-[-2px] hover:border-primary/40 hover:shadow-md",
          isFavorite &&
            isMounted &&
            (isDarkMode
              ? "border-amber-300/40 bg-amber-50/5 shadow"
              : "border-l-2 border-yellow-600/80 bg-yellow-50/30 shadow"),
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className={cn(
            "absolute inset-x-0 top-0 h-1 transition-all duration-300 ease-in-out",
            !isFavorite &&
              "bg-gradient-to-r from-primary/60 to-primary/40 opacity-40 group-hover:opacity-100",
            isFavorite &&
              isMounted &&
              (isDarkMode
                ? "bg-gradient-to-r from-amber-300 to-amber-400/70 opacity-60"
                : "bg-gradient-to-r from-yellow-500 to-yellow-600 opacity-90"),
          )}
        />

        <CardHeader className="pb-2 pt-5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <h3
                  className={cn(
                    "text-base font-medium tracking-tight text-foreground transition-all duration-200 ease-in-out group-hover:text-primary",
                    isFavorite && isMounted && !isDarkMode && "text-yellow-700",
                    isFavorite && isMounted && isDarkMode && "text-amber-200",
                  )}
                >
                  {project.name}
                </h3>
                {isFavorite && (
                  <Star
                    className={cn(
                      "h-4 w-4 transition-all duration-200 ease-in-out",
                      isMounted &&
                        isDarkMode &&
                        "fill-amber-300/80 text-amber-300/80",
                      isMounted &&
                        !isDarkMode &&
                        "fill-yellow-500 text-yellow-500",
                    )}
                  />
                )}
                <Badge
                  variant="outline"
                  className={cn(
                    "bg-primary/5 text-[10px] font-normal shadow-sm transition-all duration-200 ease-in-out",
                    isFavorite &&
                      isMounted &&
                      !isDarkMode &&
                      "border-yellow-300 bg-yellow-100 font-medium text-yellow-900",
                    isFavorite &&
                      isMounted &&
                      isDarkMode &&
                      "border-amber-800/30 bg-amber-900/20 text-amber-200",
                  )}
                >
                  {isFavorite ? "Favorite" : "Active"}
                </Badge>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80">
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
            <div
              className={cn(
                "rounded-full bg-primary/5 p-1.5 shadow-sm transition-all duration-200 ease-in-out group-hover:bg-primary/10 group-hover:shadow",
                isFavorite &&
                  isMounted &&
                  (isDarkMode
                    ? "bg-amber-900/30 group-hover:bg-amber-800/30"
                    : "border border-yellow-200 bg-yellow-100 group-hover:bg-yellow-200"),
              )}
            >
              <FolderKanbanIcon
                className={cn(
                  "h-4 w-4 text-primary transition-all duration-200 ease-in-out",
                  isFavorite &&
                    isMounted &&
                    (isDarkMode ? "text-amber-300" : "text-yellow-600"),
                )}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col pt-2">
          <div className="mb-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground/80">Completion</span>
              <span
                className={cn(
                  "font-medium text-primary/90 transition-all duration-200 ease-in-out",
                  isFavorite &&
                    isMounted &&
                    (isDarkMode ? "text-amber-300/90" : "text-yellow-700"),
                )}
              >
                {progressPercentage}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary/50 shadow-sm">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500 ease-in-out",
                  !isFavorite && getStatusColor(),
                  isFavorite &&
                    isMounted &&
                    (isDarkMode ? "bg-amber-400/40" : "bg-yellow-600/70"),
                )}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          <div className="mt-auto grid grid-cols-2 gap-3">
            <div
              className={cn(
                "rounded-md bg-secondary/40 p-2.5 shadow-sm transition-all duration-200 ease-in-out group-hover:bg-secondary/50 group-hover:shadow",
                isFavorite &&
                  isMounted &&
                  !isDarkMode &&
                  "border border-yellow-200 bg-yellow-50",
                isFavorite && isMounted && isDarkMode && "bg-amber-950/40",
              )}
            >
              <div className="flex items-center gap-1.5">
                <div
                  className={cn(
                    "rounded-md bg-primary/10 p-1 shadow-sm",
                    isFavorite &&
                      isMounted &&
                      (isDarkMode
                        ? "bg-amber-800/30"
                        : "border border-yellow-300 bg-yellow-200"),
                  )}
                >
                  <LayoutGridIcon
                    className={cn(
                      "h-3.5 w-3.5 text-primary",
                      isFavorite &&
                        isMounted &&
                        (isDarkMode ? "text-amber-300" : "text-yellow-700"),
                    )}
                  />
                </div>
                <div className="text-base font-medium">{boardCount}</div>
              </div>
              <div className="mt-0.5 text-[10px] font-medium text-muted-foreground/80">
                {boardCount === 1 ? "Board" : "Boards"}
              </div>
            </div>

            <div
              className={cn(
                "rounded-md bg-secondary/40 p-2.5 shadow-sm transition-all duration-200 ease-in-out group-hover:bg-secondary/50 group-hover:shadow",
                isFavorite &&
                  isMounted &&
                  !isDarkMode &&
                  "border border-yellow-200 bg-yellow-50",
                isFavorite && isMounted && isDarkMode && "bg-amber-950/40",
              )}
            >
              <div className="flex items-center gap-1.5">
                <div
                  className={cn(
                    "rounded-md bg-primary/10 p-1 shadow-sm",
                    isFavorite &&
                      isMounted &&
                      (isDarkMode
                        ? "bg-amber-800/30"
                        : "border border-yellow-300 bg-yellow-200"),
                  )}
                >
                  <UsersIcon
                    className={cn(
                      "h-3.5 w-3.5 text-primary",
                      isFavorite &&
                        isMounted &&
                        (isDarkMode ? "text-amber-300" : "text-yellow-700"),
                    )}
                  />
                </div>
                <div className="text-base font-medium">{userCount}</div>
              </div>
              <div className="mt-0.5 text-[10px] font-medium text-muted-foreground/80">
                {userCount === 1 ? "Member" : "Members"}
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter
          className={cn(
            "bg-secondary/30 p-2 transition-all duration-200 ease-in-out",
            isHovered && "bg-secondary/50",
            isFavorite &&
              isMounted &&
              !isHovered &&
              (isDarkMode ? "bg-amber-900/10" : "bg-yellow-50/40"),
            isFavorite &&
              isMounted &&
              isHovered &&
              (isDarkMode ? "bg-amber-900/20" : "bg-yellow-50/60"),
          )}
        >
          <div className="flex w-full items-center justify-end">
            <span
              className={cn(
                "flex items-center gap-1 text-xs font-medium transition-all duration-200 ease-in-out",
                isHovered ? "text-primary" : "text-muted-foreground/90",
                isFavorite &&
                  isMounted &&
                  isHovered &&
                  (isDarkMode ? "text-amber-300/90" : "text-yellow-700"),
              )}
            >
              View details
              <ArrowRight
                className={cn(
                  "h-3 w-3 transition-transform duration-200 ease-in-out",
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
