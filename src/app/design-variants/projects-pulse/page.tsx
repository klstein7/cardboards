"use client";

import {
  ArrowRight,
  Check,
  CircleDot,
  MessageSquare,
  MoveRight,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { cn } from "~/lib/utils";

import { MemberAvatar } from "../_lib/bits";
import {
  BoardStudyRow,
  ProgressLine,
  ProjectHealthLabel,
  ProjectMemberStack,
  ProjectStudyHeader,
} from "../_lib/project-study-bits";
import {
  type ProjectActivityStudy,
  projectStudies,
  type ProjectStudy,
} from "../_lib/project-study-data";
import { ProjectStudySwitcher } from "../_lib/project-study-switcher";

interface PortfolioActivity extends ProjectActivityStudy {
  project: ProjectStudy;
}

export default function ProjectsPulsePage() {
  const [projectFilter, setProjectFilter] = useState("all");

  const activities = useMemo(
    () =>
      projectStudies.flatMap((project) =>
        project.activity.map((activity) => ({ ...activity, project })),
      ),
    [],
  );
  const visibleActivities = activities.filter(
    (activity) =>
      projectFilter === "all" || activity.project.id === projectFilter,
  );
  const selectedProject =
    projectStudies.find((project) => project.id === projectFilter) ??
    projectStudies[0]!;
  const groupedActivities = groupActivity(visibleActivities);

  return (
    <main className="flex h-dvh min-h-0 flex-col overflow-hidden bg-background text-foreground">
      <ProjectStudyHeader study="Pulse">
        <span className="hidden items-center border-l border-border px-4 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground md:flex">
          Thursday · July 9
        </span>
      </ProjectStudyHeader>

      <div className="min-h-0 flex-1 overflow-y-auto pb-20 lg:grid lg:grid-cols-[240px_minmax(0,1fr)_290px] lg:overflow-hidden">
        <aside className="border-b border-border lg:min-h-0 lg:border-b-0 lg:border-r">
          <div className="border-b border-border px-4 py-5">
            <h1 className="text-2xl font-light tracking-[-0.02em]">Pulse</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              The latest movement across your workspace.
            </p>
          </div>

          <div className="flex overflow-x-auto lg:block lg:h-[calc(100%-113px)] lg:overflow-y-auto">
            <ProjectFilterButton
              label="All activity"
              detail={`${activities.length} updates`}
              active={projectFilter === "all"}
              onClick={() => setProjectFilter("all")}
            />
            {projectStudies.map((project) => (
              <ProjectFilterButton
                key={project.id}
                label={project.name}
                detail={`${project.activity.length} updates`}
                active={projectFilter === project.id}
                onClick={() => setProjectFilter(project.id)}
                health={project.health}
              />
            ))}
          </div>
        </aside>

        <section className="min-h-0 overflow-y-auto border-b border-border lg:border-b-0 lg:border-r">
          <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-3xl font-light tracking-[-0.025em]">
                  {projectFilter === "all"
                    ? "Workspace activity"
                    : selectedProject.name}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {visibleActivities.length} recent changes · newest first
                </p>
              </div>
              <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
                <span className="h-1.5 w-1.5 bg-primary" />
                Live workspace feed
              </div>
            </div>

            {groupedActivities.map(([period, periodActivities]) => (
              <section
                key={period}
                className="grid border-b border-border py-6 sm:grid-cols-[92px_1fr] sm:gap-6"
              >
                <h3 className="mb-4 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground sm:mb-0">
                  {period}
                </h3>
                <div>
                  {periodActivities.map((activity, index) => (
                    <ActivityRow
                      key={`${activity.project.id}-${activity.target}`}
                      activity={activity}
                      last={index === periodActivities.length - 1}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>

        <aside className="min-h-0 overflow-y-auto">
          <div className="border-b border-border px-5 py-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.11em] text-muted-foreground">
                  In view
                </p>
                <h2 className="mt-2 text-2xl font-light">
                  {selectedProject.name}
                </h2>
              </div>
              <ProjectHealthLabel health={selectedProject.health} />
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {selectedProject.summary}
            </p>
            <div className="mt-5 flex items-center justify-between gap-4">
              <ProjectMemberStack members={selectedProject.members} />
              <span className="font-mono text-[10px] tabular-nums">
                {selectedProject.progress}%
              </span>
            </div>
            <ProgressLine value={selectedProject.progress} className="mt-3" />
          </div>

          <div className="px-5 py-5">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-sm font-medium">Boards</h3>
              <span className="font-mono text-[9px] text-muted-foreground">
                {selectedProject.boards.length}
              </span>
            </div>
            <div className="mt-3 border-t border-border">
              {selectedProject.boards.map((board) => (
                <div key={board.id} className="border-b border-border">
                  <BoardStudyRow board={board} />
                </div>
              ))}
            </div>
            <Link
              href="/projects"
              className="group mt-5 flex min-h-11 items-center justify-between border border-border px-3 text-xs transition-colors hover:border-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              Open {selectedProject.name}
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                aria-hidden
              />
            </Link>
          </div>
        </aside>
      </div>

      <ProjectStudySwitcher active="pulse" />
    </main>
  );
}

function ProjectFilterButton({
  label,
  detail,
  active,
  onClick,
  health,
}: {
  label: string;
  detail: string;
  active: boolean;
  onClick: () => void;
  health?: ProjectStudy["health"];
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "group flex min-h-16 w-52 shrink-0 flex-col justify-center border-r border-border px-4 text-left transition-colors hover:bg-accent/35 focus-visible:bg-accent/35 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring lg:w-full lg:border-b lg:border-r-0",
        active && "bg-accent/55",
      )}
    >
      <span className="flex w-full items-center gap-2">
        {health && (
          <span
            className={cn(
              "h-1.5 w-1.5",
              health === "Needs attention" ? "bg-destructive" : "bg-primary",
            )}
            aria-hidden
          />
        )}
        <span
          className={cn(
            "min-w-0 flex-1 truncate text-sm transition-colors group-hover:text-primary",
            active && "text-primary",
          )}
        >
          {label}
        </span>
      </span>
      <span className="mt-1 font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">
        {detail}
      </span>
    </button>
  );
}

function ActivityRow({
  activity,
  last,
}: {
  activity: PortfolioActivity;
  last: boolean;
}) {
  const ActionIcon = getActivityIcon(activity.action);

  return (
    <div className="grid grid-cols-[24px_minmax(0,1fr)_auto] gap-3">
      <div className="flex flex-col items-center">
        <span className="flex h-6 w-6 items-center justify-center border border-border bg-background text-muted-foreground">
          <ActionIcon className="h-3 w-3" aria-hidden />
        </span>
        {!last && <span className="min-h-8 w-px flex-1 bg-border" />}
      </div>
      <div className={cn("min-w-0 pb-6", last && "pb-0")}>
        <p className="text-sm leading-relaxed">
          <span className="font-medium">{activity.person.name}</span>{" "}
          <span className="text-muted-foreground">{activity.action}</span>{" "}
          <span>{activity.target}</span>
        </p>
        <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">
          {activity.project.name} · {activity.project.code}
        </p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <span className="font-mono text-[9px] text-muted-foreground">
          {activity.when}
        </span>
        <MemberAvatar person={activity.person} />
      </div>
    </div>
  );
}

function getActivityIcon(action: string) {
  if (action === "completed") return Check;
  if (action === "moved") return MoveRight;
  if (action === "commented on") return MessageSquare;
  return CircleDot;
}

function groupActivity(activities: PortfolioActivity[]) {
  const groups: Record<string, PortfolioActivity[]> = {
    Today: [],
    Yesterday: [],
    Earlier: [],
  };

  activities.forEach((activity) => {
    if (activity.when.includes("min") || activity.when.includes("hr")) {
      groups.Today!.push(activity);
    } else if (activity.when === "Yesterday") {
      groups.Yesterday!.push(activity);
    } else {
      groups.Earlier!.push(activity);
    }
  });

  return Object.entries(groups).filter(([, group]) => group.length > 0);
}
