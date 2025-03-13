import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

import { useStrictCurrentProjectId } from "../utils";

export function useCurrentProjectUser() {
  const trpc = useTRPC();
  const projectId = useStrictCurrentProjectId();

  return useQuery({
    ...trpc.projectUser.getCurrentProjectUser.queryOptions(projectId),
  });
}
