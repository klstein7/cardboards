import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { useCard } from "../use-card";

// Mock data
const mockCard = {
  id: 123,
  title: "Specific Card Task",
  description: "Details here",
  columnId: "col-2",
};

// Mock tRPC
const mockQueryOptions = vi.fn();

vi.mock("~/trpc/client", () => ({
  useTRPC: () => ({
    card: {
      get: {
        queryOptions: mockQueryOptions,
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

describe("useCard", () => {
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();
    // Default mock implementation
    mockQueryOptions.mockImplementation((cardId, options) => ({
      queryKey: ["card", "get", cardId],
      queryFn: async () => (cardId === mockCard.id ? mockCard : null),
      ...options,
    }));
  });

  it("should fetch and return a specific card when cardId is provided", async () => {
    // Arrange
    const wrapper = createWrapper();
    const cardIdToFetch = mockCard.id;

    // Act
    const { result } = renderHook(() => useCard(cardIdToFetch), { wrapper });

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockCard);
    expect(mockQueryOptions).toHaveBeenCalledWith(
      cardIdToFetch,
      expect.objectContaining({ enabled: true }),
    );
  });

  it("should not fetch data and query should be disabled when cardId is null or undefined", () => {
    // Arrange
    const wrapper = createWrapper();

    // Act: Render with null cardId
    const { result: resultNull } = renderHook(() => useCard(null), { wrapper });
    // Act: Render with undefined cardId
    const { result: resultUndefined } = renderHook(() => useCard(undefined), {
      wrapper,
    });

    // Assert
    expect(resultNull.current.isFetching).toBe(false);
    expect(resultNull.current.isSuccess).toBe(false);
    expect(resultNull.current.data).toBeUndefined();
    // Check specific calls for null/undefined
    expect(mockQueryOptions).toHaveBeenCalledWith(
      null, // Expect null as first arg
      expect.objectContaining({ enabled: false }),
    );

    expect(resultUndefined.current.isFetching).toBe(false);
    expect(resultUndefined.current.isSuccess).toBe(false);
    expect(resultUndefined.current.data).toBeUndefined();
    expect(mockQueryOptions).toHaveBeenCalledWith(
      undefined, // Expect undefined as first arg
      expect.objectContaining({ enabled: false }),
    );
  });
});
