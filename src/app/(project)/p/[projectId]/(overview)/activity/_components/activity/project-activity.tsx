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
import { useProjectHistoryPaginated } from "~/lib/hooks";

import { ActivityItem } from "./activity-item";

interface ProjectActivityProps {
  projectId: string;
}

export function ProjectActivity({ projectId }: ProjectActivityProps) {
  const [limit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const history = useProjectHistoryPaginated(projectId, limit, offset);

  const loadMore = () => {
    setIsLoadingMore(true);
    setOffset((prev) => prev + limit);

    setTimeout(() => {
      setIsLoadingMore(false);
    }, 500);
  };

  if (history.isError) {
    return (
      <Card className="overflow-hidden border border-destructive/10 shadow-sm transition-all">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
            <ActivityIcon className="h-5 w-5 text-destructive/70" />
            <p>Error loading activity: {history.error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!history.data?.items || history.data.items.length === 0) {
    return (
      <Card className="overflow-hidden border shadow-sm transition-all">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <div className="rounded-full bg-muted p-3">
              <ActivityIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-muted-foreground">
                No activity recorded yet
              </p>
              <p className="text-sm text-muted-foreground/70">
                Activity will appear here as changes are made to the project
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { items, pagination } = history.data;
  const hasMore = pagination.total > items.length;

  return (
    <Card className="overflow-hidden border shadow-sm transition-all hover:shadow">
      <CardHeader className="bg-muted/40 px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-primary/10 p-1.5">
              <ActivityIcon className="h-4 w-4 text-primary" />
            </div>
            <CardTitle>Activity</CardTitle>
          </div>
          <CardDescription className="hidden sm:block">
            Recent project changes
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/60">
          {items.map((item) => (
            <ActivityItem key={item.id} item={item} />
          ))}
        </div>

        {hasMore && (
          <div className="flex justify-center p-4 pb-5">
            <Button
              variant="outline"
              size="sm"
              onClick={loadMore}
              disabled={isLoadingMore}
              className="w-full max-w-[200px] transition-all hover:bg-primary/5"
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
