import { Plus, Search, Star } from "lucide-react";
import { type Metadata } from "next";

import { BrandIcon } from "~/components/brand/brand-icon";

import { MemberAvatar, MemberStack } from "../_lib/bits";
import { maren, members } from "../_lib/mock-data";
import {
  favoriteProjects,
  type MockProject,
  mockProjects,
  regularProjects,
  totalBoards,
} from "../_lib/mock-projects";
import { VariantSwitcher } from "../_lib/switcher";

export const metadata: Metadata = {
  title: "Manifest | Projects design variants",
};

function SectionRow({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex h-9 items-center justify-between border-b border-border bg-accent/20 px-3">
      <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      <span className="font-mono text-[10px] text-muted-foreground">
        {String(count).padStart(2, "0")}
      </span>
    </div>
  );
}

function ProjectRow({ project }: { project: MockProject }) {
  const cardTotal = project.boards.reduce((sum, board) => sum + board.cards, 0);
  return (
    <a
      href="#"
      className="group flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-accent/50 focus-visible:bg-accent/50 focus-visible:outline-none"
      aria-label={`Open ${project.name}`}
    >
      {project.isFavorite ? (
        <Star className="h-3 w-3 shrink-0 fill-primary text-primary" />
      ) : (
        <span className="h-3 w-3 shrink-0" aria-hidden />
      )}
      <span className="min-w-0 flex-1 truncate text-sm transition-colors group-hover:text-primary">
        {project.name}
      </span>
      <span className="hidden w-20 shrink-0 text-right font-mono text-[10px] text-muted-foreground sm:block">
        {project.boards.length}{" "}
        {project.boards.length === 1 ? "board" : "boards"}
      </span>
      <span className="hidden w-16 shrink-0 text-right font-mono text-[10px] text-muted-foreground md:block">
        {cardTotal} cards
      </span>
      <div className="hidden w-24 shrink-0 justify-end md:flex">
        <MemberStack
          people={project.members.slice(0, 4)}
          itemClassName="h-5 w-5 text-[8px]"
        />
      </div>
      <span className="w-16 shrink-0 text-right font-mono text-[10px] text-muted-foreground">
        {project.updated}
      </span>
    </a>
  );
}

export default function ManifestPage() {
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
        <label className="hidden items-center gap-2 border-l border-border px-4 sm:flex">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            placeholder="Find a project"
            className="w-40 bg-transparent text-xs outline-none placeholder:text-muted-foreground/60"
          />
        </label>
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
        <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
          <div className="border border-border">
            <div className="flex items-center gap-3 border-b border-border px-3 py-2">
              <span className="h-3 w-3 shrink-0" aria-hidden />
              <span className="flex-1 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                Name
              </span>
              <span className="hidden w-20 shrink-0 text-right font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground sm:block">
                Boards
              </span>
              <span className="hidden w-16 shrink-0 text-right font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground md:block">
                Cards
              </span>
              <span className="hidden w-24 shrink-0 text-right font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground md:block">
                Members
              </span>
              <span className="w-16 shrink-0 text-right font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                Updated
              </span>
            </div>

            <SectionRow label="Pinned" count={favoriteProjects.length} />
            <div className="divide-y divide-border/60">
              {favoriteProjects.map((project) => (
                <ProjectRow key={project.name} project={project} />
              ))}
            </div>

            <SectionRow label="All projects" count={regularProjects.length} />
            <div className="divide-y divide-border/60">
              {regularProjects.map((project) => (
                <ProjectRow key={project.name} project={project} />
              ))}
            </div>
          </div>

          <p className="mt-3 text-right font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
            {mockProjects.length} projects · {totalBoards} boards
          </p>
        </div>
      </main>

      <VariantSwitcher active="manifest" />
    </div>
  );
}
