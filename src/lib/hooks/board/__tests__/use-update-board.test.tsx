import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { useUpdateBoard } from "../use-update-board";

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

// Update data with correct structure matching the mutation input
const updateBoardData = {
  boardId: mockBoard.id,
  data: {
    name: "Updated Board Name",
    description: "Updated board description",
    color: "green",
  },
};

// Mock tRPC
const mockMutationOptions = vi.fn();
const mockListQueryKey = vi.fn();
const mockGetQueryKey = vi.fn();

vi.mock("~/trpc/client", () => ({
  useTRPC: () => ({
    board: {
      update: {
        mutationOptions: mockMutationOptions,
      },
      list: {
        queryKey: mockListQueryKey,
      },
      get: {
        queryKey: mockGetQueryKey,
      },
    },
  }),
}));

// Mock invalidateQueries and useMutation
const mockInvalidateQueries = vi.fn();
const mockMutateAsync = vi.fn();

vi.mock("@tanstack/react-query", async () => {
  const originalModule = await vi.importActual("@tanstack/react-query");
  return {
    ...originalModule,
    useMutation: () => ({
      mutateAsync: mockMutateAsync,
      mutate: vi.fn(),
      isLoading: false,
      isError: false,
      isSuccess: true,
      error: null,
    }),
    useQueryClient: () => ({
      invalidateQueries: mockInvalidateQueries,
    }),
  };
});

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

describe("useUpdateBoard", () => {
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();

    // Default mock implementations
    mockMutationOptions.mockImplementation((options) => ({
      mutationFn: async (data: typeof updateBoardData) => {
        return {
          ...mockBoard,
          ...data.data,
          updatedAt: new Date().toISOString(),
        };
      },
      ...options,
    }));

    mockListQueryKey.mockImplementation((projectId) => [
      "board",
      "list",
      projectId,
    ]);

    mockGetQueryKey.mockImplementation((boardId) => ["board", "get", boardId]);

    // Setup mock to return updated board
    mockMutateAsync.mockResolvedValue({
      ...mockBoard,
      ...updateBoardData.data,
      updatedAt: new Date().toISOString(),
    });
  });

  it("should update a board when called with valid data", async () => {
    // Arrange
    const wrapper = createWrapper();

    // Act
    const { result } = renderHook(() => useUpdateBoard(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync(updateBoardData);
    });

    // Assert
    expect(mockMutateAsync).toHaveBeenCalledWith(updateBoardData);
    expect(mockMutationOptions).toHaveBeenCalled();

    // Check that invalidateQueries was called for both the list and individual board
    const callbacks = mockMutationOptions.mock.calls[0]?.[0];
    const onSuccess = callbacks?.onSuccess;

    if (onSuccess) {
      // Simulate a successful update
      await onSuccess({
        ...mockBoard,
        ...updateBoardData.data,
        updatedAt: new Date().toISOString(),
      });

      expect(mockInvalidateQueries).toHaveBeenCalledTimes(2);
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["board", "list", mockBoard.projectId],
      });
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["board", "get", mockBoard.id],
      });
    }
  });

  it("should handle error states correctly", async () => {
    // Arrange
    const wrapper = createWrapper();
    const mockError = new Error("Failed to update board");

    // Setup mock to throw an error
    mockMutateAsync.mockRejectedValue(mockError);

    // Act
    const { result } = renderHook(() => useUpdateBoard(), { wrapper });

    // Assert
    await expect(result.current.mutateAsync(updateBoardData)).rejects.toThrow(
      mockError,
    );
  });
});
