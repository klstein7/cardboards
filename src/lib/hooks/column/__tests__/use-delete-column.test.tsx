import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { useDeleteColumn } from "../use-delete-column";

// Mock data
const mockBoardId = "board-123";
const mockColumnId = "column-123";

const mockDeletedColumn = {
  id: mockColumnId,
  name: "Test Column",
  boardId: mockBoardId,
  order: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Mock tRPC
const mockMutationOptions = vi.fn();
const mockListQueryKey = vi.fn();

vi.mock("~/trpc/client", () => ({
  useTRPC: () => ({
    column: {
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

describe("useDeleteColumn", () => {
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();

    // Default mock implementations
    mockMutationOptions.mockImplementation((options) => ({
      mutationFn: async (columnId: string) => {
        return mockDeletedColumn;
      },
      ...options,
    }));

    mockListQueryKey.mockImplementation((boardId) => [
      "column",
      "list",
      boardId,
    ]);

    // Setup mock to return deleted column
    mockMutateAsync.mockResolvedValue(mockDeletedColumn);
  });

  it("should delete a column when called with valid id", async () => {
    // Arrange
    const wrapper = createWrapper();

    // Act
    const { result } = renderHook(() => useDeleteColumn(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync(mockColumnId);
    });

    // Assert
    expect(mockMutateAsync).toHaveBeenCalledWith(mockColumnId);
    expect(mockMutationOptions).toHaveBeenCalled();

    // Check that invalidateQueries was called for the column list
    const callbacks = mockMutationOptions.mock.calls[0]?.[0];
    const onSuccess = callbacks?.onSuccess;

    if (onSuccess) {
      // Simulate a successful deletion
      await onSuccess(mockDeletedColumn);

      expect(mockInvalidateQueries).toHaveBeenCalledTimes(1);
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["column", "list", mockBoardId],
      });
    }
  });

  it("should handle error states correctly", async () => {
    // Arrange
    const wrapper = createWrapper();
    const mockError = new Error("Failed to delete column");

    // Setup mock to throw an error
    mockMutateAsync.mockRejectedValue(mockError);

    // Act
    const { result } = renderHook(() => useDeleteColumn(), { wrapper });

    // Assert
    await expect(result.current.mutateAsync(mockColumnId)).rejects.toThrow(
      mockError,
    );
  });
});
