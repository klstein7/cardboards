import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { useCreateCard } from "../use-create-card";

// Mock tRPC client and mutation function
const mockMutateAsync = vi.fn();
const mockInvalidateQueries = vi.fn();

vi.mock("~/trpc/client", () => ({
  useTRPC: () => ({
    card: {
      create: {
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

describe("useCreateCard", () => {
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();
  });

  it("should call create mutation and invalidate list query on success", async () => {
    // Arrange
    const wrapper = createWrapper();
    const { result } = renderHook(() => useCreateCard(), { wrapper });

    const newCardData = { title: "New Card", columnId: "col-1", labels: [] };
    const createdCard = { id: 1, ...newCardData };

    mockMutateAsync.mockResolvedValue(createdCard);

    // Act
    await result.current.mutateAsync(newCardData);

    // Assert
    expect(mockMutateAsync).toHaveBeenCalledWith(newCardData);
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data).toEqual(createdCard);

    // Assert: Check query invalidation
    await waitFor(() => {
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["cards", "list", "col-1"],
      });
    });
  });

  it("should handle mutation error", async () => {
    // Arrange
    const wrapper = createWrapper();
    const { result } = renderHook(() => useCreateCard(), { wrapper });

    const error = new Error("Failed to create card");
    mockMutateAsync.mockRejectedValue(error);
    const cardData = { title: "Fail Card", columnId: "col-fail", labels: [] };

    // Act & Assert
    await expect(result.current.mutateAsync(cardData)).rejects.toThrow(error);

    // Assert
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(result.current.error).toBe(error);
    expect(mockInvalidateQueries).not.toHaveBeenCalled();
  });
});
