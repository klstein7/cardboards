import { ArrowRight, Plus, Star } from "lucide-react";
import { type Metadata } from "next";

import { BrandIcon } from "~/components/brand/brand-icon";

import { MemberAvatar, MemberStack } from "../_lib/bits";
import { maren, members } from "../_lib/mock-data";
import {
  donePercent,
  type MockProject,
  mockProjects,
  totalBoards,
} from "../_lib/mock-projects";
import { VariantSwitcher } from "../_lib/switcher";

export const metadata: Metadata = {
  title: "Shelf | Projects design variants",
};

const orderedProjects = [
  ...mockProjects.filter((project) => project.isFavorite),
  ...mockProjects.filter((project) => !project.isFavorite),
];

function ProjectPanel({ project }: { project: MockProject }) {
  return (
    <section className="flex min-h-56 flex-col bg-background">
      <header className="flex h-9 shrink-0 items-center gap-2 border-b border-border px-3">
        {project.isFavorite ? (
          <Star className="h-3 w-3 shrink-0 fill-primary text-primary" />
        ) : (
          <span className="h-3 w-3 shrink-0" aria-hidden />
        )}
        <span className="min-w-0 flex-1 truncate text-sm font-medium">
          {project.name}
        </span>
        <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
          {String(project.boards.length).padStart(2, "0")}
        </span>
      </header>

      <div className="min-h-0 flex-1 divide-y divide-border/60">
        {project.boards.length > 0 ? (
          project.boards.map((board) => (
            <a
              key={board.name}
              href="#"
              className="group flex items-center gap-2.5 px-3 py-2 transition-colors hover:bg-accent/50 focus-visible:bg-accent/50 focus-visible:outline-none"
              aria-label={`Open ${board.name}`}
            >
              <span className="min-w-0 flex-1 truncate text-[12.5px] transition-colors group-hover:text-primary">
                {board.name}
              </span>
              <span className="shrink-0 font-mono text-[9px] text-muted-foreground">
                {board.cards}
              </span>
              <span className="w-9 shrink-0 text-right font-mono text-[9px] text-primary">
                {donePercent(board)}%
              </span>
            </a>
          ))
        ) : (
          <p className="px-3 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            No boards yet
          </p>
        )}
      </div>

      <footer className="flex h-9 shrink-0 items-center justify-between border-t border-border pl-3">
        <MemberStack
          people={project.members.slice(0, 4)}
          itemClassName="h-5 w-5 text-[8px]"
        />
        <a
          href="#"
          className="group flex h-full items-center gap-1.5 px-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-primary focus-visible:text-primary focus-visible:outline-none"
        >
          Open project
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </a>
      </footer>
    </section>
  );
}

export default function ShelfPage() {
  return (
    <div className="flex h-dvh flex-col bg-background text-foreground">
      <header className="flex h-12 shrink-0 items-stretch border-b border-border">
        <div className="flex items-center border-r border-border px-3.5">
          <BrandIcon variant="xsmall" />
        </div>
        <div className="flex items-center gap-2 border-r border-border px-4 text-sm">
          <span className="text-muted-foreground">Workspace</span>
          <span className="text-border">/</span>
          <span className="font-medium">Projects</span>
        </div>
        <div className="hidden items-center gap-4 px-4 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground md:flex">
          <span>{mockProjects.length} projects</span>
          <span>{totalBoards} boards</span>
          <span className="text-primary">{members.length} members</span>
        </div>
        <div className="min-w-0 flex-1" />
        <div className="flex items-center border-l border-border px-3">
          <button className="flex h-8 items-center gap-1.5 bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            <Plus className="h-3.5 w-3.5" />
            New project
          </button>
        </div>
        <div className="flex items-center border-l border-border px-3">
          <MemberAvatar person={maren} className="h-7 w-7 text-[10px]" />
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
          <div className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {orderedProjects.map((project) => (
              <ProjectPanel key={project.name} project={project} />
            ))}
          </div>
          <p className="mt-3 text-right font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
            {mockProjects.length} projects · {totalBoards} boards
          </p>
        </div>
      </main>

      <VariantSwitcher active="shelf" />
    </div>
  );
}
