import { type Metadata } from "next";

import { HydrateClient, trpc } from "~/trpc/server";

import { ProjectList } from "../_components/project-list";
import { ProjectsPageHeader } from "../_components/projects-page-header";
import { ProjectsTitle } from "../_components/projects-title";

export const metadata: Metadata = {
  title: "Projects | cardboards",
  description: "Manage and organize your projects in one place",
};

export default async function ProjectsPage() {
  await trpc.project.list.prefetch();

  return (
    <HydrateClient>
      <div className="flex h-[100dvh] flex-col overflow-hidden bg-background">
        <ProjectsPageHeader />

        <main className="flex-1 overflow-y-auto px-4 pb-16 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">
            <div className="pt-10 md:pt-14">
              <ProjectsTitle />
            </div>
            <div className="mt-12">
              <ProjectList />
            </div>
          </div>
        </main>
      </div>
    </HydrateClient>
  );
}
