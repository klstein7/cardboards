"use client";

import { Search } from "lucide-react";
import { useQueryState } from "nuqs";

import { Input } from "~/components/ui/input";

export function BoardFilters() {
  const [search, setSearch] = useQueryState("search");

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Input
          className="w-[300px] pl-9"
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
