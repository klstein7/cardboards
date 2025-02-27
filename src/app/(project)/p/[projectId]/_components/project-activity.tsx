"use client";

import { formatDistanceToNow } from "date-fns";
import { Clock } from "lucide-react";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { useProjectUsers } from "~/lib/hooks";

interface ProjectActivityProps {
  projectId: string;
}

// This is a placeholder component. In a real application, you would fetch
// actual activity data from your API and display it here.
export function ProjectActivity({ projectId }: ProjectActivityProps) {
  const [isLoading, setIsLoading] = useState(false);
  const projectUsers = useProjectUsers(projectId);

  // Placeholder activity data - would come from API in real implementation
  const activities = [
    {
      id: "1",
      userId: projectUsers.data?.[0]?.user.id ?? "user1",
      action: "created a card",
      target: "Setup API authentication",
      boardName: "Backend Development",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    },
    {
      id: "2",
      userId: projectUsers.data?.[1]?.user.id ?? "user2",
      action: "updated",
      target: "Design homepage mockup",
      boardName: "UI Design",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
    {
      id: "3",
      userId: projectUsers.data?.[0]?.user.id ?? "user1",
      action: "moved",
      target: "Implement user registration",
      boardName: "Backend Development",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    },
    {
      id: "4",
      userId: projectUsers.data?.[2]?.user.id ?? "user3",
      action: "completed",
      target: "Create database schema",
      boardName: "Database",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    },
    {
      id: "5",
      userId: projectUsers.data?.[1]?.user.id ?? "user2",
      action: "commented on",
      target: "Mobile responsive layout",
      boardName: "UI Design",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    },
  ];

  const getUserById = (userId: string) => {
    return projectUsers.data?.find(
      (projectUser) => projectUser.user.id === userId,
    )?.user;
  };

  const loadMore = () => {
    setIsLoading(true);
    // Simulate loading more activities
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  if (projectUsers.isLoading) {
    return <ActivitySkeleton />;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {activities.map((activity) => {
          const user = getUserById(activity.userId);

          return (
            <div key={activity.id} className="flex items-start gap-3">
              <Avatar className="mt-0.5 h-8 w-8">
                <AvatarImage src={user?.imageUrl ?? undefined} />
                <AvatarFallback>{user?.name.charAt(0) ?? "U"}</AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-1 text-sm">
                  <span className="font-medium">{user?.name ?? "User"}</span>
                  <span>{activity.action}</span>
                  <span className="font-medium">
                    &quot;{activity.target}&quot;
                  </span>
                  <span>in</span>
                  <span className="font-medium">{activity.boardName}</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{formatDistanceToNow(activity.timestamp)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={loadMore}
        disabled={isLoading}
      >
        {isLoading ? "Loading..." : "Load more activity"}
      </Button>
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-start gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full max-w-[250px]" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
