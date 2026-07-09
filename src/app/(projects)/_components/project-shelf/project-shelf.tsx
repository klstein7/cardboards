"use client";

import {
  formatDistanceToNow,
  isToday,
  isWithinInterval,
  isYesterday,
  subDays,
} from "date-fns";
import {
  ArrowRight,
  Check,
  CircleDot,
  MessageSquare,
  MoveRight,
} from "lucide-react";
import Link from "next/link";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useMemo } from "react";

import {
  type Project,
  type RecentProjectHistory,
} from "~/app/(project)/_types";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { useProjects, useRecentProjectHistory } from "~/lib/hooks";
import { cn } from "~/lib/utils";

import { EmptyState } from "./empty-state";
import { ErrorState } from "./error-state";
import { LoadingState } from "./loading-state";

type ActivityGroup = [string, RecentProjectHistory[]];

export function ProjectShelf() {
  const projects = useProjects();
  const history = useRecentProjectHistory();
  const [search, setSearch] = useQueryState("search", parseAsString);
  const [projectFilter, setProjectFilter] = useQueryState(
    "project",
    parseAsString,
  );

  useEffect(() => {
    if (
      projectFilter &&
      projects.isSuccess &&
      !projects.data?.some((project) => project.id === projectFilter)
    ) {
      void setProjectFilter(null);
    }
  }, [projectFilter, projects.data, projects.isSuccess, setProjectFilter]);

  const orderedProjects = useMemo(() => {
    const query = (search ?? "").toLocaleLowerCase().trim();
    const filtered = query
      ? (projects.data ?? []).filter((project) =>
          [project.name, ...(project.boards ?? []).map((board) => board.name)]
            .join(" ")
            .toLocaleLowerCase()
            .includes(query),
        )
      : (projects.data ?? []);

    return [...filtered].sort((first, second) => {
      if (first.isFavorite !== second.isFavorite) {
        return Number(second.isFavorite) - Number(first.isFavorite);
      }
      return getProjectTimestamp(second) - getProjectTimestamp(first);
    });
  }, [projects.data, search]);

  if (projects.isError) {
    return (
      <div className="h-full overflow-y-auto p-4 sm:p-6">
        <ErrorState error={projects.error} refetch={projects.refetch} />
      </div>
    );
  }

  if (projects.isPending) return <LoadingState />;

  if (projects.data.length === 0) {
    return (
      <div className="h-full overflow-y-auto p-4 sm:p-6">
        <EmptyState />
      </div>
    );
  }

  if (orderedProjects.length === 0) {
    return (
      <div className="flex h-full items-center justify-center overflow-y-auto p-4 sm:p-6">
        <div className="w-full max-w-xl border border-dashed border-border px-6 py-14 text-center">
          <h1 className="text-2xl font-light tracking-tight">
            No matching projects
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Nothing in this workspace matches “{search}”.
          </p>
          <Button
            variant="outline"
            className="mt-5"
            onClick={() => void setSearch(null)}
          >
            Clear search
          </Button>
        </div>
      </div>
    );
  }

  const visibleProjectIds = new Set(
    orderedProjects.map((project) => project.id),
  );
  const effectiveFilter =
    projectFilter && visibleProjectIds.has(projectFilter)
      ? projectFilter
      : "all";
  const selectedProject =
    effectiveFilter === "all"
      ? orderedProjects[0]!
      : (orderedProjects.find((project) => project.id === effectiveFilter) ??
        orderedProjects[0]!);
  const allVisibleActivity = (history.data ?? []).filter(
    (item) => item.projectId && visibleProjectIds.has(item.projectId),
  );
  const visibleActivity = allVisibleActivity.filter(
    (item) => effectiveFilter === "all" || item.projectId === effectiveFilter,
  );
  const groupedActivity = groupActivity(visibleActivity);

  return (
    <div className="h-full min-h-0 overflow-y-auto lg:grid lg:grid-cols-[240px_minmax(0,1fr)_300px] lg:overflow-hidden">
      <aside className="border-b border-border lg:min-h-0 lg:border-b-0 lg:border-r">
        <div className="border-b border-border px-4 py-5">
          <div className="flex items-baseline justify-between gap-4">
            <h1 className="text-2xl font-light tracking-[-0.02em]">Projects</h1>
            <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
              {String(orderedProjects.length).padStart(2, "0")}
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Recent movement across your workspace.
          </p>
        </div>

        <div className="flex overflow-x-auto lg:block lg:h-[calc(100%-113px)] lg:overflow-y-auto">
          <ProjectFilterButton
            label="All activity"
            detail={
              history.isPending
                ? "Loading updates"
                : `${allVisibleActivity.length} ${allVisibleActivity.length === 1 ? "update" : "updates"}`
            }
            active={effectiveFilter === "all"}
            onClick={() => void setProjectFilter(null)}
          />
          {orderedProjects.map((project) => {
            const activityCount = (history.data ?? []).filter(
              (item) => item.projectId === project.id,
            ).length;

            return (
              <ProjectFilterButton
                key={project.id}
                label={project.name}
                detail={
                  history.isPending
                    ? `${project.boards?.length ?? 0} boards`
                    : `${activityCount} ${activityCount === 1 ? "update" : "updates"}`
                }
                active={effectiveFilter === project.id}
                onClick={() => void setProjectFilter(project.id)}
                signal={getProjectSignal(project)}
              />
            );
          })}
        </div>
      </aside>

      <section className="min-h-0 border-b border-border lg:overflow-y-auto lg:border-b-0 lg:border-r">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-light tracking-[-0.025em]">
                {effectiveFilter === "all"
                  ? "Workspace activity"
                  : selectedProject.name}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {history.isPending
                  ? "Loading the latest changes"
                  : `${visibleActivity.length} recent ${visibleActivity.length === 1 ? "change" : "changes"} · newest first`}
              </p>
            </div>
            {!history.isError && (
              <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
                <span className="h-1.5 w-1.5 bg-primary" aria-hidden />
                Live workspace feed
              </div>
            )}
          </div>

          {history.isPending ? (
            <ActivityLoading />
          ) : history.isError ? (
            <div className="border-b border-border py-10">
              <h3 className="text-lg font-light">Activity could not load</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Your projects are still available. Try the activity feed again.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => void history.refetch()}
              >
                Retry activity
              </Button>
            </div>
          ) : groupedActivity.length > 0 ? (
            groupedActivity.map(([period, activities]) => (
              <section
                key={period}
                className="grid border-b border-border py-6 sm:grid-cols-[92px_1fr] sm:gap-6"
              >
                <h3 className="mb-4 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground sm:mb-0">
                  {period}
                </h3>
                <div>
                  {activities.map((activity, index) => (
                    <ActivityRow
                      key={activity.id}
                      activity={activity}
                      last={index === activities.length - 1}
                    />
                  ))}
                </div>
              </section>
            ))
          ) : (
            <div className="border-b border-border py-12">
              <h3 className="text-xl font-light">No recent activity</h3>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
                Changes to projects, boards, columns, and cards will appear
                here.
              </p>
            </div>
          )}
        </div>
      </section>

      <ProjectSummary project={selectedProject} />
    </div>
  );
}

