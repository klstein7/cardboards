"use client";

import { SearchIcon, XIcon } from "lucide-react";
import { useCallback } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export type ProjectSortOption = "recent" | "name" | "members" | "boards";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortOption: ProjectSortOption;
  setSortOption: (option: ProjectSortOption) => void;
}

export function SearchBar({
  searchQuery,
  setSearchQuery,
  sortOption,
  setSortOption,
}: SearchBarProps) {
  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, [setSearchQuery]);

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
      <label className="flex min-w-[200px] max-w-xs flex-1 items-center gap-2 border-b border-border pb-1 transition-colors focus-within:border-foreground/60">
        <SearchIcon className="size-3.5 shrink-0 text-muted-foreground" />
        <input
          placeholder="Search projects"
          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            onClick={handleClearSearch}
            className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Clear search"
          >
            <XIcon className="size-3" />
          </button>
        )}
      </label>
      <Select
        value={sortOption}
        onValueChange={(value) => setSortOption(value as ProjectSortOption)}
      >
        <SelectTrigger className="h-auto w-auto gap-1.5 border-0 border-b border-border px-0 pb-1 text-sm text-muted-foreground focus:ring-0">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="recent">Most recent</SelectItem>
          <SelectItem value="name">Name</SelectItem>
          <SelectItem value="members">Most members</SelectItem>
          <SelectItem value="boards">Most boards</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
