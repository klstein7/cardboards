"use client";

import { FileText, LayoutGridIcon, UsersIcon } from "lucide-react";

import { Card } from "~/components/ui/card";
import {
  useBoardCountByProjectId,
  useCardCountByProjectId,
  useProjectUserCountByProjectId,
} from "~/lib/hooks";
import { cn } from "~/lib/utils";

interface ProjectStatsProps {
  projectId: string;
}

export function ProjectStats({ projectId }: ProjectStatsProps) {
  const boardCount = useBoardCountByProjectId(projectId);
  const memberCount = useProjectUserCountByProjectId(projectId);
  const cardCount = useCardCountByProjectId(projectId);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard
        icon={LayoutGridIcon}
        value={boardCount.data ?? 0}
        label="Active boards"
      />
      <StatCard
        icon={UsersIcon}
        value={memberCount.data ?? 0}
        label="Team members"
      />
      <StatCard
        icon={FileText}
        value={cardCount.data ?? 0}
        label="Total cards"
      />
    </div>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  label: string;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "group border-border/80 bg-secondary/20 shadow-lg transition-all duration-200 hover:border-primary hover:bg-secondary/30 hover:shadow-xl",
        className,
      )}
    >
      <div className="relative flex items-center gap-4 p-6">
        <div className="rounded-full bg-primary/10 p-3 shadow-sm transition-colors group-hover:bg-primary/20">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div className="space-y-1">
          <div className="text-3xl font-semibold tabular-nums tracking-tight text-foreground">
            {value.toLocaleString()}
          </div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
        </div>
      </div>
    </Card>
  );
}
