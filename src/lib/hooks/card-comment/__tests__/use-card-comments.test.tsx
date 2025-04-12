import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { useCardComments } from "../use-card-comments";

// Mock data
const mockCardId = 123;
const mockComments = [
  {
    id: 1,
    content: "This is the first comment",
    cardId: mockCardId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: "user-1",
    user: {
      id: "user-1",
      name: "John Doe",
      image: "https://example.com/avatar.jpg",
    },
  },
  {
    id: 2,
    content: "This is the second comment",
    cardId: mockCardId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: "user-2",
    user: {
      id: "user-2",
      name: "Jane Smith",
      image: "https://example.com/avatar2.jpg",
    },
  },
];

// Mock tRPC
const mockQueryOptions = vi.fn();

vi.mock("~/trpc/client", () => ({
  useTRPC: () => ({
    cardComment: {
      list: {
        queryOptions: mockQueryOptions,
        queryKey: (cardId: number) => ["cardComment", "list", cardId],
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

describe("useCardComments", () => {
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();

    // Default mock implementation
    mockQueryOptions.mockImplementation((cardId) => ({
      queryKey: ["cardComment", "list", cardId],
      queryFn: async () => mockComments,
    }));
  });

  it("should fetch and return comments for a card", async () => {
    // Arrange
    const wrapper = createWrapper();

    // Act
    const { result } = renderHook(() => useCardComments(mockCardId), {
      wrapper,
    });

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockComments);
    expect(mockQueryOptions).toHaveBeenCalledWith(mockCardId);
  });

  it("should handle error states correctly", async () => {
    // Arrange
    const wrapper = createWrapper();
    const mockError = new Error("Failed to fetch comments");

    // Setup mock to throw an error
    mockQueryOptions.mockImplementation(() => ({
      queryKey: ["cardComment", "list", mockCardId],
      queryFn: async () => {
        throw mockError;
      },
    }));

    // Act
    const { result } = renderHook(() => useCardComments(mockCardId), {
      wrapper,
    });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
