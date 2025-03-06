"use client";

import { Search, X } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

interface ActivitySearchProps {
  searchQuery: string;
  onChange: (value: string) => void;
  onClear: () => void;
}

export function ActivitySearch({
  searchQuery,
  onChange,
  onClear,
}: ActivitySearchProps) {
  return (
    <div className="relative w-full max-w-xs flex-shrink">
      <Input
        className="h-9 pl-9 pr-8"
        placeholder="Search activity"
        value={searchQuery}
        onChange={(e) => onChange(e.target.value)}
      />
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      {searchQuery && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-2 top-1/2 size-5 -translate-y-1/2 p-0"
          onClick={onClear}
        >
          <X className="size-3" />
          <span className="sr-only">Clear search</span>
        </Button>
      )}
    </div>
  );
}
