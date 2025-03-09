"use client";

import { ActivityIcon, Loader2 } from "lucide-react";
import { useCallback, useState } from "react";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import { Separator } from "~/components/ui/separator";
import { useProjectHistoryPaginated } from "~/lib/hooks";

import { ActivityItem } from "./activity-item";

interface ProjectActivityProps {
  projectId: string;
}

export function ProjectActivity({ projectId }: ProjectActivityProps) {
  const [limit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const offset = (currentPage - 1) * limit;

  const history = useProjectHistoryPaginated(projectId, limit, offset);

  const handlePageChange = useCallback(
    (page: number) => {
      if (page === currentPage) return;

      setIsLoading(true);
      setCurrentPage(page);

      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    },
    [currentPage],
  );

  if (history.isError) {
    return (
      <Card className="overflow-hidden border border-destructive/10 shadow-sm transition-all hover:border-destructive/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
            <ActivityIcon className="h-5 w-5 text-destructive/70" />
            <p>Error loading activity: {history.error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!history.data?.items || history.data.items.length === 0) {
    return (
      <Card className="overflow-hidden border shadow-sm transition-all">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="rounded-full bg-muted/80 p-3.5 shadow-sm">
              <ActivityIcon className="h-7 w-7 text-muted-foreground/70" />
            </div>
            <div className="max-w-xs space-y-1.5">
              <p className="font-medium text-foreground/90">
                No activity recorded yet
              </p>
              <p className="text-sm text-muted-foreground/80">
                Activity will appear here as changes are made to the project
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { items, pagination } = history.data;
  const totalPages = Math.ceil(pagination.total / limit);

  const showPagination = totalPages > 1;

  const getPageNumbers = () => {
    const pageNumbers = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);

      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      if (startPage > 2) {
        pageNumbers.push("ellipsis-start");
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (endPage < totalPages - 1) {
        pageNumbers.push("ellipsis-end");
      }

      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  return (
    <Card className="overflow-hidden border shadow-sm transition-all hover:shadow">
      <CardHeader className="bg-muted/40 px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="rounded-full bg-primary/10 p-1.5 shadow-sm">
              <ActivityIcon className="h-4 w-4 text-primary" />
            </div>
            <CardTitle>Activity</CardTitle>
          </div>
        </div>
      </CardHeader>
      <Separator className="opacity-60" />
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/70" />
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {items.map((item) => (
              <ActivityItem key={item.id} item={item} />
            ))}
          </div>
        )}

        {showPagination && (
          <div className="border-t border-border/50 p-4">
            <Pagination>
              <PaginationContent>
                {currentPage > 1 && (
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(currentPage - 1);
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
                        isActive={page === currentPage}
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

                {currentPage < totalPages && (
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(currentPage + 1);
                      }}
                    />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
