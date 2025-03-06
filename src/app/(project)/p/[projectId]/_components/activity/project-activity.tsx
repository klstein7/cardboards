"use client";

import { ActivityIcon, Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useProjectHistoryPaginated, useProjectUsers } from "~/lib/hooks";

import { ActivityItem } from "./activity-item";
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
    <Card className="overflow-hidden border shadow">
      <CardHeader className="bg-muted/50 px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ActivityIcon className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Activity</CardTitle>
          </div>
          <CardDescription className="hidden sm:block">
            Recent project changes
          </CardDescription>
        </div>
      </CardHeader>
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
  );
}
