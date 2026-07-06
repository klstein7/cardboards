"use client";

import { LayoutGridIcon, PlusIcon, Search, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { CreateBoardDialog } from "~/app/(project)/_components/create-board-dialog";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Skeleton } from "~/components/ui/skeleton";
import { useBoards } from "~/lib/hooks";

import { BoardItem } from "./board-item";

interface BoardListProps {
  projectId: string;
}

type SortOption = "newest" | "oldest" | "a-z" | "z-a" | "recent";

export function BoardList({ projectId }: BoardListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("newest");

  const boards = useBoards(projectId);

  const filteredBoards = useMemo(() => {
    if (!boards.data) return [];
    if (!searchQuery.trim()) return boards.data;

    const query = searchQuery.toLowerCase().trim();
    return boards.data.filter((board) =>
      board.name.toLowerCase().includes(query),
    );
  }, [boards.data, searchQuery]);

  const sortedBoards = useMemo(() => {
    if (!filteredBoards.length) return [];

    const boardsCopy = [...filteredBoards];

    switch (sortOption) {
      case "newest":
        return boardsCopy.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      case "oldest":
        return boardsCopy.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
      case "a-z":
        return boardsCopy.sort((a, b) => a.name.localeCompare(b.name));
      case "z-a":
        return boardsCopy.sort((a, b) => b.name.localeCompare(a.name));
      case "recent":
        return boardsCopy.sort(
          (a, b) =>
            new Date(b.updatedAt ?? b.createdAt).getTime() -
            new Date(a.updatedAt ?? a.createdAt).getTime(),
        );
      default:
        return boardsCopy;
    }
  }, [filteredBoards, sortOption]);

  const totalBoards = boards.data?.length ?? 0;
  const filteredCount = filteredBoards.length;
  const hasFilters = searchQuery.trim() !== "";

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    [],
  );

  const handleSortChange = useCallback((value: SortOption) => {
    setSortOption(value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex items-baseline gap-3">
          <h2 className="text-2xl font-light tracking-tight">Boards</h2>
          {totalBoards > 0 && (
            <span className="font-mono text-xs text-muted-foreground">
              {hasFilters ? `${filteredCount} of ${totalBoards}` : totalBoards}{" "}
              {totalBoards === 1 ? "board" : "boards"}
            </span>
          )}
        </div>

        <div className="ml-auto flex items-center gap-5">
          <label className="flex w-44 items-center gap-2 border-b border-border pb-1 transition-colors focus-within:border-foreground/60">
            <Search className="size-3.5 shrink-0 text-muted-foreground" />
            <input
              placeholder="Search boards"
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {hasFilters && (
              <button
                className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                onClick={handleClearSearch}
              >
                <X className="size-3" />
                <span className="sr-only">Clear search</span>
              </button>
            )}
          </label>

          <Select
            value={sortOption}
            onValueChange={(value) => handleSortChange(value as SortOption)}
          >
            <SelectTrigger className="h-auto w-auto gap-1.5 border-0 border-b border-border px-0 pb-1 text-sm text-muted-foreground focus:ring-0">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="a-z">A-Z</SelectItem>
              <SelectItem value="z-a">Z-A</SelectItem>
              <SelectItem value="recent">Recent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {boards.isPending ? (
        <div className="divide-y divide-border border-t border-border">
          {[1, 2, 3].map((row) => (
            <div key={row} className="flex items-baseline justify-between py-5">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      ) : boards.error ? (
        <div className="grid place-items-center border border-dashed border-border py-10 text-destructive">
          <p className="text-sm">Error loading boards. Please try again.</p>
        </div>
      ) : sortedBoards.length === 0 ? (
        hasFilters ? (
          <div className="grid place-items-center border border-dashed border-border py-10">
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-light tracking-tight">
                No matching boards
              </h3>
              <p className="mb-4 mt-1 text-center text-sm text-muted-foreground">
                No boards match your search.
              </p>
              <Button variant="outline" size="sm" onClick={handleClearSearch}>
                Clear search
              </Button>
            </div>
          </div>
        ) : (
          <EmptyState projectId={projectId} />
        )
      ) : (
        <div className="divide-y divide-border border-t border-border">
          {sortedBoards.map((board) => (
            <BoardItem key={board.id} projectId={projectId} board={board} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ projectId }: { projectId: string }) {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-border px-6 py-12 text-center">
      <LayoutGridIcon className="mb-3 h-8 w-8 text-muted-foreground/60" />
      <h3 className="text-2xl font-light tracking-tight">No boards yet</h3>
      <p className="mb-5 mt-2 max-w-sm text-sm text-muted-foreground">
        Create your first board to start organizing your project tasks.
      </p>
      <CreateBoardDialog
        trigger={
          <Button className="gap-1.5">
            <PlusIcon className="h-4 w-4" />
            <span>New board</span>
          </Button>
        }
        projectId={projectId}
      />
    </div>
  );
}
