"use client";

import { Filter, Search, X } from "lucide-react";
import { useState } from "react";

export function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      className={`flex items-center rounded-md border border-border ${
        isFocused
          ? "border-primary/30 ring-1 ring-primary/10"
          : "border-border/80 hover:border-border"
      } bg-background px-3 py-2 transition-all duration-150`}
    >
      <Search
        className={`mr-2 h-4 w-4 transition-colors duration-150 ${
          isFocused ? "text-primary" : "text-muted-foreground"
        }`}
      />

      <input
        type="text"
        placeholder="Search projects..."
        className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/80"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />

      {searchTerm && (
        <button
          onClick={() => setSearchTerm("")}
          className="mr-2 rounded-full p-1 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      <div className="flex items-center">
        <div className="mx-2 h-4 w-px bg-border/40"></div>
        <div className="flex items-center gap-1 text-muted-foreground/90">
          <Filter className="h-3.5 w-3.5" />
          <select
            className="border-none bg-transparent text-xs outline-none focus:ring-0"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Projects</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>
    </div>
  );
}
