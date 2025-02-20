import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";

import { useDebounce } from ".";

export function useDebouncedAssignedTo() {
  const [assignedTo] = useQueryState(
    "assignedTo",
    parseAsArrayOf(parseAsString),
  );

  const debouncedAssignedToString = useDebounce(
    JSON.stringify(assignedTo ?? []),
  );

  return JSON.parse(debouncedAssignedToString) as string[];
}
