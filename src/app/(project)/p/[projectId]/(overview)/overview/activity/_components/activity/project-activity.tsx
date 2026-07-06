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
import { ProjectActivityEmptyState } from "./project-activity-empty-state";

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
    <div className="space-y-6">
      <div className="flex items-baseline gap-3">
        <h2 className="text-2xl font-light tracking-tight">Activity</h2>
        {total > 0 && (
          <span className="font-mono text-xs text-muted-foreground">
            {total} {total === 1 ? "event" : "events"}
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <ProjectActivityEmptyState />
      ) : (
        <>
          <div className="divide-y divide-border border-t border-border">
            {items.map((item) => (
              <ActivityItem key={item.id} item={item} />
            ))}
          </div>

          {showPagination && (
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
          )}
        </>
      )}
    </div>
  );
}
