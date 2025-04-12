import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { useDeleteCard } from "../use-delete-card";

// Mock tRPC client and mutation function
const mockMutateAsync = vi.fn();
const mockInvalidateQueries = vi.fn();

vi.mock("~/trpc/client", () => ({
  useTRPC: () => ({
    card: {
      delete: {
        mutationOptions: (options: any) => ({
          mutationFn: mockMutateAsync,
          ...options, // Preserve onSuccess
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

describe("useDeleteCard", () => {
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();
  });

  it("should call delete mutation and invalidate list query on success", async () => {
    // Arrange
    const wrapper = createWrapper();
    const { result } = renderHook(() => useDeleteCard(), { wrapper });

    const cardIdToDelete = 456;
    const columnIdOfDeletedCard = "col-3";
    // Mock mutation response needs columnId for onSuccess invalidation
    mockMutateAsync.mockResolvedValue({ columnId: columnIdOfDeletedCard });

    // Act
    await result.current.mutateAsync({ cardId: cardIdToDelete });

    // Assert: Mutation called
    expect(mockMutateAsync).toHaveBeenCalledWith({ cardId: cardIdToDelete });
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Assert: Query invalidation
    await waitFor(() => {
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["cards", "list", columnIdOfDeletedCard],
      });
    });
  });

  it("should handle mutation error", async () => {
    // Arrange
    const wrapper = createWrapper();
    const { result } = renderHook(() => useDeleteCard(), { wrapper });

    const error = new Error("Failed to delete card");
    mockMutateAsync.mockRejectedValue(error);
    const cardIdToDelete = 789;

    // Act & Assert
    await expect(
      result.current.mutateAsync({ cardId: cardIdToDelete }),
    ).rejects.toThrow(error);

    // Assert
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(result.current.error).toBe(error);
    expect(mockInvalidateQueries).not.toHaveBeenCalled();
  });
});
