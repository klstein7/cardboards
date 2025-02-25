import { useCurrentProjectUser } from ".";

export function useIsAdmin() {
  const { data } = useCurrentProjectUser();
  return data?.role === "admin";
}
