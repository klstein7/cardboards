import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { useDuplicateCard } from "../use-duplicate-card";

// Mock tRPC client and mutation function
const mockMutateAsync = vi.fn();
const mockInvalidateQueries = vi.fn();

vi.mock("~/trpc/client", () => ({
  useTRPC: () => ({
    card: {
      duplicate: {
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

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useDuplicateCard", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should call duplicate mutation and invalidate list query on success", async () => {
    // Arrange
    const wrapper = createWrapper();
    const { result } = renderHook(() => useDuplicateCard(), { wrapper });

    const cardIdToDuplicate = 123;
    const duplicatedCard = {
      id: 124,
      title: "Duplicated Card",
      columnId: "col-1",
    }; // Example response
    mockMutateAsync.mockResolvedValue(duplicatedCard);

    // Act
    await result.current.mutateAsync({ cardId: cardIdToDuplicate });

    // Assert: Mutation called
    expect(mockMutateAsync).toHaveBeenCalledWith({ cardId: cardIdToDuplicate });
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data).toEqual(duplicatedCard);

    // Assert: Query invalidation
    await waitFor(() => {
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["cards", "list", duplicatedCard.columnId],
      });
    });
  });

  it("should handle mutation error", async () => {
    // Arrange
    const wrapper = createWrapper();
    const { result } = renderHook(() => useDuplicateCard(), { wrapper });

    const error = new Error("Failed to duplicate card");
    mockMutateAsync.mockRejectedValue(error);
    const cardIdToDuplicate = 456;

    // Act & Assert
    await expect(
      result.current.mutateAsync({ cardId: cardIdToDuplicate }),
    ).rejects.toThrow(error);

    // Assert
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(result.current.error).toBe(error);
    expect(mockInvalidateQueries).not.toHaveBeenCalled();
  });
});
