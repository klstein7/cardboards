import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { useCreateColumn } from "../use-create-column";

// Mock data
const mockBoardId = "board-123";
const newColumnData = {
  boardId: mockBoardId,
  name: "New Column",
};

const mockCreatedColumn = {
  id: "col-new",
  name: newColumnData.name,
  boardId: mockBoardId,
  order: 3,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Mock tRPC
const mockMutationOptions = vi.fn();
const mockListQueryKey = vi.fn();

vi.mock("~/trpc/client", () => ({
  useTRPC: () => ({
    column: {
      create: {
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

describe("useCreateColumn", () => {
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();

    // Default mock implementations
    mockMutationOptions.mockImplementation((options) => ({
      mutationFn: async (data: typeof newColumnData) => {
        return mockCreatedColumn;
      },
      ...options,
    }));

    mockListQueryKey.mockImplementation((boardId) => [
      "column",
      "list",
      boardId,
    ]);

    // Setup mock to return created column
    mockMutateAsync.mockResolvedValue(mockCreatedColumn);
  });

  it("should create a column when called with valid data", async () => {
    // Arrange
    const wrapper = createWrapper();

    // Act
    const { result } = renderHook(() => useCreateColumn(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync(newColumnData);
    });

    // Assert
    expect(mockMutateAsync).toHaveBeenCalledWith(newColumnData);
    expect(mockMutationOptions).toHaveBeenCalled();

    // Check that invalidateQueries was called for the column list
    const callbacks = mockMutationOptions.mock.calls[0]?.[0];
    const onSuccess = callbacks?.onSuccess;

    if (onSuccess) {
      // Simulate a successful creation
      await onSuccess(mockCreatedColumn);

      expect(mockInvalidateQueries).toHaveBeenCalledTimes(1);
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["column", "list", mockBoardId],
      });
    }
  });

  it("should handle error states correctly", async () => {
    // Arrange
    const wrapper = createWrapper();
    const mockError = new Error("Failed to create column");

    // Setup mock to throw an error
    mockMutateAsync.mockRejectedValue(mockError);

    // Act
    const { result } = renderHook(() => useCreateColumn(), { wrapper });

    // Assert
    await expect(result.current.mutateAsync(newColumnData)).rejects.toThrow(
      mockError,
    );
  });
});
