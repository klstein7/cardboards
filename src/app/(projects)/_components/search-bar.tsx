"use client";

import { Filter, Search, X } from "lucide-react";
import { useState } from "react";

export function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      className={`relative flex items-center rounded-lg border border-input bg-background/70 px-4 py-3 shadow-sm backdrop-blur-sm transition-all duration-200 ${
        isFocused
          ? "border-primary/30 bg-background/80 ring-1 ring-primary/20"
          : ""
      }`}
    >
      <Search
        className={`mr-3 h-5 w-5 transition-colors duration-200 ${
          isFocused ? "text-primary" : "text-muted-foreground"
        }`}
      />

      <input
        type="text"
        placeholder="Search projects..."
        className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />

      {searchTerm && (
        <button
          onClick={() => setSearchTerm("")}
          className="mr-2 rounded-full p-1 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      <div className="flex items-center">
        <div className="mx-2 h-5 w-px bg-border/50"></div>
        <div className="flex items-center gap-1.5 rounded-md border border-transparent px-2 py-1 hover:border-border/50 hover:bg-muted/30">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            className="border-none bg-transparent text-sm outline-none focus:ring-0"
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
