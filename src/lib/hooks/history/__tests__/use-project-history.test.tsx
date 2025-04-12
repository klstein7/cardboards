import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { useProjectHistory } from "../use-project-history";

// Mock data
const mockProjectId = "project-123";
const mockHistoryItems = [
  {
    id: "hist-1",
    projectId: mockProjectId,
    entityType: "card",
    entityId: "card-1",
    action: "create",
    createdAt: new Date().toISOString(),
    user: {
      id: "user-1",
      name: "John Doe",
      image: "https://example.com/avatar.jpg",
    },
  },
  {
    id: "hist-2",
    projectId: mockProjectId,
    entityType: "column",
    entityId: "column-1",
    action: "update",
    createdAt: new Date().toISOString(),
    user: {
      id: "user-2",
      name: "Jane Smith",
      image: "https://example.com/avatar2.jpg",
    },
  },
];

// Mock tRPC
const mockQueryOptions = vi.fn();

vi.mock("~/trpc/client", () => ({
  useTRPC: () => ({
    history: {
      getByProject: {
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

describe("useProjectHistory", () => {
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();

    // Default mock implementation
    mockQueryOptions.mockImplementation((params) => ({
      queryKey: ["history", "getByProject", params.projectId],
      queryFn: async () => mockHistoryItems,
    }));
  });

  it("should fetch history for a project", async () => {
    // Arrange
    const wrapper = createWrapper();

    // Act
    const { result } = renderHook(() => useProjectHistory(mockProjectId), {
      wrapper,
    });

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockHistoryItems);
    expect(mockQueryOptions).toHaveBeenCalledWith({ projectId: mockProjectId });
  });

  it("should not fetch when projectId is undefined", () => {
    // Arrange
    const wrapper = createWrapper();

    // Act
    const { result } = renderHook(() => useProjectHistory(undefined), {
      wrapper,
    });

    // Assert
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isFetching).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  it("should handle error states correctly", async () => {
    // Arrange
    const wrapper = createWrapper();
    const mockError = new Error("Failed to fetch project history");

    // Setup mock to throw an error
    mockQueryOptions.mockImplementation(() => ({
      queryKey: ["history", "getByProject", mockProjectId],
      queryFn: async () => {
        throw mockError;
      },
    }));

    // Act
    const { result } = renderHook(() => useProjectHistory(mockProjectId), {
      wrapper,
    });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
