import { Clock, LayoutGrid, Users } from "lucide-react";
import { Suspense } from "react";

import { Logo } from "~/components/brand/logo";
import { HydrateClient, trpc } from "~/trpc/server";

import { ProjectList } from "../_components/project-list";
import { SearchBar } from "../_components/search-bar";
import { StatsCounter } from "../_components/stats-counter";

export default async function ProjectsPage() {
  await trpc.project.list.prefetch();

  return (
    <HydrateClient>
      <div className="relative min-h-[100dvh] bg-background">
        <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-12 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col items-center text-center">
            <Logo variant="default" className="mb-6" />
            <h1 className="mb-2 text-2xl font-medium tracking-tight">
              Project Dashboard
            </h1>
            <p className="max-w-lg text-sm text-muted-foreground">
              Manage your projects and organize your work in one place
            </p>
          </div>

          <div className="mx-auto mb-8 max-w-4xl">
            <div className="flex flex-wrap gap-4 sm:gap-6">
              <div className="flex-1 rounded-lg border border-border/60 bg-background p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/5 p-2">
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

              <div className="flex-1 rounded-lg border border-border/60 bg-background p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/5 p-2">
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

              <div className="flex-1 rounded-lg border border-border/60 bg-background p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/5 p-2">
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
          </div>

          <div className="mx-auto mb-8 max-w-4xl">
            <SearchBar />
          </div>

          <div className="mx-auto max-w-6xl">
            <ProjectList />
          </div>
        </div>
      </div>
    </HydrateClient>
  );
}
