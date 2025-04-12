import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { useCreateManyCards } from "../use-create-many-cards";

// Mock tRPC client and mutation function
const mockMutateAsync = vi.fn();
const mockInvalidateQueries = vi.fn();

vi.mock("~/trpc/client", () => ({
  useTRPC: () => ({
    card: {
      createMany: {
        mutationOptions: (options: any) => ({
          mutationFn: mockMutateAsync,
          ...options, // Preserve onSuccess etc.
        }),
      },
      list: {
        queryKey: (columnId: string) => ["cards", "list", columnId],
      },
    },
  }),
}));

// Reusable wrapper with mocked invalidateQueries
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  queryClient.invalidateQueries = mockInvalidateQueries;

  // eslint-disable-next-line react/display-name
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useCreateManyCards", () => {
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();
  });

  it("should call createMany mutation and invalidate list queries for each card on success", async () => {
    // Arrange
    const wrapper = createWrapper();
    const { result } = renderHook(() => useCreateManyCards(), { wrapper });

    const cardsData = [
      { title: "Card 1", columnId: "col-1", labels: [] },
      { title: "Card 2", columnId: "col-1", labels: [] },
      { title: "Card 3", columnId: "col-2", labels: [] },
    ];

    const input = {
      boardId: "test-board-id",
      data: cardsData,
    };

    const createdCards = cardsData.map((card, index) => ({
      id: index + 1,
      ...card,
    }));

    mockMutateAsync.mockResolvedValue(createdCards);

    // Act
    await result.current.mutateAsync(input);

    // Assert
    expect(mockMutateAsync).toHaveBeenCalledWith(input);
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data).toEqual(createdCards);

    // Assert: Check query invalidation - should be called for each card
    await waitFor(() => {
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["cards", "list", "col-1"],
      });
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["cards", "list", "col-2"],
      });
    });
    // Should be called once for each card (3 times total)
    expect(mockInvalidateQueries).toHaveBeenCalledTimes(3);
  });

  it("should handle mutation error", async () => {
    // Arrange
    const wrapper = createWrapper();
    const { result } = renderHook(() => useCreateManyCards(), { wrapper });

    const error = new Error("Failed to create cards");
    mockMutateAsync.mockRejectedValue(error);

    const input = {
      boardId: "test-board-id",
      data: [
        { title: "Fail Card 1", columnId: "col-fail", labels: [] },
        { title: "Fail Card 2", columnId: "col-fail", labels: [] },
      ],
    };

    // Act & Assert
    await expect(result.current.mutateAsync(input)).rejects.toThrow(error);

    // Assert
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(result.current.error).toBe(error);
    expect(mockInvalidateQueries).not.toHaveBeenCalled();
  });
});
