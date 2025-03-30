import { ActivityIcon } from "lucide-react";

import { SectionHeader } from "~/components/shared/section-header";
import { Card, CardContent } from "~/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
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
      <SectionHeader title="Project Activity" icon={ActivityIcon} />
      <CardContent className="p-0">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
            <div className="mb-4 rounded-full bg-muted p-3">
              <ActivityIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mb-1 text-lg font-semibold">No activity yet</h3>
            <p className="max-w-md text-sm text-muted-foreground">
              When you or team members make changes to this project,
              they&apos;ll appear here.
            </p>
          </div>
        ) : (
          <>
            <div className="divide-border/50">
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
                      if (
                        page === "ellipsis-start" ||
                        page === "ellipsis-end"
                      ) {
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
          </>
        )}
      </CardContent>
    </Card>
  );
}
