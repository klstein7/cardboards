import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { useGenerateBoard } from "../use-generate-board";

// Mock data
const mockProjectId = "project-456";
const generateBoardData = {
  projectId: mockProjectId,
  prompt: "Sprint Planning",
};

const mockGeneratedBoard = {
  id: "board-789",
  name: "Sprint Planning Board",
  projectId: mockProjectId,
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
      generate: {
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

describe("useGenerateBoard", () => {
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();

    // Default mock implementations
    mockMutationOptions.mockImplementation((options) => ({
      mutationFn: async (data: typeof generateBoardData) => {
        return mockGeneratedBoard;
      },
      ...options,
    }));

    mockListQueryKey.mockImplementation((projectId) => [
      "board",
      "list",
      projectId,
    ]);

    // Setup mock to return generated board
    mockMutateAsync.mockResolvedValue(mockGeneratedBoard);
  });

  it("should generate a board when called with valid data", async () => {
    // Arrange
    const wrapper = createWrapper();

    // Act
    const { result } = renderHook(() => useGenerateBoard(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync(generateBoardData);
    });

    // Assert
    expect(mockMutateAsync).toHaveBeenCalledWith(generateBoardData);
    expect(mockMutationOptions).toHaveBeenCalled();

    // Check that invalidateQueries was called for the board list
    const callbacks = mockMutationOptions.mock.calls[0]?.[0];
    const onSuccess = callbacks?.onSuccess;

    if (onSuccess) {
      // Simulate a successful board generation
      await onSuccess(mockGeneratedBoard);

      expect(mockInvalidateQueries).toHaveBeenCalledTimes(1);
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["board", "list", mockProjectId],
      });
    }
  });

  it("should handle error states correctly", async () => {
    // Arrange
    const wrapper = createWrapper();
    const mockError = new Error("Failed to generate board");

    // Setup mock to throw an error
    mockMutateAsync.mockRejectedValue(mockError);

    // Act
    const { result } = renderHook(() => useGenerateBoard(), { wrapper });

    // Assert
    await expect(result.current.mutateAsync(generateBoardData)).rejects.toThrow(
      mockError,
    );
  });
});
