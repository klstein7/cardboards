import { type Metadata } from "next";

import { Logo } from "~/components/brand/logo";
import { HydrateClient, trpc } from "~/trpc/server";

import { ProjectList } from "../_components/project-list";
import { ProjectsHeader } from "../_components/projects-header";

export const metadata: Metadata = {
  title: "Projects | cardboards",
  description: "Manage and organize your projects in one place",
};

export default async function ProjectsPage() {
  await trpc.project.list.prefetch();
  const projects = await trpc.project.list();
  const hasProjects = projects.length > 0;

  return (
    <HydrateClient>
      <div className="h-[100dvh] overflow-y-auto bg-background">
        <div className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
          {/* Header with Logo */}
          <header className="border-b border-border/40 py-8">
            <div className="flex items-center justify-center">
              <Logo variant="default" className="mx-auto" showText={true} />
            </div>
          </header>

          {/* Main Content */}
          <div className="mx-auto max-w-7xl pt-8">
            {/* Only show Projects header when there are projects */}
            {hasProjects && (
              <div className="mb-6">
                <ProjectsHeader />
              </div>
            )}

            {/* Projects List with integrated search or empty state */}
            <ProjectList />
          </div>
        </div>
      </div>
    </HydrateClient>
  );
}
