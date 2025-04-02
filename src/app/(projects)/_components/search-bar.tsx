"use client";

import { SearchIcon, XIcon } from "lucide-react";
import { useCallback } from "react";

import { Button } from "~/components/ui/button";
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
  totalProjects: number;
  filteredCount: number;
  hasFilters: boolean;
}

export function SearchBar({
  searchQuery,
  setSearchQuery,
  sortOption,
  setSortOption,
  totalProjects,
  filteredCount,
  hasFilters,
}: SearchBarProps) {
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    [setSearchQuery],
  );

  const handleSortChange = useCallback(
    (value: ProjectSortOption) => {
      setSortOption(value);
    },
    [setSortOption],
  );

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, [setSearchQuery]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 rounded-lg border border-border/40 bg-background p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            className="pl-9"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <XIcon className="h-4 w-4" />
            </button>
          )}
        </div>
        <div>
          <Select
            value={sortOption}
            onValueChange={(value) =>
              handleSortChange(value as ProjectSortOption)
            }
          >
            <SelectTrigger className="w-[160px]">
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
      </div>

      {totalProjects > 0 && (
        <div className="flex items-center justify-between px-1 pt-2">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-medium">Projects</h2>
            <span className="inline-flex h-5 items-center rounded-full bg-secondary px-2 text-xs">
              {hasFilters ? `${filteredCount}/${totalProjects}` : totalProjects}
            </span>
          </div>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="h-8 px-2 text-xs"
            >
              Clear filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
