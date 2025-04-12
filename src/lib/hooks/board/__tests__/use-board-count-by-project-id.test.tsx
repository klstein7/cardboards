import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { useBoardCountByProjectId } from "../use-board-count-by-project-id";

// Mock data
const mockProjectId = "project-456";
const mockCount = 5;

// Mock tRPC
const mockQueryOptions = vi.fn();

vi.mock("~/trpc/client", () => ({
  useTRPC: () => ({
    board: {
      countByProjectId: {
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

describe("useBoardCountByProjectId", () => {
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();

    // Default mock implementation
    mockQueryOptions.mockImplementation((projectId) => ({
      queryKey: ["board", "countByProjectId", projectId],
      queryFn: async () => mockCount,
    }));
  });

  it("should fetch and return the board count for a project", async () => {
    // Arrange
    const wrapper = createWrapper();

    // Act
    const { result } = renderHook(
      () => useBoardCountByProjectId(mockProjectId),
      { wrapper },
    );

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockCount);
    expect(mockQueryOptions).toHaveBeenCalledWith(mockProjectId);
  });

  it("should handle error states correctly", async () => {
    // Arrange
    const wrapper = createWrapper();
    const mockError = new Error("Failed to fetch board count");

    // Setup mock to throw an error
    mockQueryOptions.mockImplementation(() => ({
      queryKey: ["board", "countByProjectId", mockProjectId],
      queryFn: async () => {
        throw mockError;
      },
    }));

    // Act
    const { result } = renderHook(
      () => useBoardCountByProjectId(mockProjectId),
      { wrapper },
    );

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
