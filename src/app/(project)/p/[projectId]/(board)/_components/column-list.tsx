"use client";

import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useColumns, useCurrentBoard } from "~/lib/hooks";
import { useIsAdmin } from "~/lib/hooks/project-user/use-is-admin";
import { cn } from "~/lib/utils";

import { AddColumnButton } from "./add-column-button";
import { ColumnItem } from "./column-item";

interface ColumnListProps {
  boardId: string;
}

export function ColumnList({ boardId }: ColumnListProps) {
  const ref = useRef<HTMLDivElement>(null);
  const columns = useColumns(boardId);
  const board = useCurrentBoard();
  const isAdmin = useIsAdmin();
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(false);

  const handleScroll = () => {
    if (!ref.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = ref.current;
    setShowLeftButton(scrollLeft > 0);
    setShowRightButton(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scrollLeft = () => {
    if (!ref.current) return;
    ref.current.scrollBy({ left: -350, behavior: "smooth" });
  };

  const scrollRight = () => {
    if (!ref.current) return;
    ref.current.scrollBy({ left: 350, behavior: "smooth" });
  };

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;
    const checkForOverflow = () => {
      if (element) {
        const { scrollWidth, clientWidth } = element;
        const hasOverflow = scrollWidth > clientWidth;
        setShowScrollIndicator(hasOverflow);
        setShowRightButton(hasOverflow);
      }
    };

    checkForOverflow();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        scrollLeft();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        scrollRight();
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      checkForOverflow();
      handleScroll();
    });

    resizeObserver.observe(element);

    const cleanup = autoScrollForElements({
      element,
    });

    element.addEventListener("scroll", handleScroll);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      resizeObserver.disconnect();
      cleanup();
      element.removeEventListener("scroll", handleScroll);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [columns.data]);

  if (columns.isError) {
    return <div>Error: {columns.error.message}</div>;
  }

  if (columns.isPending) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading columns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {showLeftButton && (
        <button
          onClick={scrollLeft}
          className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 shadow-md hover:bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      <div
        ref={ref}
        className={cn(
          "scrollbar-thumb-rounded-full h-full w-full overflow-x-auto overflow-y-auto scrollbar scrollbar-track-transparent",
        )}
        style={
          {
            "--scrollbar-thumb": board.data
              ? `${board.data.color}`
              : "var(--secondary)",
          } as React.CSSProperties
        }
        tabIndex={0}
      >
        <div className="flex w-fit items-start gap-5 p-6">
          {columns.data.map((column) => (
            <div
              key={column.id}
              className="h-full w-[325px] flex-shrink-0 snap-start"
            >
              <ColumnItem column={column} />
            </div>
          ))}

          {isAdmin && <AddColumnButton boardId={boardId} />}
        </div>
      </div>

      {showRightButton && (
        <button
          onClick={scrollRight}
          className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 shadow-md hover:bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {showLeftButton && (
        <div className="pointer-events-none absolute bottom-0 left-0 top-0 w-12 bg-gradient-to-r from-background to-transparent opacity-50" />
      )}

      {showScrollIndicator && (
        <div className="pointer-events-none absolute bottom-0 right-0 top-0 w-12 bg-gradient-to-l from-background to-transparent opacity-50" />
      )}
    </div>
  );
}
