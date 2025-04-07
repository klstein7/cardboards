import { useMutation } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

export function useGenerateSingleCard() {
  const trpc = useTRPC();

  return useMutation(trpc.card.generateSingle.mutationOptions());
}
