"use client";

import { useAuth } from "@clerk/nextjs";
import { useQueryClient } from "@tanstack/react-query";

import { type Project, type ProjectUser } from "~/app/(project)/_types";
import { useProjectEvent, useProjectUserEvent } from "~/lib/hooks/pusher";
import { useTRPC } from "~/trpc/client";

type RealtimePayload<I, P> = {
  input: I;
  returning: P;
  userId: string;
};

export function ProjectRealtimeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const { userId } = useAuth();

  const isExternalUpdate = (eventUserId: string) => {
    return userId !== eventUserId;
  };

  // Project events
  useProjectEvent("created", (data: RealtimePayload<Project, Project>) => {
    const { userId: eventUserId } = data;

    if (isExternalUpdate(eventUserId)) {
      void queryClient.invalidateQueries({
        queryKey: trpc.project.list.queryKey(),
      });
    }
  });

  useProjectEvent(
    "updated",
    (
      data: RealtimePayload<
        { projectId: string; data: Partial<Project> },
        Project
      >,
    ) => {
      const { returning, userId: eventUserId } = data;

      if (isExternalUpdate(eventUserId) && returning?.id) {
        void queryClient.invalidateQueries({
          queryKey: trpc.project.list.queryKey(),
        });
        void queryClient.invalidateQueries({
          queryKey: trpc.project.get.queryKey(returning.id),
        });
      }
    },
  );

  useProjectEvent("deleted", (data: RealtimePayload<string, Project>) => {
    const { userId: eventUserId } = data;

    if (isExternalUpdate(eventUserId)) {
      void queryClient.invalidateQueries({
        queryKey: trpc.project.list.queryKey(),
      });
    }
  });

  // Project User events
  useProjectUserEvent(
    "added",
    (data: RealtimePayload<ProjectUser, ProjectUser>) => {
      const { returning, userId: eventUserId } = data;

      if (isExternalUpdate(eventUserId) && returning?.projectId) {
        void queryClient.invalidateQueries({
          queryKey: trpc.projectUser.list.queryKey(returning.projectId),
        });
        void queryClient.invalidateQueries({
          queryKey: trpc.project.get.queryKey(returning.projectId),
        });
      }
    },
  );

  useProjectUserEvent(
    "updated",
    (data: RealtimePayload<ProjectUser, ProjectUser>) => {
      const { returning, userId: eventUserId } = data;

      if (isExternalUpdate(eventUserId) && returning?.projectId) {
        void queryClient.invalidateQueries({
          queryKey: trpc.projectUser.list.queryKey(returning.projectId),
        });
      }
    },
  );

  useProjectUserEvent(
    "removed",
    (data: RealtimePayload<ProjectUser, ProjectUser>) => {
      const { returning, userId: eventUserId } = data;

      if (isExternalUpdate(eventUserId) && returning?.projectId) {
        void queryClient.invalidateQueries({
          queryKey: trpc.projectUser.list.queryKey(returning.projectId),
        });
        void queryClient.invalidateQueries({
          queryKey: trpc.project.get.queryKey(returning.projectId),
        });
      }
    },
  );

  return <>{children}</>;
}