function ProjectFilterButton({
  label,
  detail,
  active,
  onClick,
  signal,
}: {
  label: string;
  detail: string;
  active: boolean;
  onClick: () => void;
  signal?: ProjectSignal;
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
        {signal && (
          <span
            className={cn(
              "h-1.5 w-1.5 shrink-0",
              signal.tone === "active" ? "bg-primary" : "bg-muted-foreground",
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
      <span className="mt-1 truncate font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">
        {signal ? `${signal.label} · ${detail}` : detail}
      </span>
    </button>
  );
}

function ActivityRow({
  activity,
  last,
}: {
  activity: RecentProjectHistory;
  last: boolean;
}) {
  const ActionIcon = getActivityIcon(activity);
  const user = activity.performedBy?.user;
  const actorName = user?.name ?? "System";
  const activityCopy = getActivityCopy(activity);

  return (
    <div className="grid grid-cols-[24px_minmax(0,1fr)_auto] gap-3">
      <div className="flex flex-col items-center">
        <span className="flex h-6 w-6 items-center justify-center border border-border bg-background text-muted-foreground">
          <ActionIcon className="h-3 w-3" aria-hidden />
        </span>
        {!last && <span className="min-h-8 w-px flex-1 bg-border" />}
      </div>

      <div className={cn("min-w-0 pb-6", last && "pb-0")}>
        <p className="break-words text-sm leading-relaxed">
          <span className="font-medium">{actorName}</span>{" "}
          <span className="text-muted-foreground">{activityCopy.verb}</span>
          {activityCopy.subject && (
            <>
              {" "}
              <span className="font-medium">{activityCopy.subject}</span>
            </>
          )}
          {activityCopy.detail && (
            <span className="text-muted-foreground">
              {" "}
              {activityCopy.detail}
            </span>
          )}
        </p>
        <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">
          {activity.project?.name ?? "Project activity"} ·{" "}
          {formatDistanceToNow(new Date(activity.createdAt), {
            addSuffix: true,
          })}
        </p>
      </div>

      <Avatar className="h-5 w-5 shrink-0">
        <AvatarImage src={user?.imageUrl ?? undefined} alt="" />
        <AvatarFallback className="text-[8px]">
          {getInitials(actorName)}
        </AvatarFallback>
      </Avatar>
    </div>
  );
}

function ProjectSummary({ project }: { project: Project }) {
  const boards = [...(project.boards ?? [])].sort(
    (first, second) => getBoardTimestamp(second) - getBoardTimestamp(first),
  );
  const signal = getProjectSignal(project);

  return (
    <aside className="min-h-0 lg:overflow-y-auto">
      <div className="border-b border-border px-5 py-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-mono text-[9px] uppercase tracking-[0.11em] text-muted-foreground">
              In view
            </p>
            <h2 className="mt-2 truncate text-2xl font-light">
              {project.name}
            </h2>
          </div>
          <span
            className={cn(
              "mt-1 inline-flex items-center gap-1.5 whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.08em]",
              signal.tone === "active"
                ? "text-primary"
                : "text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5",
                signal.tone === "active" ? "bg-primary" : "bg-muted-foreground",
              )}
              aria-hidden
            />
            {signal.label}
          </span>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-4 font-mono text-[9px] uppercase tracking-[0.08em]">
          <div>
            <dt className="text-muted-foreground">Boards</dt>
            <dd className="mt-1 text-sm text-foreground">{boards.length}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">People</dt>
            <dd className="mt-1 text-sm text-foreground">
              {project.projectUsers?.length ?? 0}
            </dd>
          </div>
        </dl>

        <MemberStack project={project} className="mt-5" />
      </div>

      <div className="px-5 py-5">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-sm font-medium">Boards</h3>
          <span className="font-mono text-[9px] text-muted-foreground">
            {String(boards.length).padStart(2, "0")}
          </span>
        </div>

        {boards.length > 0 ? (
          <div className="mt-3 border-t border-border">
            {boards.map((board) => (
              <Link
                key={board.id}
                href={`/p/${project.id}/b/${board.id}`}
                className="group flex min-h-12 items-center gap-3 border-b border-border py-2.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <span
                  className="h-3 w-0.5 shrink-0"
                  style={{
                    backgroundColor:
                      board.color ?? "hsl(var(--muted-foreground))",
                  }}
                  aria-hidden
                />
                <span className="min-w-0 flex-1 truncate text-sm transition-colors group-hover:text-primary">
                  {board.name}
                </span>
                <span className="font-mono text-[9px] text-muted-foreground">
                  {formatDistanceToNow(
                    new Date(board.updatedAt ?? board.createdAt),
                    { addSuffix: true },
                  )}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-3 border-y border-border py-4 text-sm text-muted-foreground">
            No boards in this project yet.
          </p>
        )}

        <Link
          href={`/p/${project.id}`}
          className="group mt-5 flex min-h-11 items-center justify-between border border-border px-3 text-xs transition-colors hover:border-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          Open {project.name}
          <ArrowRight
            className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
            aria-hidden
          />
        </Link>
      </div>
    </aside>
  );
}

function MemberStack({
  project,
  className,
}: {
  project: Project;
  className?: string;
}) {
  const members = project.projectUsers ?? [];

  return (
    <div
      className={cn("flex items-center", className)}
      aria-label={`${members.length} project members`}
    >
      <div className="flex -space-x-1.5">
        {members.slice(0, 5).map((member) => (
          <Avatar
            key={member.id}
            className="h-6 w-6 ring-2 ring-background"
            title={member.user.name}
          >
            <AvatarImage src={member.user.imageUrl ?? undefined} alt="" />
            <AvatarFallback className="text-[8px]">
              {getInitials(member.user.name)}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      {members.length > 5 && (
        <span className="ml-2 font-mono text-[9px] text-muted-foreground">
          +{members.length - 5}
        </span>
      )}
    </div>
  );
}

function ActivityLoading() {
  return (
    <div className="divide-y divide-border">
      {[0, 1, 2, 3].map((index) => (
        <div key={index} className="grid grid-cols-[24px_1fr] gap-3 py-5">
          <span className="h-6 w-6 animate-pulse bg-muted" />
          <span>
            <span className="block h-3 w-4/5 animate-pulse bg-muted" />
            <span className="mt-2 block h-2 w-2/5 animate-pulse bg-muted" />
          </span>
        </div>
      ))}
    </div>
  );
}

interface ActivityCopy {
  verb: string;
  subject?: string;
  detail?: string;
}

function getActivityCopy(activity: RecentProjectHistory): ActivityCopy {
  const changes = parseChanges(activity.changes);

  if (activity.entityType === "card" && activity.action === "move") {
    const subject = getString(changes?.cardTitle);
    const from = getNestedString(changes, "from", "columnName");
    const to = getNestedString(changes, "to", "columnName");
    return {
      verb: "moved",
      subject: subject ? `“${subject}”` : "a card",
      detail: from && to ? `from ${from} to ${to}` : undefined,
    };
  }

  const entity = formatEntity(activity.entityType);
  const subject = getHistorySubject(changes, activity.action);
  const verb =
    activity.action === "create"
      ? "created"
      : activity.action === "update"
        ? "updated"
        : activity.action === "delete"
          ? "deleted"
          : "moved";

  return {
    verb: `${verb} ${withArticle(entity)}`,
    subject: subject ? `“${subject}”` : undefined,
  };
}

function getActivityIcon(activity: RecentProjectHistory) {
  if (activity.action === "move") return MoveRight;
  if (activity.entityType === "card_comment") return MessageSquare;
  if (activity.action === "delete") return Check;
  return CircleDot;
}

function groupActivity(items: RecentProjectHistory[]): ActivityGroup[] {
  const groups: Record<string, RecentProjectHistory[]> = {
    Today: [],
    Yesterday: [],
    Earlier: [],
  };

  items.forEach((item) => {
    const date = new Date(item.createdAt);
    if (isToday(date)) groups.Today!.push(item);
    else if (isYesterday(date)) groups.Yesterday!.push(item);
    else groups.Earlier!.push(item);
  });

  return Object.entries(groups).filter(([, group]) => group.length > 0);
}

interface ProjectSignal {
  label: string;
  tone: "active" | "quiet";
}

function getProjectSignal(project: Project): ProjectSignal {
  const timestamp = getProjectTimestamp(project);
  const date = new Date(timestamp);

  if (isToday(date)) return { label: "Active today", tone: "active" };

  if (
    isWithinInterval(date, {
      start: subDays(new Date(), 7),
      end: new Date(),
    })
  ) {
    return { label: "Active this week", tone: "active" };
  }

  return { label: "Quiet", tone: "quiet" };
}

function getProjectTimestamp(project: Project) {
  return Math.max(
    new Date(project.updatedAt ?? project.createdAt).getTime(),
    ...(project.boards ?? []).map(getBoardTimestamp),
  );
}

function getBoardTimestamp(board: Project["boards"][number]) {
  return new Date(board.updatedAt ?? board.createdAt).getTime();
}

function parseChanges(changes: string | null) {
  if (!changes) return null;
  try {
    return JSON.parse(changes) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function getHistorySubject(
  changes: Record<string, unknown> | null,
  action: RecentProjectHistory["action"],
) {
  if (!changes) return undefined;
  const direct =
    getChangedString(changes.title) ?? getChangedString(changes.name);
  if (direct) return direct;

  const source = action === "delete" ? "before" : "after";
  return (
    getNestedString(changes, source, "title") ??
    getNestedString(changes, source, "name")
  );
}

function getChangedString(value: unknown) {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return undefined;
  return getString((value as Record<string, unknown>).new);
}

function getNestedString(
  source: Record<string, unknown> | null,
  parent: string,
  child: string,
) {
  const value = source?.[parent];
  if (!value || typeof value !== "object") return undefined;
  return getString((value as Record<string, unknown>)[child]);
}

function getString(value: unknown) {
  return typeof value === "string" && value ? value : undefined;
}

function formatEntity(entity: RecentProjectHistory["entityType"]) {
  if (entity === "project_user") return "team member";
  if (entity === "card_comment") return "comment";
  return entity.replace("_", " ");
}

function withArticle(value: string) {
  const article = /^[aeiou]/i.test(value) ? "an" : "a";
  return `${article} ${value}`;
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}
