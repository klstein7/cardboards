import {
  ArrowUpIcon,
  CheckCircleIcon,
  ListTodoIcon,
  UsersIcon,
} from "lucide-react";

import { Card, CardContent } from "~/components/ui/card";
import { cn } from "~/lib/utils";

interface SummaryStatsProps {
  totalTasks: number;
  completionRate: number;
  activeUsers: number;
  totalBoards: number;
}

export function SummaryStats({
  totalTasks,
  completionRate,
  activeUsers,
  totalBoards,
}: SummaryStatsProps) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
      <StatCard
        icon={<ListTodoIcon className="h-5 w-5 text-primary" />}
        label="Total Tasks"
        value={totalTasks}
      />

      <StatCard
        icon={<CheckCircleIcon className="h-5 w-5 text-green-500" />}
        label="Completion Rate"
        value={`${completionRate}%`}
        highlight={completionRate > 75}
      />

      <StatCard
        icon={<UsersIcon className="h-5 w-5 text-blue-500" />}
        label="Active Users"
        value={activeUsers}
      />

      <StatCard
        icon={<ArrowUpIcon className="h-5 w-5 text-purple-500" />}
        label="Boards"
        value={totalBoards}
      />
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  highlight?: boolean;
}

function StatCard({ icon, label, value, highlight = false }: StatCardProps) {
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
          <span
            className={cn(
              "mt-0.5 text-2xl font-bold",
              highlight && "text-green-500",
            )}
          >
            {value}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
