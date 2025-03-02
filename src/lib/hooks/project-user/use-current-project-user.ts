import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

import { useCurrentProjectId } from "../utils";

export function useCurrentProjectUser() {
  const trpc = useTRPC();
  const projectId = useCurrentProjectId();

  return useQuery({
    ...trpc.projectUser.getCurrentProjectUser.queryOptions(projectId),
  });
}
