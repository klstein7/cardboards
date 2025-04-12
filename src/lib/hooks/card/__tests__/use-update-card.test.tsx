import React from "react";
import {
  QueryClient,
  QueryClientProvider,
  type QueryKey,
} from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, type Mock } from "vitest";

import { type Card } from "~/app/(project)/_types";
import { useUpdateCard } from "../use-update-card";

// Mocks for tRPC and QueryClient methods
const mockMutateAsync = vi.fn();
const mockInvalidateQueries = vi.fn();
const mockSetQueryData = vi.fn();
const mockGetQueryData = vi.fn();
const mockCancelQueries = vi.fn();

vi.mock("~/trpc/client", () => ({
  useTRPC: () => ({
    card: {
      update: {
        // Ensure the actual hook's onMutate/onError/onSuccess are used
        mutationOptions: (options: any) => ({
          mutationFn: mockMutateAsync,
          ...options,
        }),
      },
      get: {
        queryKey: (cardId: number): QueryKey => ["cards", "get", cardId],
      },
      list: {
        queryKey: (columnId: string): QueryKey => ["cards", "list", columnId],
      },
    },
  }),
}));

// Helper to create wrapper with mocked QueryClient methods
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  // Assign mocks to the specific instance
  queryClient.invalidateQueries = mockInvalidateQueries;
  queryClient.setQueryData = mockSetQueryData;
  queryClient.getQueryData = mockGetQueryData as Mock;
  queryClient.cancelQueries = mockCancelQueries;

  // eslint-disable-next-line react/display-name
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useUpdateCard", () => {
  const cardId = 123;
  const originalColumnId = "col-1";
  const originalCard: Card = {
    id: cardId,
    title: "Original Title",
    description: "Original Desc",
    columnId: originalColumnId,
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    labels: [],
    assignedToId: null,
    assignedTo: null,
    dueDate: null,
    priority: null,
  };

  beforeEach(() => {
    // Reset all mocks before each test
    vi.resetAllMocks();
  });

  it("should call update mutation, optimistically update, and invalidate list query on success (no column change)", async () => {
    // Arrange
    const updateData = { title: "Updated Title" };
    const expectedOptimisticCard = {
      ...originalCard,
      ...updateData,
      updatedAt: expect.any(Date),
    };
    const finalUpdatedCard = {
      ...expectedOptimisticCard,
      updatedAt: new Date(),
    }; // Simulate server response time
    const getQueryKey: QueryKey = ["cards", "get", cardId];
    const listQueryKey: QueryKey = ["cards", "list", originalColumnId];

    mockGetQueryData.mockReturnValue(originalCard); // Mock cache for onMutate
    mockMutateAsync.mockResolvedValue(finalUpdatedCard); // Mock server response

    const wrapper = createWrapper();
    const { result } = renderHook(() => useUpdateCard(), { wrapper });

    // Act
    await result.current.mutateAsync({ cardId, data: updateData });

    // Assert: onMutate
    expect(mockCancelQueries).toHaveBeenCalledWith({ queryKey: getQueryKey });
    expect(mockGetQueryData).toHaveBeenCalledWith(getQueryKey);
    expect(mockSetQueryData).toHaveBeenCalledWith(
      getQueryKey,
      expectedOptimisticCard,
    );

    // Assert: Mutation call
    expect(mockMutateAsync).toHaveBeenCalledWith({ cardId, data: updateData });

    // Assert: onSuccess
    await waitFor(() => {
      expect(mockSetQueryData).toHaveBeenCalledWith(
        getQueryKey,
        finalUpdatedCard,
      );
    });
    await waitFor(() => {
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: listQueryKey,
      });
    });

    // Assert: Hook state
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.data).toEqual(finalUpdatedCard);
  });

  it("should invalidate old and new lists on success when columnId changes", async () => {
    // Arrange
    const newColumnId = "col-2";
    const updateData = { columnId: newColumnId };
    const expectedOptimisticCard = {
      ...originalCard,
      ...updateData,
      updatedAt: expect.any(Date),
    };
    const finalUpdatedCard = {
      ...expectedOptimisticCard,
      updatedAt: new Date(),
    };
    const getQueryKey: QueryKey = ["cards", "get", cardId];
    const oldListQueryKey: QueryKey = ["cards", "list", originalColumnId];
    const newListQueryKey: QueryKey = ["cards", "list", newColumnId];

    // Mock getQueryData:
    // - First call (in onMutate) returns originalCard
    // - Second call (in onSuccess) *also* returns originalCard (simulating state before onSuccess runs setQueryData)
    mockGetQueryData.mockReturnValue(originalCard);
    mockMutateAsync.mockResolvedValue(finalUpdatedCard);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useUpdateCard(), { wrapper });

    // Act
    await result.current.mutateAsync({ cardId, data: updateData });

    // Assert: onMutate
    expect(mockCancelQueries).toHaveBeenCalledWith({ queryKey: getQueryKey });
    expect(mockGetQueryData).toHaveBeenCalledWith(getQueryKey);
    expect(mockSetQueryData).toHaveBeenCalledWith(
      getQueryKey,
      expectedOptimisticCard,
    );

    // Assert: Mutation call
    expect(mockMutateAsync).toHaveBeenCalledWith({ cardId, data: updateData });

    // Assert: onSuccess
    await waitFor(() => {
      expect(mockSetQueryData).toHaveBeenCalledWith(
        getQueryKey,
        finalUpdatedCard,
      );
    });
    await waitFor(() => {
      // Check invalidation of BOTH lists
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: oldListQueryKey,
      });
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: newListQueryKey,
      });
    });

    // Assert: Hook state
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.data).toEqual(finalUpdatedCard);
  });

  it("should rollback optimistic update on error", async () => {
    // Arrange
    const updateData = { title: "Failed Update" };
    const error = new Error("Update failed");
    const getQueryKey: QueryKey = ["cards", "get", cardId];
    const expectedOptimisticCard = {
      ...originalCard,
      ...updateData,
      updatedAt: expect.any(Date),
    };

    mockGetQueryData.mockReturnValue(originalCard); // Mock cache for onMutate
    mockMutateAsync.mockRejectedValue(error); // Mock mutation failure

    const wrapper = createWrapper();
    const { result } = renderHook(() => useUpdateCard(), { wrapper });

    // Act & Assert
    await expect(
      result.current.mutateAsync({ cardId, data: updateData }),
    ).rejects.toThrow(error);

    // Assert: onMutate was called
    expect(mockCancelQueries).toHaveBeenCalledWith({ queryKey: getQueryKey });
    expect(mockGetQueryData).toHaveBeenCalledWith(getQueryKey);
    expect(mockSetQueryData).toHaveBeenCalledWith(
      getQueryKey,
      expectedOptimisticCard,
    );

    // Assert: onError (rollback)
    await waitFor(() => {
      // Check that setQueryData was called again with the original card
      expect(mockSetQueryData).toHaveBeenCalledWith(getQueryKey, originalCard);
    });

    // Assert: No invalidation occurred
    expect(mockInvalidateQueries).not.toHaveBeenCalled();

    // Assert: Hook state
    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBe(error);
  });

  it("should handle error correctly when no previous data exists for rollback", async () => {
    // Arrange
    const updateData = { title: "Failed Update" };
    const error = new Error("Update failed");
    const getQueryKey: QueryKey = ["cards", "get", cardId];

    // Simulate no data in cache
    mockGetQueryData.mockReturnValue(undefined);
    mockMutateAsync.mockRejectedValue(error);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useUpdateCard(), { wrapper });

    // Act & Assert
    await expect(
      result.current.mutateAsync({ cardId, data: updateData }),
    ).rejects.toThrow(error);

    // Assert: onMutate was called, but setQueryData for optimistic update was skipped
    expect(mockCancelQueries).toHaveBeenCalledWith({ queryKey: getQueryKey });
    expect(mockGetQueryData).toHaveBeenCalledWith(getQueryKey);
    expect(mockSetQueryData).not.toHaveBeenCalled(); // No optimistic update attempted

    // Assert: onError did not call setQueryData (no previous data)
    await waitFor(() => {
      expect(mockSetQueryData).not.toHaveBeenCalled();
    });

    // Assert: No invalidation occurred
    expect(mockInvalidateQueries).not.toHaveBeenCalled();

    // Assert: Hook state
    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBe(error);
  });
});
