"use client";

import { useAuth } from "@clerk/nextjs";
import { useQueryClient } from "@tanstack/react-query";

import { type Board, type Card, type Column } from "~/app/(project)/_types";
import {
  useBoardEvent,
  useCardEvent,
  useColumnEvent,
} from "~/lib/hooks/pusher";
import { type CardMove } from "~/server/zod";
import { useTRPC } from "~/trpc/client";

type RealtimePayload<I, P> = {
  input: I;
  returning: P;
  userId: string;
};

export function BoardRealtimeProvider({
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

  // Card events
  useCardEvent("moved", (data: RealtimePayload<CardMove, Card>) => {
    console.debug("moved", data);

    const { input, userId: eventUserId } = data;

    if (isExternalUpdate(eventUserId)) {
      void queryClient.invalidateQueries({
        queryKey: trpc.card.list.queryKey(input.sourceColumnId),
      });
      void queryClient.invalidateQueries({
        queryKey: trpc.card.list.queryKey(input.destinationColumnId),
      });
    }
  });

  useCardEvent("assignedToCurrentUser", (data: RealtimePayload<Card, Card>) => {
    const { input, userId: eventUserId } = data;

    if (isExternalUpdate(eventUserId)) {
      void queryClient.invalidateQueries({
        queryKey: trpc.card.list.queryKey(input.columnId),
      });
    }
  });

  useCardEvent("created", (data: RealtimePayload<Card, Card>) => {
    const { input, userId: eventUserId } = data;

    if (isExternalUpdate(eventUserId)) {
      void queryClient.invalidateQueries({
        queryKey: trpc.card.list.queryKey(input.columnId),
      });
    }
  });

  useCardEvent("updated", (data: RealtimePayload<Card, Card>) => {
    const { input, userId: eventUserId } = data;

    if (isExternalUpdate(eventUserId)) {
      void queryClient.invalidateQueries({
        queryKey: trpc.card.list.queryKey(input.columnId),
      });
    }
  });

  useCardEvent("deleted", (data: RealtimePayload<Card, Card>) => {
    const { input, userId: eventUserId } = data;

    if (isExternalUpdate(eventUserId)) {
      void queryClient.invalidateQueries({
        queryKey: trpc.card.list.queryKey(input.columnId),
      });
    }
  });

  // Column events
  useColumnEvent(
    "created",
    (data: RealtimePayload<{ boardId: string }, Column>) => {
      const { input, userId: eventUserId } = data;

      if (isExternalUpdate(eventUserId)) {
        void queryClient.invalidateQueries({
          queryKey: trpc.column.list.queryKey(input.boardId),
        });
      }
    },
  );

  useColumnEvent(
    "updated",
    (data: RealtimePayload<{ columnId: string }, Column>) => {
      const { returning, userId: eventUserId } = data;

      if (isExternalUpdate(eventUserId)) {
        void queryClient.invalidateQueries({
          queryKey: trpc.column.list.queryKey(returning.boardId),
        });
      }
    },
  );

  useColumnEvent("deleted", (data: RealtimePayload<string, Column>) => {
    const { returning, userId: eventUserId } = data;

    if (isExternalUpdate(eventUserId)) {
      void queryClient.invalidateQueries({
        queryKey: trpc.column.list.queryKey(returning.boardId),
      });
    }
  });

  // Board events
  useBoardEvent("created", (data: RealtimePayload<Board, Board>) => {
    const { input, userId: eventUserId } = data;

    if (isExternalUpdate(eventUserId)) {
      void queryClient.invalidateQueries({
        queryKey: trpc.board.list.queryKey(input.projectId),
      });
    }
  });

  useBoardEvent(
    "updated",
    (
      data: RealtimePayload<{ boardId: string; data: Partial<Board> }, Board>,
    ) => {
      const { returning, userId: eventUserId } = data;

      if (isExternalUpdate(eventUserId)) {
        void queryClient.invalidateQueries({
          queryKey: trpc.board.list.queryKey(returning.projectId),
        });
        void queryClient.invalidateQueries({
          queryKey: trpc.board.get.queryKey(returning.id),
        });
      }
    },
  );

  useBoardEvent("deleted", (data: RealtimePayload<string, Board>) => {
    const { returning, userId: eventUserId } = data;

    if (isExternalUpdate(eventUserId)) {
      void queryClient.invalidateQueries({
        queryKey: trpc.board.list.queryKey(returning.projectId),
      });
    }
  });

  return <>{children}</>;
}
