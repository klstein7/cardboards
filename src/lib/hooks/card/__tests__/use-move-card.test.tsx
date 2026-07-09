import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useMoveCard } from "../use-move-card";

const mockMutateAsync = vi.fn();

vi.mock("~/trpc/client", () => ({
  useTRPC: () => ({
    card: {
      move: {
        mutationOptions: (options: any = {}) => ({
          ...options,
          mutationKey: ["card", "move"],
          mutationFn: mockMutateAsync,
        }),
      },
      list: {
        queryKey: (columnId: string) => ["cards", "list", columnId],
      },
    },
  }),
}));

const mockInvalidateQueries = vi.fn();
const mockCancelQueries = vi.fn();
const mockGetQueryData = vi.fn();
const mockSetQueryData = vi.fn();

// Create a wrapper with mocked query client methods
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity, // Prevent background refetches during tests
      },
    },
  });

  // Mock queryClient methods used in mutationOptions callbacks
  queryClient.invalidateQueries = mockInvalidateQueries;
  queryClient.cancelQueries = mockCancelQueries;
  queryClient.getQueryData = mockGetQueryData;
  queryClient.setQueryData = mockSetQueryData;

  // eslint-disable-next-line react/display-name
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useMoveCard", () => {
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();

    // Setup default mock implementations for getQueryData used in onMutate/onError
    mockGetQueryData.mockImplementation((key) => {
      const queryType = key[0];
      const entityType = key[1];
      const id = key[2];

      if (queryType === "cards" && entityType === "list") {
        if (id === "col-1") {
          return [
            { id: 1, order: 0, columnId: "col-1", title: "Card 1" },
            { id: 2, order: 1, columnId: "col-1", title: "Card 2" },
          ];
        }
        if (id === "col-2") {
          return [
            { id: 3, order: 0, columnId: "col-2", title: "Card 3" },
            { id: 4, order: 1, columnId: "col-2", title: "Card 4" },
          ];
        }
      }
      return undefined;
    });
  });

  it("should perform optimistic updates for moving card within the same column", async () => {
    // Arrange
    const wrapper = createWrapper();
    mockMutateAsync.mockResolvedValue({ id: 1, order: 1, columnId: "col-1" }); // Mock mutation success
    const { result } = renderHook(() => useMoveCard(), { wrapper });

    const moveData = {
      cardId: 1,
      sourceColumnId: "col-1",
      destinationColumnId: "col-1",
      newOrder: 1,
    };

    // Act
    await act(async () => {
      await result.current.mutateAsync(moveData);
    });

    // Assert: Check mocks AFTER mutation settles (onMutate/onSettled run by react-query)
    expect(mockCancelQueries).toHaveBeenCalledTimes(1);
    expect(mockGetQueryData).toHaveBeenCalledWith(["cards", "list", "col-1"]);
    expect(mockSetQueryData).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["cards", "list", "col-1"],
        refetchType: "active",
      });
    });
    expect(mockInvalidateQueries).toHaveBeenCalledTimes(1); // Only one column invalidation
  });

  it("should perform optimistic updates for moving card between columns", async () => {
    // Arrange
    const wrapper = createWrapper();
    mockMutateAsync.mockResolvedValue({ id: 1, order: 1, columnId: "col-2" });
    const { result } = renderHook(() => useMoveCard(), { wrapper });

    const moveData = {
      cardId: 1,
      sourceColumnId: "col-1",
      destinationColumnId: "col-2",
      newOrder: 1,
    };

    // Act
    await act(async () => {
      await result.current.mutateAsync(moveData);
    });

    // Assert
    expect(mockCancelQueries).toHaveBeenCalledTimes(2);
    expect(mockGetQueryData).toHaveBeenCalledWith(["cards", "list", "col-1"]);
    expect(mockGetQueryData).toHaveBeenCalledWith(["cards", "list", "col-2"]);
    expect(mockSetQueryData).toHaveBeenCalledTimes(2);

    await waitFor(() => {
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["cards", "list", "col-1"],
        refetchType: "active",
      });
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["cards", "list", "col-2"],
        refetchType: "active",
      });
    });
    expect(mockInvalidateQueries).toHaveBeenCalledTimes(2); // Both columns invalidated
  });

  it("should handle errors and revert optimistic updates", async () => {
    // Arrange
    const wrapper = createWrapper();
    const error = new Error("Failed to move card");
    mockMutateAsync.mockRejectedValue(error);
    const { result } = renderHook(() => useMoveCard(), { wrapper });

    const moveData = {
      cardId: 1,
      sourceColumnId: "col-1",
      destinationColumnId: "col-2",
      newOrder: 1,
    };

    const previousSourceCards = [
      { id: 1, order: 0, columnId: "col-1", title: "Card 1" },
      { id: 2, order: 1, columnId: "col-1", title: "Card 2" },
    ];
    const previousDestCards = [
      { id: 3, order: 0, columnId: "col-2", title: "Card 3" },
      { id: 4, order: 1, columnId: "col-2", title: "Card 4" },
    ];

    // Act & Assert Error
    await act(async () => {
      await expect(result.current.mutateAsync(moveData)).rejects.toThrow(error);
    });

    // Assert: Check mocks AFTER mutation settles (onError should have run)
    expect(mockCancelQueries).toHaveBeenCalledTimes(2);
    expect(mockGetQueryData).toHaveBeenCalledWith(["cards", "list", "col-1"]);
    expect(mockGetQueryData).toHaveBeenCalledWith(["cards", "list", "col-2"]);

    // Assert: Check that setQueryData was called by onError to revert changes
    // Need waitFor because setQueryData in onError might be async (though likely not here)
    await waitFor(() => {
      expect(mockSetQueryData).toHaveBeenCalledWith(
        ["cards", "list", "col-1"],
        previousSourceCards,
      );
      expect(mockSetQueryData).toHaveBeenCalledWith(
        ["cards", "list", "col-2"],
        previousDestCards,
      );
    });

    // Reconcile active queries after the rollback in case the request outcome
    // was ambiguous at the network boundary.
    await waitFor(() => {
      expect(mockInvalidateQueries).toHaveBeenCalledTimes(2);
    });
  });

  // Verify basic hook structure
  it("returns mutate and mutateAsync methods from the hook", () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useMoveCard(), { wrapper });

    // Verify the hook provides the expected interface
    expect(result.current.mutate).toBeInstanceOf(Function);
    expect(result.current.mutateAsync).toBeInstanceOf(Function);
  });

  it("starts the standard mutate path without a debounce timer", async () => {
    const wrapper = createWrapper();
    mockMutateAsync.mockResolvedValue({ id: 1, order: 1, columnId: "col-1" });
    const { result } = renderHook(() => useMoveCard(), { wrapper });

    await act(async () => {
      result.current.mutate({
        cardId: 1,
        sourceColumnId: "col-1",
        destinationColumnId: "col-1",
        newOrder: 1,
      });
      await Promise.resolve();
    });

    expect(mockMutateAsync).toHaveBeenCalledTimes(1);
  });

  it("does not reconcile a lane while another optimistic move still affects it", async () => {
    const firstRequest = deferred<{
      id: number;
      order: number;
      columnId: string;
    }>();
    const secondRequest = deferred<{
      id: number;
      order: number;
      columnId: string;
    }>();
    mockMutateAsync.mockImplementation(({ cardId }: { cardId: number }) =>
      cardId === 1 ? firstRequest.promise : secondRequest.promise,
    );
    const wrapper = createWrapper();
    const { result } = renderHook(() => useMoveCard(), { wrapper });

    let firstMove!: Promise<unknown>;
    let secondMove!: Promise<unknown>;
    await act(async () => {
      firstMove = result.current.mutateAsync({
        cardId: 1,
        sourceColumnId: "col-1",
        destinationColumnId: "col-1",
        newOrder: 1,
      });
      secondMove = result.current.mutateAsync({
        cardId: 2,
        sourceColumnId: "col-1",
        destinationColumnId: "col-1",
        newOrder: 0,
      });
      await Promise.resolve();
    });

    await waitFor(() => expect(mockMutateAsync).toHaveBeenCalledTimes(2));

    await act(async () => {
      secondRequest.resolve({ id: 2, order: 0, columnId: "col-1" });
      await secondMove;
    });

    expect(mockInvalidateQueries).not.toHaveBeenCalled();

    await act(async () => {
      firstRequest.resolve({ id: 1, order: 1, columnId: "col-1" });
      await firstMove;
    });

    await waitFor(() => {
      expect(mockInvalidateQueries).toHaveBeenCalledTimes(1);
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["cards", "list", "col-1"],
        refetchType: "active",
      });
    });
  });

  it("serializes rapid server requests for the same card", async () => {
    const firstRequest = deferred<{
      id: number;
      order: number;
      columnId: string;
    }>();
    const secondRequest = deferred<{
      id: number;
      order: number;
      columnId: string;
    }>();
    mockMutateAsync
      .mockImplementationOnce(() => firstRequest.promise)
      .mockImplementationOnce(() => secondRequest.promise);
    const wrapper = createWrapper();
    const { result } = renderHook(() => useMoveCard(), { wrapper });

    let firstMove!: Promise<unknown>;
    let secondMove!: Promise<unknown>;
    await act(async () => {
      firstMove = result.current.mutateAsync({
        cardId: 1,
        sourceColumnId: "col-1",
        destinationColumnId: "col-1",
        newOrder: 1,
      });
      secondMove = result.current.mutateAsync({
        cardId: 1,
        sourceColumnId: "col-1",
        destinationColumnId: "col-1",
        newOrder: 0,
      });
      await Promise.resolve();
    });

    await waitFor(() => expect(mockMutateAsync).toHaveBeenCalledTimes(1));

    await act(async () => {
      firstRequest.resolve({ id: 1, order: 1, columnId: "col-1" });
      await firstMove;
    });
    await waitFor(() => expect(mockMutateAsync).toHaveBeenCalledTimes(2));

    await act(async () => {
      secondRequest.resolve({ id: 1, order: 0, columnId: "col-1" });
      await secondMove;
    });
  });

  it("does not roll back a newer optimistic move when an overlapping move fails", async () => {
    const failedRequest = deferred<never>();
    const successfulRequest = deferred<{
      id: number;
      order: number;
      columnId: string;
    }>();
    mockMutateAsync.mockImplementation(({ cardId }: { cardId: number }) =>
      cardId === 1 ? failedRequest.promise : successfulRequest.promise,
    );
    const wrapper = createWrapper();
    const { result } = renderHook(() => useMoveCard(), { wrapper });

    let failedMove!: Promise<unknown>;
    let successfulMove!: Promise<unknown>;
    await act(async () => {
      failedMove = result.current.mutateAsync({
        cardId: 1,
        sourceColumnId: "col-1",
        destinationColumnId: "col-1",
        newOrder: 1,
      });
      successfulMove = result.current.mutateAsync({
        cardId: 2,
        sourceColumnId: "col-1",
        destinationColumnId: "col-1",
        newOrder: 0,
      });
      await Promise.resolve();
    });

    await waitFor(() => expect(mockMutateAsync).toHaveBeenCalledTimes(2));
    mockSetQueryData.mockClear();

    await act(async () => {
      successfulRequest.resolve({ id: 2, order: 0, columnId: "col-1" });
      await successfulMove;
    });

    expect(mockInvalidateQueries).not.toHaveBeenCalled();

    await act(async () => {
      failedRequest.reject(new Error("Move failed"));
      await expect(failedMove).rejects.toThrow("Move failed");
    });

    expect(mockSetQueryData).not.toHaveBeenCalled();

    await waitFor(() => expect(mockInvalidateQueries).toHaveBeenCalledTimes(1));
  });
});

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, reject, resolve };
}
