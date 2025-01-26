import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";

import { useDebounce } from "~/lib/hooks/utils";

export function useDebouncedLabels() {
  const [labels] = useQueryState("labels", parseAsArrayOf(parseAsString));
  const debouncedLabelsString = useDebounce(JSON.stringify(labels ?? []));
  return JSON.parse(debouncedLabelsString) as string[];
}
