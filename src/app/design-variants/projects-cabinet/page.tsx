"use client";

import { ArrowRight, Plus, Star } from "lucide-react";
import { useState } from "react";

import { BrandIcon } from "~/components/brand/brand-icon";
import { cn } from "~/lib/utils";

import { MemberAvatar, MemberStack } from "../_lib/bits";
import { maren } from "../_lib/mock-data";
import {
  donePercent,
  favoriteProjects,
  type MockProject,
  mockProjects,
  regularProjects,
} from "../_lib/mock-projects";
import { VariantSwitcher } from "../_lib/switcher";

function RailSectionLabel({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex h-8 items-center justify-between px-4">
      <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      <span className="font-mono text-[9px] text-muted-foreground">
        {String(count).padStart(2, "0")}
      </span>
    </div>
  );
}

function RailRow({
  project,
  selected,
  onSelect,
}: {
  project: MockProject;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-center gap-2.5 px-4 py-2 text-left transition-colors focus-visible:bg-accent/50 focus-visible:outline-none",
        selected ? "bg-accent/50" : "hover:bg-accent/30",
      )}
    >
      {project.isFavorite ? (
        <Star className="h-3 w-3 shrink-0 fill-primary text-primary" />
      ) : (
        <span className="h-3 w-3 shrink-0" aria-hidden />
      )}
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-sm transition-colors",
          selected ? "text-primary" : "text-foreground",
        )}
      >
        {project.name}
      </span>
      <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
        {String(project.boards.length).padStart(2, "0")}
      </span>
    </button>
  );
}

function ProjectDetail({ project }: { project: MockProject }) {
  const cardTotal = project.boards.reduce((sum, board) => sum + board.cards, 0);
  return (
    <div className="flex h-full min-w-0 flex-col">
      <div className="border-b border-border px-6 py-6 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="flex items-center gap-3 truncate text-3xl font-light tracking-tight">
              {project.isFavorite && (
                <Star className="h-4 w-4 shrink-0 fill-primary text-primary" />
              )}
              {project.name}
            </h1>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {project.boards.length}{" "}
              {project.boards.length === 1 ? "board" : "boards"} · {cardTotal}{" "}
              cards · updated {project.updated}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <MemberStack
              people={project.members}
              itemClassName="h-6 w-6 text-[9px]"
            />
            <button className="flex h-8 items-center gap-1.5 bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              Open project
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 sm:px-8">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
            Boards
          </span>
          <span className="font-mono text-[9px] text-muted-foreground">
            {String(project.boards.length).padStart(2, "0")}
          </span>
        </div>
        {project.boards.length > 0 ? (
          <div className="mt-2 divide-y divide-border/60 border-y border-border">
            {project.boards.map((board) => (
              <a
                key={board.name}
                href="#"
                className="group flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-accent/50 focus-visible:bg-accent/50 focus-visible:outline-none"
                aria-label={`Open ${board.name}`}
              >
                <span className="min-w-0 flex-1 truncate text-[12.5px] transition-colors group-hover:text-primary">
                  {board.name}
                </span>
                <span className="shrink-0 font-mono text-[9px] text-muted-foreground">
                  {board.cards} cards
                </span>
                <span className="w-9 shrink-0 text-right font-mono text-[9px] text-primary">
                  {donePercent(board)}%
                </span>
                <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </a>
            ))}
          </div>
        ) : (
          <p className="mt-2 border-y border-border px-3 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            No boards yet
          </p>
        )}
      </div>
    </div>
  );
}

export default function CabinetPage() {
  const [selectedName, setSelectedName] = useState(mockProjects[0]?.name ?? "");
  const selected =
    mockProjects.find((project) => project.name === selectedName) ??
    mockProjects[0];

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

      <div className="grid min-h-0 flex-1 grid-rows-[auto_1fr] md:grid-cols-[300px_1fr] md:grid-rows-1">
        <nav
          aria-label="Projects"
          className="flex max-h-48 flex-col overflow-y-auto border-b border-border md:max-h-none md:border-b-0 md:border-r"
        >
          <RailSectionLabel label="Pinned" count={favoriteProjects.length} />
          <div className="divide-y divide-border/60 border-y border-border">
            {favoriteProjects.map((project) => (
              <RailRow
                key={project.name}
                project={project}
                selected={project.name === selectedName}
                onSelect={() => setSelectedName(project.name)}
              />
            ))}
          </div>
          <RailSectionLabel
            label="All projects"
            count={regularProjects.length}
          />
          <div className="divide-y divide-border/60 border-y border-border">
            {regularProjects.map((project) => (
              <RailRow
                key={project.name}
                project={project}
                selected={project.name === selectedName}
                onSelect={() => setSelectedName(project.name)}
              />
            ))}
          </div>
        </nav>

        {selected && <ProjectDetail project={selected} />}
      </div>

      <VariantSwitcher active="cabinet" />
    </div>
  );
}
