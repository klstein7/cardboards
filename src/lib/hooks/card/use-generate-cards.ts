import { useMutation } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

export function useGenerateCards() {
  const trpc = useTRPC();

  return useMutation(trpc.card.generate.mutationOptions());
}
