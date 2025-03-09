import { useParams } from "next/navigation";

export function useCurrentProjectId() {
  const params = useParams();
  // In client components, params is already resolved, but we should add type safety
  return params?.projectId as string | undefined;
}
