"use client";

import { LayoutGridIcon, PlusIcon, Search } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { CreateBoardDialog } from "~/app/(project)/_components/create-board-dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useBoards } from "~/lib/hooks";

import { BoardItem } from "./board-item";

interface BoardListProps {
  projectId: string;
}

type SortOption = "newest" | "oldest" | "a-z" | "z-a" | "recent";

export function BoardList({ projectId }: BoardListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search boards..."
            className="w-full pl-9"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        <Select
          value={sortOption}
          onValueChange={(value) => handleSortChange(value as SortOption)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
            <SelectItem value="a-z">Name (A-Z)</SelectItem>
            <SelectItem value="z-a">Name (Z-A)</SelectItem>
            <SelectItem value="recent">Recently updated</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            className="rounded-r-none border-r-0"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGridIcon className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            className="rounded-l-none"
            onClick={() => setViewMode("list")}
          >
            <LayoutGridIcon className="h-4 w-4 rotate-90" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Boards</h2>
          {totalBoards > 0 && (
            <span className="inline-flex h-6 items-center rounded-full bg-secondary px-2 text-xs font-medium">
              {hasFilters ? `${filteredCount} / ${totalBoards}` : totalBoards}
            </span>
          )}
        </div>

        {hasFilters && (
          <Button
            variant="link"
            size="sm"
            onClick={handleClearSearch}
            className="h-auto p-0 text-xs"
          >
            Clear filters
          </Button>
        )}
      </div>

      {boards.isPending ? (
        <div className="grid place-items-center rounded-lg border border-dashed py-12">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-sm text-muted-foreground">Loading boards...</p>
          </div>
        </div>
      ) : boards.error ? (
        <div className="grid place-items-center rounded-lg border border-dashed py-12 text-destructive">
          <p>Error loading boards. Please try again.</p>
        </div>
      ) : sortedBoards.length === 0 ? (
        hasFilters ? (
          <div className="grid place-items-center rounded-lg border border-dashed py-12">
            <div className="flex flex-col items-center">
              <h3 className="text-xl font-semibold">No matching boards</h3>
              <p className="mb-4 mt-2 text-center text-muted-foreground">
                No boards match your search criteria.
              </p>
              <Button variant="outline" onClick={handleClearSearch}>
                Clear search
              </Button>
            </div>
          </div>
        ) : (
          <EmptyState projectId={projectId} />
        )
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid gap-5 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              : "space-y-4"
          }
        >
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
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 px-6 py-12 text-center">
      <div className="mb-4 rounded-full bg-primary/10 p-3">
        <LayoutGridIcon className="h-10 w-10 text-primary/70" />
      </div>
      <h3 className="text-xl font-semibold">No boards yet</h3>
      <p className="mb-6 mt-2 max-w-sm text-muted-foreground">
        Create your first board to start organizing your project tasks and track
        your progress.
      </p>
      <CreateBoardDialog
        trigger={
          <Button className="gap-1.5">
            <PlusIcon className="h-4 w-4" />
            <span>Create First Board</span>
          </Button>
        }
        projectId={projectId}
      />
    </div>
  );
}
