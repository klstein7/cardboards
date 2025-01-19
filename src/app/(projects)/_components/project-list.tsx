"use client";

import { useProjects } from "~/lib/hooks";

import { ProjectItem } from "./project-item";

export function ProjectList() {
  const projects = useProjects();

  if (projects.isError) throw projects.error;
  if (projects.isPending) return <div>Loading...</div>;

  return (
    <div className="flex w-full flex-col items-center gap-6">
      {projects.data.map((project) => (
        <ProjectItem key={project.id} project={project} />
      ))}
    </div>
  );
}
