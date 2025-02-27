"use client";

import { Search, Users, X } from "lucide-react";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { MultiSelect } from "~/components/ui/multi-select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  useCachedCardsByCurrentBoard,
  useCurrentProjectId,
  useProjectUsers,
} from "~/lib/hooks";
import { cn } from "~/lib/utils";

export function BoardFilters() {
  const projectId = useCurrentProjectId();

  const [search, setSearch] = useQueryState("search", parseAsString);
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
    .sort()
    .map((label) => ({ label, value: label }));

  const handleClearSearch = () => {
    void setSearch(null);
  };

  return (
    <div className="flex w-full items-center justify-between gap-4">
      {/* Search input */}
      <div className="relative w-full max-w-xs flex-shrink">
        <Input
          className="h-9 pl-9 pr-8"
          placeholder="Search"
          value={search ?? ""}
          onChange={(e) => {
            if (e.target.value === "") {
              void setSearch(null);
            } else {
              void setSearch(e.target.value);
            }
          }}
        />
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        {search && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 size-5 -translate-y-1/2 p-0"
            onClick={handleClearSearch}
          >
            <X className="size-3" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-shrink-0 items-center gap-3">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "flex h-9 items-center gap-1",
                assignedTo?.length && "ring-1 ring-primary",
              )}
            >
              <Users className="mr-1 h-4 w-4 text-muted-foreground" />
              <span className="hidden sm:inline">Assignees</span>
              {assignedTo?.length ? (
                <Badge className="ml-1">{assignedTo.length}</Badge>
              ) : null}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-3" align="end">
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Filter by team member</h4>
              <div className="flex flex-wrap gap-2">
                {projectUsers.data?.map((projectUser) => (
                  <Avatar
                    key={projectUser.user.id}
                    className={cn(
                      "size-9 cursor-pointer transition-all duration-150 hover:ring-2 hover:ring-primary/50",
                      assignedTo?.includes(projectUser.id) &&
                        "ring-2 ring-primary",
                    )}
                    onClick={() => {
                      if (assignedTo?.includes(projectUser.id)) {
                        const filteredAssignedTo = assignedTo?.filter(
                          (id) => id !== projectUser.id,
                        );
                        void setAssignedTo(
                          filteredAssignedTo?.length > 0
                            ? filteredAssignedTo
                            : null,
                        );
                      } else {
                        void setAssignedTo([
                          ...(assignedTo ?? []),
                          projectUser.id,
                        ]);
                      }
                    }}
                  >
                    <AvatarImage src={projectUser.user.imageUrl ?? undefined} />
                    <AvatarFallback>
                      {projectUser.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <MultiSelect
          placeholder="Filter by label"
          defaultValue={labels ?? undefined}
          options={uniqueLabels}
          className={cn(
            "w-auto min-w-32 sm:min-w-40",
            labels?.length && "ring-1 ring-primary",
          )}
          onValueChange={(value) => {
            void setLabels(value.length > 0 ? value : null);
          }}
        />
      </div>
    </div>
  );
}
