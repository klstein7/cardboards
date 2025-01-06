"use client";

import Link from "next/link";
import { useProjects } from "~/lib/hooks";

export function ProjectList() {
  const projects = useProjects();

  if (projects.isError) throw projects.error;
  if (projects.isPending) return <div>Loading...</div>;

  return (
    <div className="flex flex-col gap-2">
      {projects.data.map((project) => (
        <Link key={project.id} href={`/p/${project.id}`}>
          {project.name}
        </Link>
      ))}
    </div>
  );
}
