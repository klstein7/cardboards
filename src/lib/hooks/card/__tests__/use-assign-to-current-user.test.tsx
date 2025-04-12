import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { useAssignToCurrentUser } from "../use-assign-to-current-user";

// Mock tRPC client and mutation function
const mockMutateAsync = vi.fn();
const mockInvalidateQueries = vi.fn();

vi.mock("~/trpc/client", () => ({
  useTRPC: () => ({
    card: {
      assignToCurrentUser: {
        mutationOptions: (options: any) => ({
          mutationFn: mockMutateAsync,
          ...options, // Preserve onSuccess etc.
        }),
      },
      list: {
        queryKey: (columnId: string) => ["cards", "list", columnId],
      },
      get: {
        queryKey: (cardId: string) => ["cards", "get", cardId],
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

describe("useAssignToCurrentUser", () => {
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();
  });

  it("should call assignToCurrentUser mutation and invalidate related queries on success", async () => {
    // Arrange
    const wrapper = createWrapper();
    const { result } = renderHook(() => useAssignToCurrentUser(), { wrapper });

    const cardId = 1;
    const payload = { cardId };
    const updatedCard = {
      id: cardId,
      columnId: "col-1",
      title: "Test Card",
      assignedToUserId: "user-1",
    };

    mockMutateAsync.mockResolvedValue(updatedCard);

    // Act
    await result.current.mutateAsync(payload);

    // Assert
    expect(mockMutateAsync).toHaveBeenCalledWith(payload);
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data).toEqual(updatedCard);

    // Assert: Check query invalidation
    await waitFor(() => {
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["cards", "list", "col-1"],
      });
    });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ["cards", "get", cardId],
    });
  });

  it("should handle mutation error", async () => {
    // Arrange
    const wrapper = createWrapper();
    const { result } = renderHook(() => useAssignToCurrentUser(), { wrapper });

    const error = new Error("Failed to assign card to current user");
    mockMutateAsync.mockRejectedValue(error);
    const cardId = 2;
    const payload = { cardId };

    // Act & Assert
    await expect(result.current.mutateAsync(payload)).rejects.toThrow(error);

    // Assert
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(result.current.error).toBe(error);
    expect(mockInvalidateQueries).not.toHaveBeenCalled();
  });
});
