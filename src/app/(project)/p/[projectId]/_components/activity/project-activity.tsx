"use client";

import { ActivityIcon, Loader2 } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useState } from "react";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useProjectHistoryPaginated, useProjectUsers } from "~/lib/hooks";

import { ActivityFilters } from "./activity-filters";
import { ActivityItem } from "./activity-item";
import { ActivitySearch } from "./activity-search";
import { ActivitySkeleton } from "./activity-skeleton";

interface ProjectActivityProps {
  projectId: string;
}

/**
 * Displays the activity feed for a project
 */
export function ProjectActivity({ projectId }: ProjectActivityProps) {
  const [limit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Query params
  const [search, setSearch] = useQueryState("search", parseAsString);
  const [activityType] = useQueryState("type", parseAsString);
  const [timeFrame] = useQueryState("timeFrame", parseAsString);

  const projectUsers = useProjectUsers(projectId);
  const history = useProjectHistoryPaginated(projectId, limit, offset);

  // Handle loading more activity items
  const loadMore = () => {
    setIsLoadingMore(true);
    setOffset((prev) => prev + limit);

    // Simulate network delay for smoother UX
    setTimeout(() => {
      setIsLoadingMore(false);
    }, 500);
  };

  // Handle search change
  const handleSearchChange = (value: string) => {
    if (value === "") {
      void setSearch(null);
    } else {
      void setSearch(value);
    }
  };

  // Handle clear search
  const handleClearSearch = () => {
    void setSearch(null);
  };

  // Reset offset when filters change
  useEffect(() => {
    setOffset(0);
  }, [search, activityType, timeFrame]);

  // Loading state
  if (history.isLoading || projectUsers.isLoading) {
    return <ActivitySkeleton />;
  }

  // Error state
  if (history.isError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground">
            <ActivityIcon className="h-5 w-5" />
            <p>Error loading activity: {history.error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!history.data?.items || history.data.items.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground">
            <ActivityIcon className="h-5 w-5" />
            <p>No activity recorded yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { items, pagination } = history.data;
  const hasMore = pagination.total > items.length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <ActivitySearch
          searchQuery={search ?? ""}
          onChange={handleSearchChange}
          onClear={handleClearSearch}
        />
        <ActivityFilters />
      </div>

      <Card className="overflow-hidden border shadow">
        <CardContent className="p-0">
          <div className="divide-y">
            {items.map((item) => (
              <ActivityItem key={item.id} item={item} />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center p-4">
              <Button
                variant="outline"
                size="sm"
                onClick={loadMore}
                disabled={isLoadingMore}
                className="w-full max-w-[200px]"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load more"
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
