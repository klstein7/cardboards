import { FileText, LayoutGridIcon, UsersIcon } from "lucide-react";

import { Card } from "~/components/ui/card";
import { cn } from "~/lib/utils";

export function ProjectStats({
  boardCount,
  memberCount,
  cardCount,
}: {
  boardCount: number;
  memberCount: number;
  cardCount: number;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard
        icon={LayoutGridIcon}
        value={boardCount}
        label="Active boards"
        className="border-chart-1/20 bg-chart-1/5"
      />
      <StatCard
        icon={UsersIcon}
        value={memberCount}
        label="Team members"
        className="border-chart-2/20 bg-chart-2/5"
      />
      <StatCard
        icon={FileText}
        value={cardCount}
        label="Total cards"
        className="border-chart-3/20 bg-chart-3/5"
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
        "h-full p-6",
        "border bg-card/80 backdrop-blur-sm",
        className,
      )}
    >
      <div className="flex h-full flex-col justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-foreground/5 p-2">
            <Icon className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="text-3xl font-semibold tabular-nums text-card-foreground">
            {value.toLocaleString()}
          </div>
        </div>
        <div className="text-sm font-medium text-muted-foreground">{label}</div>
      </div>
    </Card>
  );
}
