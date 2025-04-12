import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { useMoveCard } from "../use-move-card";

// Mock the board state provider
vi.mock(
  "~/app/(project)/p/[projectId]/(board)/_components/board-state-provider",
  () => ({
    useBoardState: () => ({
      getCard: () => document.createElement("div"),
    }),
  }),
);

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useParams: () => ({ boardId: "test-board-id" }),
}));

// Mock utils
vi.mock("~/lib/utils", () => ({
  retryFlash: vi.fn(),
}));

// Mock tRPC client functions that are CALLED by the hook or its dependencies
const mockMutateAsync = vi.fn();
const mockBoardGetQueryFn = vi.fn().mockResolvedValue({
  id: "test-board-id",
  color: "blue",
  name: "Test Board",
});

vi.mock("~/trpc/client", () => ({
  useTRPC: () => ({
    // Provide the structure needed by useMoveCard and useBoard
    card: {
      // useMoveCard directly calls trpc.card.move.mutationOptions
      // So we need to mock that part of the structure
      move: {
        // This is what useMoveCard calls inside itself
        mutationOptions: (options: any) => options, // Pass options through
      },
      list: {
        queryKey: (columnId: string) => ["cards", "list", columnId],
      },
    },
    board: {
      get: {
        // Provide queryOptions needed by useBoard
        queryOptions: (boardId: string) => ({
          queryKey: ["board", "get", boardId],
          queryFn: () => mockBoardGetQueryFn(boardId),
        }),
      },
    },
  }),
}));

// Mock useMutation from react-query
vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>();
  return {
    ...actual,
    useMutation: (options: any) => {
      // Replace the actual mutation function with our mock
      const mockedOptions = {
        ...options,
        mutationFn: mockMutateAsync, // Intercept the actual mutation call
      };
      // Call the *original* useMutation with the modified options
      // This preserves the hook's onMutate, onError, onSettled logic
      return actual.useMutation(mockedOptions);
    },
  };
});

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
      // Provide mock data for the board query needed by useCurrentBoard -> retryFlash
      if (queryType === "board" && entityType === "get") {
        return { id: "test-board-id", color: "blue", name: "Test Board" };
      }
      // Important: Return undefined if no mock data exists for the key
      return undefined;
    });

    // Ensure the mocked board query resolves immediately for useCurrentBoard
    mockBoardGetQueryFn.mockResolvedValue({
      id: "test-board-id",
      color: "blue",
      name: "Test Board",
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
    expect(mockCancelQueries).toHaveBeenCalledTimes(2);
    expect(mockGetQueryData).toHaveBeenCalledWith(["cards", "list", "col-1"]);
    expect(mockSetQueryData).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["cards", "list", "col-1"],
        refetchType: "inactive",
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
        refetchType: "inactive",
      });
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["cards", "list", "col-2"],
        refetchType: "inactive",
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

    // Assert: Ensure invalidate was NOT called on error
    expect(mockInvalidateQueries).not.toHaveBeenCalled();
  });

  // Verify basic hook structure
  it("returns mutate and mutateAsync methods from the hook", () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useMoveCard(), { wrapper });

    // Verify the hook provides the expected interface
    expect(result.current.mutate).toBeInstanceOf(Function);
    expect(result.current.mutateAsync).toBeInstanceOf(Function);
    expect(result.current.mutateImmediate).toBeInstanceOf(Function);
  });
});
