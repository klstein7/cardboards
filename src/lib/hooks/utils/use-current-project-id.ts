import { useParams } from "next/navigation";

export function useCurrentProjectId() {
  const params = useParams();
  return params?.projectId as string | undefined;
}

export function useStrictCurrentProjectId() {
  const params = useParams();
  return params?.projectId as string;
}
