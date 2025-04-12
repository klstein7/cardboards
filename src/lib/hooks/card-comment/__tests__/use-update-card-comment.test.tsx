import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { useUpdateCardComment } from "../use-update-card-comment";

// Mock data
const mockCommentId = "comment-5";
const mockCardId = 123;
const updateCommentData = {
  data: {
    content: "This is an updated comment",
  },
  cardCommentId: mockCommentId,
};

const mockUpdatedComment = {
  id: mockCommentId,
  content: updateCommentData.data.content,
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
      update: {
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

describe("useUpdateCardComment", () => {
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();

    // Default mock implementations
    mockMutationOptions.mockImplementation((options) => ({
      mutationFn: async (data: typeof updateCommentData) => {
        return mockUpdatedComment;
      },
      ...options,
    }));

    mockListQueryKey.mockImplementation((cardId) => [
      "cardComment",
      "list",
      cardId,
    ]);

    // Setup mock to return updated comment
    mockMutateAsync.mockResolvedValue(mockUpdatedComment);
  });

  it("should update a comment when called with valid data", async () => {
    // Arrange
    const wrapper = createWrapper();

    // Act
    const { result } = renderHook(() => useUpdateCardComment(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync(updateCommentData);
    });

    // Assert
    expect(mockMutateAsync).toHaveBeenCalledWith(updateCommentData);
    expect(mockMutationOptions).toHaveBeenCalled();

    // Check that invalidateQueries was called for the comment list
    const callbacks = mockMutationOptions.mock.calls[0]?.[0];
    const onSuccess = callbacks?.onSuccess;

    if (onSuccess) {
      // Simulate a successful update
      await onSuccess(mockUpdatedComment);

      expect(mockInvalidateQueries).toHaveBeenCalledTimes(1);
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["cardComment", "list", mockCardId],
      });
    }
  });

  it("should handle error states correctly", async () => {
    // Arrange
    const wrapper = createWrapper();
    const mockError = new Error("Failed to update comment");

    // Setup mock to throw an error
    mockMutateAsync.mockRejectedValue(mockError);

    // Act
    const { result } = renderHook(() => useUpdateCardComment(), { wrapper });

    // Assert
    await expect(result.current.mutateAsync(updateCommentData)).rejects.toThrow(
      mockError,
    );
  });
});
