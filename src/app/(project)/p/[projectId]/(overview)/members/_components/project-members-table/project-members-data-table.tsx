"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, Filter, Search } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { type ProjectUser } from "~/app/(project)/_types";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { useProjectUsers } from "~/lib/hooks";
import { cn } from "~/lib/utils";

interface ProjectMembersDataTableProps {
  projectId: string;
  columns: ColumnDef<ProjectUser>[];
  className?: string;
}

export function ProjectMembersDataTable({
  projectId,
  columns,
  className,
}: ProjectMembersDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string[]>([]);

  const projectUsers = useProjectUsers(projectId);

  // Global filter function that checks if any cell value includes the search query
  const globalFilterFn = useCallback(
    (row: ProjectUser) => {
      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase().trim();

      // Search in user name and email
      if (row.user.name.toLowerCase().includes(query)) return true;
      if (row.user.email.toLowerCase().includes(query)) return true;

      return false;
    },
    [searchQuery],
  );

  // Filter data based on search query and role filter
  const filteredData = useMemo(() => {
    if (!projectUsers.data) return [];

    return projectUsers.data.filter((user) => {
      // Apply global search filter
      const passesSearchFilter = globalFilterFn(user);

      // Apply role filter
      const passesRoleFilter =
        roleFilter.length === 0 || roleFilter.includes(user.role);

      return passesSearchFilter && passesRoleFilter;
    });
  }, [projectUsers.data, globalFilterFn, roleFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newState = updater({
          pageIndex,
          pageSize,
        });
        setPageIndex(newState.pageIndex);
      }
    },
    state: {
      sorting,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    manualPagination: false,
    pageCount: Math.ceil((filteredData.length ?? 0) / pageSize),
  });

  // Clear filters and reset page
  const handleClearFilters = () => {
    setSearchQuery("");
    setRoleFilter([]);
    setPageIndex(0);
  };

  // Toggle role filter
  const toggleRoleFilter = (role: string) => {
    setRoleFilter((prev) => {
      if (prev.includes(role)) {
        return prev.filter((r) => r !== role);
      } else {
        return [...prev, role];
      }
    });
    setPageIndex(0); // Reset to first page when filters change
  };

  if (projectUsers.isPending) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading members...</p>
        </div>
      </div>
    );
  }

  if (projectUsers.error) {
    return (
      <div className="flex items-center justify-center p-8 text-destructive">
        <p>Error loading members. Please try again.</p>
      </div>
    );
  }

  // Generate an array of page numbers to display
  const getPageNumbers = () => {
    const totalPages = table.getPageCount();
    const pageNumbers = [];
    const currentPage = pageIndex + 1; // Convert to 1-indexed for display

    // Always show first and last page
    // For up to 7 pages, show all pages
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // For more than 7 pages, show first, last, and pages around current
      pageNumbers.push(1);

      // Calculate range around current page
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      // Add ellipsis if needed before startPage
      if (startPage > 2) {
        pageNumbers.push("ellipsis-start");
      }

      // Add pages around current
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      // Add ellipsis if needed after endPage
      if (endPage < totalPages - 1) {
        pageNumbers.push("ellipsis-end");
      }

      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  const handlePageChange = (page: number) => {
    // Convert from 1-indexed (display) to 0-indexed (internal)
    setPageIndex(page - 1);
    table.setPageIndex(page - 1);
  };

  const activeFiltersCount = roleFilter.length + (searchQuery ? 1 : 0);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPageIndex(0); // Reset to first page on search
            }}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              <Filter className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={roleFilter.includes("admin")}
              onCheckedChange={() => toggleRoleFilter("admin")}
            >
              Admin
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={roleFilter.includes("member")}
              onCheckedChange={() => toggleRoleFilter("member")}
            >
              Member
            </DropdownMenuCheckboxItem>

            {activeFiltersCount > 0 && (
              <>
                <DropdownMenuSeparator />
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full"
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </Button>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={
                      header.column.getCanSort()
                        ? "cursor-pointer select-none"
                        : ""
                    }
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {{
                        asc: (
                          <ChevronDown className="h-4 w-4 rotate-180 transform" />
                        ),
                        desc: <ChevronDown className="h-4 w-4" />,
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  className="hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {searchQuery || roleFilter.length > 0
                    ? "No members match your search criteria."
                    : "No members found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="text-sm text-muted-foreground">
          <span>
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount() || 1}
          </span>
          <span className="mx-2">|</span>
          <span>{table.getFilteredRowModel().rows.length} members</span>
          {(searchQuery || roleFilter.length > 0) && (
            <>
              <span className="mx-2">|</span>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs"
                onClick={handleClearFilters}
              >
                Clear filters
              </Button>
            </>
          )}
        </div>

        {table.getPageCount() > 1 && (
          <Pagination>
            <PaginationContent>
              {table.getCanPreviousPage() && (
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      table.previousPage();
                    }}
                  />
                </PaginationItem>
              )}

              {getPageNumbers().map((page, i) => {
                if (page === "ellipsis-start" || page === "ellipsis-end") {
                  return (
                    <PaginationItem key={`ellipsis-${i}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }

                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      isActive={page === pageIndex + 1}
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(page as number);
                      }}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              {table.getCanNextPage() && (
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      table.nextPage();
                    }}
                  />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}
