import { Star } from "lucide-react";
import Link from "next/link";

import { type Project } from "~/app/(project)/_types";

export function ProjectItem({ project }: { project: Project }) {
  const boardCount = project.boards?.length ?? 0;
  const userCount = project.projectUsers?.length ?? 0;
  const isFavorite = project.isFavorite ?? false;

  return (
    <Link
      href={`/p/${project.id}`}
      className="group flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 py-5 focus-visible:outline-none"
      aria-label={`Open ${project.name} project`}
    >
      <h3 className="flex items-baseline gap-3 text-2xl font-light tracking-tight decoration-primary decoration-2 underline-offset-8 group-hover:underline md:text-3xl">
        {isFavorite && (
          <Star className="size-4 shrink-0 self-center fill-primary text-primary" />
        )}
        {project.name}
      </h3>
      <div className="flex items-baseline gap-6 font-mono text-sm text-muted-foreground">
        <span className="hidden sm:inline">
          {boardCount} {boardCount === 1 ? "board" : "boards"}
        </span>
        <span>
          {userCount} {userCount === 1 ? "member" : "members"}
        </span>
      </div>
    </Link>
  );
}
