"use client";

import { FileText, LayoutGridIcon, UsersIcon } from "lucide-react";

import { Card, CardContent } from "~/components/ui/card";
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
      className={cn("mb-6 grid grid-cols-2 gap-4 md:grid-cols-3", className)}
    >
      <StatCard
        icon={<LayoutGridIcon className="h-5 w-5 text-primary" />}
        value={boardCount.data ?? 0}
        label="Active boards"
      />
      <StatCard
        icon={<UsersIcon className="h-5 w-5 text-blue-500" />}
        value={memberCount.data ?? 0}
        label="Team members"
      />
      <StatCard
        icon={<FileText className="h-5 w-5 text-purple-500" />}
        value={cardCount.data ?? 0}
        label="Total cards"
      />
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <Card className="bg-card/50 backdrop-blur-sm transition-all duration-200 hover:shadow-md">
      <CardContent className="flex p-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/50">
          {icon}
        </div>
        <div className="ml-4 flex flex-col justify-center">
          <span className="text-sm font-medium text-muted-foreground">
            {label}
          </span>
          <span className="mt-0.5 text-2xl font-bold">
            {value.toLocaleString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
