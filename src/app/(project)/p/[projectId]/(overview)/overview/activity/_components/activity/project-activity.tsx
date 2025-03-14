import { ActivityIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
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
import { trpc } from "~/trpc/server";

import { ActivityItem } from "./activity-item";

interface ProjectActivityProps {
  projectId: string;
  currentPage: number;
}

export async function ProjectActivity({
  projectId,
  currentPage,
}: ProjectActivityProps) {
  const {
    items,
    pagination: { total },
  } = await trpc.history.getByProjectPaginated({
    projectId,
    limit: 10,
    offset: (currentPage - 1) * 10,
  });

  const showPagination = total > 10;
  const totalPages = Math.ceil(total / 10);

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
        <div className="divide-y divide-border/50">
          {items.map((item) => (
            <ActivityItem key={item.id} item={item} />
          ))}
        </div>

        {showPagination && (
          <div className="border-t border-border/50 p-4">
            <Pagination>
              <PaginationContent>
                {currentPage > 1 && (
                  <PaginationItem>
                    <PaginationPrevious
                      href={`/p/${projectId}/overview/activity?page=${currentPage - 1}`}
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
                        href={`/p/${projectId}/overview/activity?page=${page}`}
                        isActive={page === currentPage}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                {currentPage < totalPages && (
                  <PaginationItem>
                    <PaginationNext
                      href={`/p/${projectId}/overview/activity?page=${currentPage + 1}`}
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
