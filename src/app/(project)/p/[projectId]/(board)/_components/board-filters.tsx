"use client";

import { Search } from "lucide-react";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Input } from "~/components/ui/input";
import { MultiSelect } from "~/components/ui/multi-select";
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

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center -space-x-2">
        {projectUsers.data?.map((projectUser) => (
          <Avatar
            key={projectUser.user.id}
            className={cn(
              "size-9 cursor-pointer transition-all duration-150 hover:z-10 hover:-translate-y-1 hover:shadow-md hover:brightness-150",
              assignedTo?.includes(projectUser.id) && "ring-2 ring-foreground",
            )}
            onClick={() => {
              if (assignedTo?.includes(projectUser.id)) {
                const filteredAssignedTo = assignedTo?.filter(
                  (id) => id !== projectUser.id,
                );
                void setAssignedTo(
                  filteredAssignedTo.length > 0 ? filteredAssignedTo : null,
                );
              } else {
                void setAssignedTo([...(assignedTo ?? []), projectUser.id]);
              }
            }}
          >
            <AvatarImage src={projectUser.user.imageUrl ?? undefined} />
            <AvatarFallback>{projectUser.user.name.charAt(0)}</AvatarFallback>
          </Avatar>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <MultiSelect
          placeholder="Filter by label"
          defaultValue={labels ?? undefined}
          options={uniqueLabels}
          onValueChange={(value) => {
            void setLabels(value.length > 0 ? value : null);
          }}
        />
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
    </div>
  );
}
