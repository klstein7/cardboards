"use client";

import {
  Activity,
  BarChart,
  Calendar,
  CheckSquare,
  Clock,
  Filter,
  LineChart,
  Pencil,
  Plus,
  Search,
  Settings,
  User,
  Users,
} from "lucide-react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";

/**
 * ANALYTICS SKELETONS
 */

// Summary stats skeleton for analytics pages
export function SummaryStatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[
        { icon: CheckSquare, label: "Total Tasks" },
        { icon: BarChart, label: "Completion Rate" },
        { icon: Users, label: "Active Users" },
        { icon: Calendar, label: "Total Boards" },
      ].map((item, i) => (
        <div key={i} className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <item.icon className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              {item.label}
            </span>
          </div>
          <div className="mt-3">
            <Skeleton className="h-7 w-16" />
          </div>
          <Skeleton className="mt-2 h-4 w-36" />
        </div>
      ))}
    </div>
  );
}

// Trend chart skeleton
export function TrendChartSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <LineChart className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Task Completion Trend</span>
          </div>
          <Skeleton className="h-4 w-56" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      </div>
      <div className="mt-6">
        <Skeleton className="h-[250px] w-full" />
      </div>
    </div>
  );
}

// Chart grid skeleton
export function ChartGridSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Due Date Chart */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="mb-4 space-y-1">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Tasks by Due Date</span>
          </div>
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex h-[200px] items-center justify-center">
          <Skeleton className="h-[180px] w-[180px] rounded-full" />
        </div>
      </div>

      {/* Priority Chart */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="mb-4 space-y-1">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Tasks by Priority</span>
          </div>
          <Skeleton className="h-4 w-52" />
        </div>
        <div className="flex h-[200px] items-center justify-center">
          <Skeleton className="h-[180px] w-[180px] rounded-full" />
        </div>
      </div>
    </div>
  );
}

// Activity chart skeleton
export function ActivityChartSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="mb-4 space-y-1">
        <div className="flex items-center gap-2">
          <BarChart className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">User Activity</span>
        </div>
        <Skeleton className="h-4 w-56" />
      </div>

      <div className="mt-6">
        <Skeleton className="h-[300px] w-full" />
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Progress chart skeleton
export function ProgressChartSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="mb-4 space-y-1">
        <div className="flex items-center gap-2">
          <BarChart className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">Board Progress</span>
        </div>
        <Skeleton className="h-4 w-52" />
      </div>
      <div className="space-y-6 py-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-10" />
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <Skeleton
                className="h-full"
                style={{ width: `${[70, 45, 90, 30, 60][i % 5]}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * MEMBERS SKELETONS
 */

// Member list skeleton
export function MemberListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">Team Members</span>
        </div>
        <Button variant="outline" size="sm" disabled>
          <Plus className="mr-2 h-4 w-4" />
          <span>Invite</span>
        </Button>
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <div className="grid grid-cols-1 divide-y">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  <Skeleton className="h-3 w-16" />
                </Badge>
                <Button variant="ghost" size="icon" disabled>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * SETTINGS SKELETONS
 */

// Settings form skeleton
export function SettingsFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5 text-muted-foreground" />
        <span className="text-lg font-medium">Settings</span>
      </div>

      <div className="space-y-4 rounded-lg border bg-card p-6 shadow-sm">
        <div className="space-y-2">
          <div className="text-sm font-medium">Name</div>
          <Skeleton className="h-10 w-full rounded-md" />
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Description</div>
          <Skeleton className="h-24 w-full rounded-md" />
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Color</div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-md" />
            <Skeleton className="h-10 w-40 rounded-md" />
          </div>
        </div>

        <div className="pt-4">
          <Skeleton className="h-10 w-24 rounded-md" />
        </div>
      </div>
    </div>
  );
}

/**
 * PROJECT OVERVIEW SKELETONS
 */

// Project header skeleton
export function ProjectHeaderSkeleton() {
  return (
    <div className="border-b bg-card px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-6 w-48" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            <Pencil className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Edit</span>
          </Button>
          <Button variant="outline" size="sm" disabled>
            <User className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Share</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

// Search and filters skeleton
export function SearchFiltersSkeleton() {
  return (
    <div className="flex flex-wrap gap-3 border-b bg-card px-4 py-3 sm:px-6 lg:px-8">
      <div className="relative min-w-[200px] flex-1">
        <div className="flex h-9 w-full items-center rounded-md border bg-background px-3 text-sm">
          <Search className="mr-2 h-4 w-4 text-muted-foreground" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled
          className="flex items-center gap-1.5"
        >
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Filter</span>
        </Button>

        <Skeleton className="h-9 w-[130px] rounded-md" />
      </div>
    </div>
  );
}
