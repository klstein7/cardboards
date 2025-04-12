import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { useRemoveCardComment } from "../use-remove-card-comment";

// Mock data
const mockCommentId = "comment-5";
const mockCardId = 123;

const mockRemovedComment = {
  id: mockCommentId,
  content: "This is a comment to be removed",
  cardId: mockCardId,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  userId: "user-1",
  user: {
    id: "user-1",
    name: "John Doe",
    image: "https://example.com/avatar.jpg",
  },
};

// Mock tRPC
const mockMutationOptions = vi.fn();
const mockListQueryKey = vi.fn();

vi.mock("~/trpc/client", () => ({
  useTRPC: () => ({
    cardComment: {
      remove: {
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

// Helper to create wrapper with QueryClient
function createWrapper() {
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
}

describe("useRemoveCardComment", () => {
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();

    // Default mock implementations
    mockMutationOptions.mockImplementation((options) => ({
      mutationFn: async (commentId: string) => {
        return mockRemovedComment;
      },
      ...options,
    }));

    mockListQueryKey.mockImplementation((cardId) => [
      "cardComment",
      "list",
      cardId,
    ]);

    // Setup mock to return removed comment
    mockMutateAsync.mockResolvedValue(mockRemovedComment);
  });

  it("should remove a comment when called with valid ID", async () => {
    // Arrange
    const wrapper = createWrapper();

    // Act
    const { result } = renderHook(() => useRemoveCardComment(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync(mockCommentId);
    });

    // Assert
    expect(mockMutateAsync).toHaveBeenCalledWith(mockCommentId);
    expect(mockMutationOptions).toHaveBeenCalled();

    // Check that invalidateQueries was called for the comment list
    const callbacks = mockMutationOptions.mock.calls[0]?.[0];
    const onSuccess = callbacks?.onSuccess;

    if (onSuccess) {
      // Simulate a successful removal
      await onSuccess(mockRemovedComment);

      expect(mockInvalidateQueries).toHaveBeenCalledTimes(1);
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["cardComment", "list", mockCardId],
      });
    }
  });

  it("should handle error states correctly", async () => {
    // Arrange
    const wrapper = createWrapper();
    const mockError = new Error("Failed to remove comment");

    // Setup mock to throw an error
    mockMutateAsync.mockRejectedValue(mockError);

    // Act
    const { result } = renderHook(() => useRemoveCardComment(), { wrapper });

    // Assert
    await expect(result.current.mutateAsync(mockCommentId)).rejects.toThrow(
      mockError,
    );
  });
});
