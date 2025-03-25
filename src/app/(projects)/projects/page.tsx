import { Clock, LayoutGrid, Users } from "lucide-react";
import { Suspense } from "react";

import { Logo } from "~/components/brand/logo";
import { HydrateClient, trpc } from "~/trpc/server";

import { ProjectList } from "../_components/project-list";
import { StatsCounter } from "../_components/stats-counter";

export default async function ProjectsPage() {
  await trpc.project.list.prefetch();

  return (
    <HydrateClient>
      <div className="h-[100dvh] overflow-y-auto bg-background">
        <div className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="py-12 text-center">
            <Logo variant="default" className="mx-auto" />
          </div>

          {/* Main Content */}
          <div className="mx-auto max-w-5xl space-y-10 pt-4">
            {/* Statistics */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-border/80 bg-card p-4 shadow-sm transition-colors hover:bg-secondary/20 dark:border-border/60 dark:hover:border-border dark:hover:bg-secondary/30">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-2 dark:bg-primary/15">
                    <LayoutGrid className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Active Projects
                    </p>
                    <Suspense
                      fallback={
                        <div className="h-5 w-10 animate-pulse rounded bg-muted/30" />
                      }
                    >
                      <StatsCounter type="active" />
                    </Suspense>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border/80 bg-card p-4 shadow-sm transition-colors hover:bg-secondary/20 dark:border-border/60 dark:hover:border-border dark:hover:bg-secondary/30">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-2 dark:bg-primary/15">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Total Boards
                    </p>
                    <Suspense
                      fallback={
                        <div className="h-5 w-10 animate-pulse rounded bg-muted/30" />
                      }
                    >
                      <StatsCounter type="boards" />
                    </Suspense>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border/80 bg-card p-4 shadow-sm transition-colors hover:bg-secondary/20 dark:border-border/60 dark:hover:border-border dark:hover:bg-secondary/30">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-2 dark:bg-primary/15">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Recent Activity
                    </p>
                    <Suspense
                      fallback={
                        <div className="h-5 w-10 animate-pulse rounded bg-muted/30" />
                      }
                    >
                      <StatsCounter type="recent" />
                    </Suspense>
                  </div>
                </div>
              </div>
            </div>

            {/* Projects List */}
            <div>
              <ProjectList />
            </div>
          </div>
        </div>
      </div>
    </HydrateClient>
  );
}
