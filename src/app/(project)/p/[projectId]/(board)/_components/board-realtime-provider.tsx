"use client";

import { useAuth } from "@clerk/nextjs";
import { useQueryClient } from "@tanstack/react-query";

import { type Card } from "~/app/(project)/_types";
import { useCardEvent } from "~/lib/hooks/pusher";
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

  return <>{children}</>;
}
