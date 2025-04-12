import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { useCompletedCardCountByBoardId } from "../use-completed-card-count-by-board-id";

// Mock tRPC
const mockCountQuery = vi.fn().mockResolvedValue(3); // Default mock count

vi.mock("~/trpc/client", () => ({
  useTRPC: () => ({
    card: {
      countCompletedByBoardId: {
        queryOptions: (boardId: string) => ({
          queryKey: ["card", "countCompletedByBoardId", boardId],
          queryFn: () => mockCountQuery(boardId), // Use mock function
        }),
      },
    },
  }),
}));

// Helper to create QueryClient and Provider
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useCompletedCardCountByBoardId", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockCountQuery.mockResolvedValue(3); // Reset to default
  });

  it("should fetch and return the completed card count for a given boardId", async () => {
    // Arrange
    const boardId = "board-abc";
    const expectedCount = 7;
    mockCountQuery.mockResolvedValue(expectedCount);
    const wrapper = createWrapper();

    // Act
    const { result } = renderHook(
      () => useCompletedCardCountByBoardId(boardId),
      {
        wrapper,
      },
    );

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(expectedCount);
    expect(mockCountQuery).toHaveBeenCalledWith(boardId);
  });

  it("should handle query error", async () => {
    // Arrange
    const boardId = "board-xyz";
    const error = new Error("Failed to fetch completed count");
    mockCountQuery.mockRejectedValue(error);
    const wrapper = createWrapper();

    // Act
    const { result } = renderHook(
      () => useCompletedCardCountByBoardId(boardId),
      {
        wrapper,
      },
    );

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
  });
});
