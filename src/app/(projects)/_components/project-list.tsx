"use client";

import { LayoutGridIcon } from "lucide-react";

import { useProjects } from "~/lib/hooks";

import { ProjectItem } from "./project-item";

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-6 py-12 text-center">
      <div className="rounded-full bg-primary/10 p-6">
        <LayoutGridIcon className="h-12 w-12 text-primary" />
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl font-semibold">No projects yet</h3>
        <p className="text-muted-foreground">
          Create your first project to get started with Starboard
        </p>
      </div>
    </div>
  );
}

export function ProjectList() {
  const projects = useProjects();

  if (projects.isError) throw projects.error;
  if (projects.isPending) return <div>Loading...</div>;

  if (projects.data.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex w-full justify-center">
      <div className="flex w-full max-w-[1000px] flex-wrap justify-center gap-6">
        {projects.data.map((project) => (
          <ProjectItem key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
