import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { useProjectHistoryPaginated } from "../use-project-history";

// Mock data
const mockProjectId = "project-123";
const mockLimit = 5;
const mockOffset = 10;
const mockPaginatedResult = {
  items: [
    {
      id: "hist-11",
      projectId: mockProjectId,
      entityType: "card",
      entityId: "card-5",
      action: "create",
      createdAt: new Date().toISOString(),
      user: {
        id: "user-1",
        name: "John Doe",
        image: "https://example.com/avatar.jpg",
      },
    },
    {
      id: "hist-12",
      projectId: mockProjectId,
      entityType: "column",
      entityId: "column-3",
      action: "update",
      createdAt: new Date().toISOString(),
      user: {
        id: "user-2",
        name: "Jane Smith",
        image: "https://example.com/avatar2.jpg",
      },
    },
  ],
  total: 25,
};

// Mock tRPC
const mockQueryOptions = vi.fn();

vi.mock("~/trpc/client", () => ({
  useTRPC: () => ({
    history: {
      getByProjectPaginated: {
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

describe("useProjectHistoryPaginated", () => {
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();

    // Default mock implementation
    mockQueryOptions.mockImplementation((params) => ({
      queryKey: [
        "history",
        "getByProjectPaginated",
        params.projectId,
        params.limit,
        params.offset,
      ],
      queryFn: async () => mockPaginatedResult,
    }));
  });

  it("should fetch paginated history for a project with custom limit and offset", async () => {
    // Arrange
    const wrapper = createWrapper();

    // Act
    const { result } = renderHook(
      () => useProjectHistoryPaginated(mockProjectId, mockLimit, mockOffset),
      { wrapper },
    );

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockPaginatedResult);
    expect(mockQueryOptions).toHaveBeenCalledWith({
      projectId: mockProjectId,
      limit: mockLimit,
      offset: mockOffset,
    });
  });

  it("should use default values for limit and offset", async () => {
    // Arrange
    const wrapper = createWrapper();

    // Act
    const { result } = renderHook(
      () => useProjectHistoryPaginated(mockProjectId),
      { wrapper },
    );

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockQueryOptions).toHaveBeenCalledWith({
      projectId: mockProjectId,
      limit: 10, // Default value
      offset: 0, // Default value
    });
  });

  it("should not fetch when projectId is undefined", () => {
    // Arrange
    const wrapper = createWrapper();

    // Act
    const { result } = renderHook(
      () => useProjectHistoryPaginated(undefined, mockLimit, mockOffset),
      { wrapper },
    );

    // Assert
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isFetching).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  it("should handle error states correctly", async () => {
    // Arrange
    const wrapper = createWrapper();
    const mockError = new Error("Failed to fetch paginated project history");

    // Setup mock to throw an error
    mockQueryOptions.mockImplementation(() => ({
      queryKey: [
        "history",
        "getByProjectPaginated",
        mockProjectId,
        mockLimit,
        mockOffset,
      ],
      queryFn: async () => {
        throw mockError;
      },
    }));

    // Act
    const { result } = renderHook(
      () => useProjectHistoryPaginated(mockProjectId, mockLimit, mockOffset),
      { wrapper },
    );

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
