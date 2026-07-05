"use client";

import {
  useBoardCountByProjectId,
  useCardCountByProjectId,
  useProjectUserCountByProjectId,
} from "~/lib/hooks";
import { cn } from "~/lib/utils";

interface ProjectStatsProps {
  projectId: string;
  className?: string;
}

export function ProjectStats({ projectId, className }: ProjectStatsProps) {
  const boardCount = useBoardCountByProjectId(projectId);
  const memberCount = useProjectUserCountByProjectId(projectId);
  const cardCount = useCardCountByProjectId(projectId);

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-3",
        className,
      )}
    >
      <Stat label="Active boards" value={boardCount.data ?? 0} />
      <Stat label="Team members" value={memberCount.data ?? 0} />
      <Stat label="Total cards" value={cardCount.data ?? 0} accent />
    </div>
  );
}

interface StatProps {
  label: string;
  value: number;
  accent?: boolean;
}

function Stat({ label, value, accent }: StatProps) {
  return (
    <div
      className={cn(
        "border-t-2 pt-5",
        accent ? "border-primary" : "border-border",
      )}
    >
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 text-4xl font-extralight tracking-tight tabular-nums md:text-5xl",
          accent && "text-primary",
        )}
      >
        {value.toLocaleString()}
      </p>
    </div>
  );
}
