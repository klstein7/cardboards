import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { useCardCountByBoardId } from "../use-card-count-by-board-id";

// Mock tRPC
const mockCountQuery = vi.fn().mockResolvedValue(5); // Default mock count

vi.mock("~/trpc/client", () => ({
  useTRPC: () => ({
    card: {
      countByBoardId: {
        queryOptions: (boardId: string) => ({
          queryKey: ["card", "countByBoardId", boardId],
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

describe("useCardCountByBoardId", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Ensure default mock is set for each test if needed, or specific mocks below
    mockCountQuery.mockResolvedValue(5);
  });

  it("should fetch and return the card count for a given boardId", async () => {
    // Arrange
    const boardId = "board-1";
    const expectedCount = 10;
    mockCountQuery.mockResolvedValue(expectedCount); // Specific count for this test
    const wrapper = createWrapper();

    // Act
    const { result } = renderHook(() => useCardCountByBoardId(boardId), {
      wrapper,
    });

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(expectedCount);
    expect(mockCountQuery).toHaveBeenCalledWith(boardId);
  });

  it("should handle query error", async () => {
    // Arrange
    const boardId = "board-error";
    const error = new Error("Failed to fetch count");
    mockCountQuery.mockRejectedValue(error);
    const wrapper = createWrapper();

    // Act
    const { result } = renderHook(() => useCardCountByBoardId(boardId), {
      wrapper,
    });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
  });
});
