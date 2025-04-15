"use client";

import { SearchIcon, SlidersHorizontal, XIcon } from "lucide-react";
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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-foreground">Projects</h2>
          {totalProjects > 0 && (
            <span className="rounded-full bg-muted/80 px-2.5 py-0.5 text-xs font-medium text-foreground">
              {hasFilters ? `${filteredCount}/${totalProjects}` : totalProjects}
            </span>
          )}
        </div>

        {hasFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearSearch}
            className="h-8 border-border text-xs font-medium text-foreground hover:bg-muted/50"
          >
            Clear filters
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-md border border-border bg-background/80 p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/70" />
          <Input
            placeholder="Search projects..."
            className="h-10 border-border bg-background pl-9 text-foreground shadow-sm focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/70 hover:text-foreground"
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
            <SelectTrigger className="h-10 w-[160px] border-border bg-background shadow-sm">
              <SlidersHorizontal className="mr-2 h-3.5 w-3.5 text-foreground/70" />
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
    </div>
  );
}
