"use client";

import { Plus, Search } from "lucide-react";
import dynamic from "next/dynamic";
import { parseAsString, useQueryState } from "nuqs";

import {
  CommandStrip,
  CommandStripBrand,
} from "~/components/shared/command-strip";
import { Button } from "~/components/ui/button";
import { DialogTrigger } from "~/components/ui/dialog";
import { useProjects } from "~/lib/hooks";

import { CreateProjectDialog } from "./create-project-dialog";

const UserButton = dynamic(
  () => import("@clerk/nextjs").then((mod) => mod.UserButton),
  {
    ssr: false,
    loading: () => (
      <div className="h-7 w-7 rounded-full border border-border bg-muted" />
    ),
  },
);

export function ProjectsCommandStrip() {
  const projects = useProjects();
  const [search, setSearch] = useQueryState("search", parseAsString);

  const projectList = projects.data ?? [];
  const boardCount = projectList.reduce(
    (sum, project) => sum + (project.boards?.length ?? 0),
    0,
  );
  const memberCount = new Set(
    projectList.flatMap((project) =>
      (project.projectUsers ?? []).map((projectUser) => projectUser.userId),
    ),
  ).size;

  return (
    <CommandStrip>
      <CommandStripBrand />

      <div className="flex items-center gap-2 border-r border-border px-4 text-sm">
        <span className="text-muted-foreground">Workspace</span>
        <span className="text-border">/</span>
        <span className="font-medium">Projects</span>
      </div>

      {projectList.length > 0 && (
        <div className="hidden items-center gap-4 whitespace-nowrap px-4 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground md:flex">
          <span>
            {projectList.length}{" "}
            {projectList.length === 1 ? "project" : "projects"}
          </span>
          <span>
            {boardCount} {boardCount === 1 ? "board" : "boards"}
          </span>
          <span className="text-primary">
            {memberCount} {memberCount === 1 ? "member" : "members"}
          </span>
        </div>
      )}

      <div className="min-w-0 flex-1" />

      <label className="hidden items-center gap-2 border-l border-border px-4 sm:flex">
        <Search className="h-3.5 w-3.5 text-muted-foreground" />
        <input
          value={search ?? ""}
          onChange={(event) => void setSearch(event.target.value || null)}
          placeholder="Find a project"
          className="w-40 bg-transparent text-xs outline-none placeholder:text-muted-foreground/60"
          aria-label="Find a project"
        />
      </label>

      <div className="flex items-center border-l border-border px-3">
        <CreateProjectDialog>
          <DialogTrigger asChild>
            <Button className="h-8 shrink-0 gap-1.5 bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90">
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">New project</span>
            </Button>
          </DialogTrigger>
        </CreateProjectDialog>
      </div>

      <div className="flex items-center border-l border-border px-3">
        <UserButton afterSignOutUrl="/" />
      </div>
    </CommandStrip>
  );
}
