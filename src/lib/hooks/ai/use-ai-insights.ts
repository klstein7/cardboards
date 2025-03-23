"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";
import { type RouterOutputs } from "~/trpc/init";

type EntityType = "board" | "project";
export type AiInsight = RouterOutputs["aiInsight"]["get"];

/**
 * Custom hook to fetch active AI insights for a board or project
 */
export function useAiInsights(entityType: EntityType, entityId: string) {
  const trpc = useTRPC();

  return useQuery({
    ...trpc.aiInsight.listActiveByEntity.queryOptions({
      entityType,
      entityId,
    }),
    enabled: !!entityId,
  });
}

/**
 * Custom hook to generate AI insights for a board
 */
export function useGenerateBoardInsights() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.aiInsight.generateBoardInsights.mutationOptions({
      onSuccess: async (_, boardId) => {
        await queryClient.invalidateQueries({
          queryKey: trpc.aiInsight.listActiveByEntity.queryKey({
            entityType: "board",
            entityId: boardId,
          }),
        });
      },
    }),
  });
}

/**
 * Custom hook to generate AI insights for a project
 */
export function useGenerateProjectInsights() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.aiInsight.generateProjectInsights.mutationOptions({
      onSuccess: async (_, projectId) => {
        await queryClient.invalidateQueries({
          queryKey: trpc.aiInsight.listActiveByEntity.queryKey({
            entityType: "project",
            entityId: projectId,
          }),
        });
      },
    }),
  });
}
