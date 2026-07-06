"use client";

import { Filter, Search, X } from "lucide-react";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  useCachedCardsByCurrentBoard,
  useProjectUsers,
  useStrictCurrentProjectId,
} from "~/lib/hooks";
import { cn } from "~/lib/utils";

import { FilterIndicator } from "./filter-indicator";

export function BoardSearch({ className }: { className?: string }) {
  const [search, setSearch] = useQueryState("search", parseAsString);

  return (
    <label
      className={cn(
        "flex items-center gap-2 border-b border-border pb-1 transition-colors focus-within:border-foreground/60",
        className,
      )}
    >
      <Search className="size-3.5 shrink-0 text-muted-foreground" />
      <input
        className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        placeholder="Search cards"
        value={search ?? ""}
        onChange={(e) => {
          if (e.target.value === "") {
            void setSearch(null);
          } else {
            void setSearch(e.target.value);
          }
        }}
      />
      {search && (
        <button
          className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
          onClick={() => void setSearch(null)}
        >
          <X className="size-3" />
          <span className="sr-only">Clear search</span>
        </button>
      )}
    </label>
  );
}

function FilterControls() {
  const projectId = useStrictCurrentProjectId();

  const [labels, setLabels] = useQueryState(
    "labels",
    parseAsArrayOf(parseAsString),
  );
  const [assignedTo, setAssignedTo] = useQueryState(
    "assignedTo",
    parseAsArrayOf(parseAsString),
  );

  const cards = useCachedCardsByCurrentBoard();
  const projectUsers = useProjectUsers(projectId);

  const uniqueLabels = cards
    .flatMap((card) => card.labels)
    .filter((label): label is string => Boolean(label))
    .reduce(
      (unique, label) => (unique.includes(label) ? unique : [...unique, label]),
      [] as string[],
    )
    .sort();

  const toggleAssignee = (projectUserId: string) => {
    if (assignedTo?.includes(projectUserId)) {
      const remaining = assignedTo.filter((id) => id !== projectUserId);
      void setAssignedTo(remaining.length > 0 ? remaining : null);
    } else {
      void setAssignedTo([...(assignedTo ?? []), projectUserId]);
    }
  };

  const toggleLabel = (label: string) => {
    if (labels?.includes(label)) {
      const remaining = labels.filter((value) => value !== label);
      void setLabels(remaining.length > 0 ? remaining : null);
    } else {
      void setLabels([...(labels ?? []), label]);
    }
  };

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Assignees
        </p>
        <div className="flex flex-wrap gap-2">
          {projectUsers.data?.map((projectUser) => (
            <Avatar
              key={projectUser.user.id}
              title={projectUser.user.name}
              className={cn(
                "size-8 cursor-pointer transition-all duration-150 hover:ring-2 hover:ring-primary/50",
                assignedTo?.includes(projectUser.id) && "ring-2 ring-primary",
              )}
              onClick={() => toggleAssignee(projectUser.id)}
            >
              <AvatarImage src={projectUser.user.imageUrl ?? undefined} />
              <AvatarFallback>
                {projectUser.user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Labels
        </p>
        {uniqueLabels.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {uniqueLabels.map((label) => {
              const isActive = labels?.includes(label) ?? false;
              return (
                <button
                  key={label}
                  onClick={() => toggleLabel(label)}
                  className={cn(
                    "border px-1.5 py-0.5 font-mono text-[10px] transition-colors",
                    isActive
                      ? "border-primary text-primary"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No labels yet.</p>
        )}
      </div>
    </div>
  );
}

export function BoardFilterMenu() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 text-muted-foreground hover:text-foreground"
          aria-label="Filter cards"
        >
          <Filter className="h-4 w-4" />
          <FilterIndicator className="absolute -right-1 -top-1" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4" align="end">
        <FilterControls />
      </PopoverContent>
    </Popover>
  );
}

export function BoardFilters() {
  return (
    <div className="flex flex-col gap-5">
      <BoardSearch className="w-full" />
      <FilterControls />
    </div>
  );
}
