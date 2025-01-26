import { parseAsString, useQueryState } from "nuqs";

import { useDebounce } from "~/lib/hooks/utils";

export function useDebouncedSearch() {
  const [search] = useQueryState("search", parseAsString);
  return useDebounce(search ?? "");
}
