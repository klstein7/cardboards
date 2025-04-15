import { type Metadata } from "next";

import { HydrateClient, trpc } from "~/trpc/server";

import { ProjectList } from "../_components/project-list";
import { ProjectsPageHeader } from "../_components/projects-page-header";

export const metadata: Metadata = {
  title: "Projects | cardboards",
  description: "Manage and organize your projects in one place",
};

export default async function ProjectsPage() {
  await trpc.project.list.prefetch();

  return (
    <HydrateClient>
      <div className="h-[100dvh] overflow-y-auto bg-background">
        <ProjectsPageHeader />

        <div className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6 lg:px-8">
          <ProjectList />
        </div>
      </div>
    </HydrateClient>
  );
}
