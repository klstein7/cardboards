import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { useDeleteBoard } from "../use-delete-board";

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
const mockMutationOptions = vi.fn();
const mockListQueryKey = vi.fn();

vi.mock("~/trpc/client", () => ({
  useTRPC: () => ({
    board: {
      delete: {
        mutationOptions: mockMutationOptions,
      },
      list: {
        queryKey: mockListQueryKey,
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

describe("useDeleteBoard", () => {
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();

    // Default mock implementations
    mockMutationOptions.mockImplementation((options) => ({
      mutationFn: async (boardId: string) => {
        return mockBoard;
      },
      ...options,
    }));

    mockListQueryKey.mockImplementation((projectId) => [
      "board",
      "list",
      projectId,
    ]);

    // Setup mock to return deleted board
    mockMutateAsync.mockResolvedValue(mockBoard);
  });

  it("should delete a board when called with valid boardId", async () => {
    // Arrange
    const wrapper = createWrapper();
    const boardId = mockBoard.id;

    // Act
    const { result } = renderHook(() => useDeleteBoard(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync(boardId);
    });

    // Assert
    expect(mockMutateAsync).toHaveBeenCalledWith(boardId);
    expect(mockMutationOptions).toHaveBeenCalled();

    // Check that invalidateQueries was called for the board list
    const callbacks = mockMutationOptions.mock.calls[0]?.[0];
    const onSuccess = callbacks?.onSuccess;

    if (onSuccess) {
      // Simulate a successful deletion
      await onSuccess(mockBoard);

      expect(mockInvalidateQueries).toHaveBeenCalledTimes(1);
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["board", "list", mockBoard.projectId],
      });
    }
  });

  it("should handle error states correctly", async () => {
    // Arrange
    const wrapper = createWrapper();
    const boardId = mockBoard.id;
    const mockError = new Error("Failed to delete board");

    // Setup mock to throw an error
    mockMutateAsync.mockRejectedValue(mockError);

    // Act
    const { result } = renderHook(() => useDeleteBoard(), { wrapper });

    // Assert
    await expect(result.current.mutateAsync(boardId)).rejects.toThrow(
      mockError,
    );
  });
});
