import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { useBoard, useBoardSafe } from "../use-board";

// Mock data
const mockBoard = {
  id: "board-123",
  name: "Sprint Planning",
  description: "Current sprint planning board",
  projectId: "project-456",
  color: "blue",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Mock tRPC
const mockQueryOptions = vi.fn();

vi.mock("~/trpc/client", () => ({
  useTRPC: () => ({
    board: {
      get: {
        queryOptions: mockQueryOptions,
        queryKey: (id: string) => ["board", "get", id],
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

describe("useBoard", () => {
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();

    // Default mock implementation
    mockQueryOptions.mockImplementation((boardId) => ({
      queryKey: ["board", "get", boardId],
      queryFn: async () => (boardId === mockBoard.id ? mockBoard : null),
    }));
  });

  it("should fetch and return a board when boardId is provided", async () => {
    // Arrange
    const wrapper = createWrapper();
    const boardId = mockBoard.id;

    // Act
    const { result } = renderHook(() => useBoard(boardId), { wrapper });

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockBoard);
    expect(mockQueryOptions).toHaveBeenCalledWith(boardId);
  });

  it("should handle error states correctly", async () => {
    // Arrange
    const wrapper = createWrapper();
    const boardId = "invalid-board-id";
    const mockError = new Error("Failed to fetch board");

    // Setup mock to throw an error
    mockQueryOptions.mockImplementation(() => ({
      queryKey: ["board", "get", boardId],
      queryFn: async () => {
        throw mockError;
      },
    }));

    // Act
    const { result } = renderHook(() => useBoard(boardId), { wrapper });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});

describe("useBoardSafe", () => {
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();

    // Default mock implementation
    mockQueryOptions.mockImplementation((boardId) => ({
      queryKey: ["board", "get", boardId],
      queryFn: async () => (boardId === mockBoard.id ? mockBoard : null),
    }));
  });

  it("should fetch and return a board when a valid boardId is provided", async () => {
    // Arrange
    const wrapper = createWrapper();
    const boardId = mockBoard.id;

    // Act
    const { result } = renderHook(() => useBoardSafe(boardId), { wrapper });

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockBoard);
    expect(mockQueryOptions).toHaveBeenCalledWith(boardId);
  });

  it("should not fetch data when boardId is undefined", () => {
    // Arrange
    const wrapper = createWrapper();
    const boardId = undefined;

    // Act
    const { result } = renderHook(() => useBoardSafe(boardId), { wrapper });

    // Assert
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isFetching).toBe(false);
    expect(mockQueryOptions).toHaveBeenCalledTimes(1); // Called but with undefined
    expect(result.current.data).toBeUndefined();
  });
});
