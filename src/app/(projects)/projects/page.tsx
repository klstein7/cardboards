import { type Metadata } from "next";

import { HydrateClient, trpc } from "~/trpc/server";

import { ProjectShelf } from "../_components/project-shelf/project-shelf";
import { ProjectsCommandStrip } from "../_components/projects-command-strip";

export const metadata: Metadata = {
  title: "Projects | cardboards",
  description: "Manage and organize your projects in one place",
};

export default async function ProjectsPage() {
  await trpc.project.list.prefetch();

  return (
    <HydrateClient>
      <div className="flex h-dvh flex-col overflow-hidden bg-background">
        <div className="shrink-0 border-b border-border">
          <ProjectsCommandStrip />
        </div>

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
            <ProjectShelf />
          </div>
        </main>
      </div>
    </HydrateClient>
  );
}
