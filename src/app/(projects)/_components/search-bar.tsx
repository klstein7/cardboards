"use client";

import { SearchIcon, XIcon } from "lucide-react";
import { useCallback } from "react";

import { Input } from "~/components/ui/input";
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
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-[200px] flex-1">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search projects..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Clear search"
          >
            <XIcon className="h-4 w-4" />
          </button>
        )}
      </div>
      <Select
        value={sortOption}
        onValueChange={(value) => setSortOption(value as ProjectSortOption)}
      >
        <SelectTrigger className="w-[150px]">
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
