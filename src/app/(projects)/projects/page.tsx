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
      <div className="relative min-h-[100dvh] bg-gradient-to-b from-background via-background/95 to-background/90">
        <div className="bg-grid-pattern pointer-events-none absolute inset-0 opacity-[0.02]" />
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-16 flex flex-col items-center text-center">
            <Logo variant="large" className="mb-8" />
            <p className="max-w-2xl text-xl text-muted-foreground">
              Manage your projects and organize your work in one place
            </p>
          </div>
          <div className="mx-auto mb-10 max-w-5xl">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              <div className="group rounded-xl border border-border/60 bg-background/70 p-5 shadow-sm backdrop-blur-sm transition-all hover:border-primary/20 hover:bg-background/80 hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-3 transition-colors group-hover:bg-primary/15">
                    <LayoutGrid className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Active Projects
                    </p>
                    <Suspense
                      fallback={
                        <div className="h-7 w-12 animate-pulse rounded bg-muted/30" />
                      }
                    >
                      <StatsCounter type="active" />
                    </Suspense>
                  </div>
                </div>
              </div>
              <div className="group rounded-xl border border-border/60 bg-background/70 p-5 shadow-sm backdrop-blur-sm transition-all hover:border-primary/20 hover:bg-background/80 hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-3 transition-colors group-hover:bg-primary/15">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Boards
                    </p>
                    <Suspense
                      fallback={
                        <div className="h-7 w-12 animate-pulse rounded bg-muted/30" />
                      }
                    >
                      <StatsCounter type="boards" />
                    </Suspense>
                  </div>
                </div>
              </div>
              <div className="group rounded-xl border border-border/60 bg-background/70 p-5 shadow-sm backdrop-blur-sm transition-all hover:border-primary/20 hover:bg-background/80 hover:shadow-md sm:col-span-2 md:col-span-1">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-3 transition-colors group-hover:bg-primary/15">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Recent Activity
                    </p>
                    <Suspense
                      fallback={
                        <div className="h-7 w-12 animate-pulse rounded bg-muted/30" />
                      }
                    >
                      <StatsCounter type="recent" />
                    </Suspense>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mx-auto mb-10 max-w-5xl">
            <div className="relative">
              <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 opacity-30 blur-sm"></div>
              <div className="relative overflow-hidden rounded-lg">
                <SearchBar />
              </div>
            </div>
          </div>
          <div className="mx-auto max-w-5xl">
            <div className="relative">
              <ProjectList />
            </div>
          </div>
        </div>
      </div>
    </HydrateClient>
  );
}
