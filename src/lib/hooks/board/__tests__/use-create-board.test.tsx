import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { useCreateBoard } from "../use-create-board";

// Mock data
const mockProjectId = "project-456";
const newBoardData = {
  name: "New Sprint Board",
  projectId: mockProjectId,
  color: "blue",
};

const mockCreatedBoard = {
  id: "board-789",
  name: newBoardData.name,
  projectId: newBoardData.projectId,
  color: newBoardData.color,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Mock tRPC
const mockMutationOptions = vi.fn();
const mockListQueryKey = vi.fn();

vi.mock("~/trpc/client", () => ({
  useTRPC: () => ({
    board: {
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

describe("useCreateBoard", () => {
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();

    // Default mock implementations
    mockMutationOptions.mockImplementation((options) => ({
      mutationFn: async (data: typeof newBoardData) => {
        return mockCreatedBoard;
      },
      ...options,
    }));

    mockListQueryKey.mockImplementation((projectId) => [
      "board",
      "list",
      projectId,
    ]);

    // Setup mock to return created board
    mockMutateAsync.mockResolvedValue(mockCreatedBoard);
  });

  it("should create a board when called with valid data", async () => {
    // Arrange
    const wrapper = createWrapper();

    // Act
    const { result } = renderHook(() => useCreateBoard(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync(newBoardData);
    });

    // Assert
    expect(mockMutateAsync).toHaveBeenCalledWith(newBoardData);
    expect(mockMutationOptions).toHaveBeenCalled();

    // Check that invalidateQueries was called for the board list
    const callbacks = mockMutationOptions.mock.calls[0]?.[0];
    const onSuccess = callbacks?.onSuccess;

    if (onSuccess) {
      // Simulate a successful creation
      await onSuccess(mockCreatedBoard);

      expect(mockInvalidateQueries).toHaveBeenCalledTimes(1);
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["board", "list", mockProjectId],
      });
    }
  });

  it("should handle error states correctly", async () => {
    // Arrange
    const wrapper = createWrapper();
    const mockError = new Error("Failed to create board");

    // Setup mock to throw an error
    mockMutateAsync.mockRejectedValue(mockError);

    // Act
    const { result } = renderHook(() => useCreateBoard(), { wrapper });

    // Assert
    await expect(result.current.mutateAsync(newBoardData)).rejects.toThrow(
      mockError,
    );
  });
});
