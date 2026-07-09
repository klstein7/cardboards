import { type Metadata } from "next";

import { HydrateClient, trpc } from "~/trpc/server";

import { ProjectShelf } from "../_components/project-shelf/project-shelf";
import { ProjectsCommandStrip } from "../_components/projects-command-strip";

export const metadata: Metadata = {
  title: "Projects | cardboards",
  description: "Manage and organize your projects in one place",
};

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  await Promise.all([
    trpc.project.list.prefetch(),
    trpc.history.getRecent.prefetch({ limit: 40 }),
  ]);

  return (
    <HydrateClient>
      <div className="flex h-dvh flex-col overflow-hidden bg-background">
        <div className="shrink-0 border-b border-border">
          <ProjectsCommandStrip />
        </div>

        <main className="min-h-0 flex-1 overflow-hidden">
          <ProjectShelf />
        </main>
      </div>
    </HydrateClient>
  );
}
