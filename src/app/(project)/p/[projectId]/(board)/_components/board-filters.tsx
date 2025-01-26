"use client";

import { Search } from "lucide-react";
import { useQueryState } from "nuqs";

import { Input } from "~/components/ui/input";
import { MultiSelect } from "~/components/ui/multi-select";
import { useCardsByCurrentBoardId } from "~/lib/hooks";

export function BoardFilters() {
  const [search, setSearch] = useQueryState("search");
  const [labels, setLabels] = useQueryState("labels", {
    parse: (value) => value.split(",").filter(Boolean),
    serialize: (value) => value.join(","),
  });
  const cards = useCardsByCurrentBoardId();

  const uniqueLabels = cards
    .flatMap((card) => card.labels)
    .filter((label): label is string => Boolean(label))
    .reduce(
      (unique, label) => (unique.includes(label) ? unique : [...unique, label]),
      [] as string[],
    )
    .sort()
    .map((label) => ({ label, value: label }));

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <MultiSelect
          options={uniqueLabels}
          onValueChange={(value) => {
            void setLabels(value.length > 0 ? value : null);
          }}
        />
      </div>
      <div className="relative hidden sm:block">
        <Input
          className="min-w-80 pl-9"
          placeholder="Search"
          defaultValue={search ?? undefined}
          onChange={(e) => {
            if (e.target.value === "") {
              void setSearch(null);
            } else {
              void setSearch(e.target.value);
            }
          }}
        />
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      </div>
    </div>
  );
}
