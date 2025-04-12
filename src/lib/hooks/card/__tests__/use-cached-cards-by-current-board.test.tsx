import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { useCachedCardsByCurrentBoard } from "../use-cached-cards-by-current-board";

// Mock the useStrictCurrentBoardId from utils
vi.mock("~/lib/hooks/utils", () => ({
  useStrictCurrentBoardId: () => "test-board-id",
}));

// Mock tRPC client
vi.mock("~/trpc/client", () => ({
  useTRPC: () => ({
    card: {
      list: {
        queryKey: () => ["cards", "list"],
      },
    },
    column: {
      list: {
        queryKey: (boardId: string) => ["columns", "list", boardId],
      },
    },
  }),
}));

describe("useCachedCardsByCurrentBoard", () => {
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();
  });

  it("should return empty array if no cards or columns found in cache", () => {
    // Arrange
    const queryClient = new QueryClient();

    // Empty query results
    queryClient.getQueryData = vi.fn().mockReturnValue(null);
    queryClient.getQueriesData = vi.fn().mockReturnValue([]);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    // Act
    const { result } = renderHook(() => useCachedCardsByCurrentBoard(), {
      wrapper,
    });

    // Assert
    expect(result.current).toEqual([]);
    expect(queryClient.getQueryData).toHaveBeenCalledWith([
      "columns",
      "list",
      "test-board-id",
    ]);
    expect(queryClient.getQueriesData).toHaveBeenCalledWith({
      queryKey: ["cards", "list"],
      exact: false,
    });
  });

  it("should filter and return cards that belong to columns in the current board", () => {
    // Arrange
    const queryClient = new QueryClient();

    // Mock columns for the board
    const columns = [
      { id: "col-1", name: "To Do", boardId: "test-board-id" },
      { id: "col-2", name: "In Progress", boardId: "test-board-id" },
    ];

    // Mock cards in various columns
    const cardsInCol1 = [
      { id: 1, title: "Card 1", columnId: "col-1" },
      { id: 2, title: "Card 2", columnId: "col-1" },
    ];
    const cardsInCol2 = [{ id: 3, title: "Card 3", columnId: "col-2" }];
    const cardsInOtherCol = [
      { id: 4, title: "Card 4", columnId: "col-3" }, // Not in our board columns
    ];

    // Setup mock responses
    queryClient.getQueryData = vi.fn().mockReturnValue(columns);
    queryClient.getQueriesData = vi.fn().mockReturnValue([
      [["cards", "list", "col-1"], cardsInCol1],
      [["cards", "list", "col-2"], cardsInCol2],
      [["cards", "list", "col-3"], cardsInOtherCol],
    ]);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    // Act
    const { result } = renderHook(() => useCachedCardsByCurrentBoard(), {
      wrapper,
    });

    // Assert
    expect(result.current).toEqual([...cardsInCol1, ...cardsInCol2]);
    expect(result.current).toHaveLength(3);
    expect(result.current).not.toContainEqual(cardsInOtherCol[0]);
  });
});
