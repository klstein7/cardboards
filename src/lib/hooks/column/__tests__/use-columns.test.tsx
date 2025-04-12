import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { useColumns } from "../use-columns";

// Mock data
const mockBoardId = "board-123";
const mockColumns = [
  {
    id: "col-1",
    name: "To Do",
    boardId: mockBoardId,
    order: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "col-2",
    name: "In Progress",
    boardId: mockBoardId,
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "col-3",
    name: "Done",
    boardId: mockBoardId,
    order: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock tRPC
const mockQueryOptions = vi.fn();

vi.mock("~/trpc/client", () => ({
  useTRPC: () => ({
    column: {
      list: {
        queryOptions: mockQueryOptions,
        queryKey: (boardId: string) => ["column", "list", boardId],
      },
    },
  }),
}));

// Reusable QueryClient setup
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  // eslint-disable-next-line react/display-name
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useColumns", () => {
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();

    // Default mock implementation
    mockQueryOptions.mockImplementation((boardId) => ({
      queryKey: ["column", "list", boardId],
      queryFn: async () => mockColumns,
    }));
  });

  it("should fetch columns for a board", async () => {
    // Arrange
    const wrapper = createWrapper();

    // Act
    const { result } = renderHook(() => useColumns(mockBoardId), { wrapper });

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockQueryOptions).toHaveBeenCalledWith(mockBoardId);
  });

  it("should provide placeholder data while loading", () => {
    // Arrange
    const wrapper = createWrapper();

    // Act
    const { result } = renderHook(() => useColumns(mockBoardId), { wrapper });

    // Assert - immediately after rendering, before loading completes
    expect(result.current.data).toEqual([]);
  });

  it("should handle error states correctly", async () => {
    // Arrange
    const wrapper = createWrapper();
    const mockError = new Error("Failed to fetch columns");

    // Setup mock to throw an error
    mockQueryOptions.mockImplementation(() => ({
      queryKey: ["column", "list", mockBoardId],
      queryFn: async () => {
        throw mockError;
      },
    }));

    // Act
    const { result } = renderHook(() => useColumns(mockBoardId), { wrapper });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
