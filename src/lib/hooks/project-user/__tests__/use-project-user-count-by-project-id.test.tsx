import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { useProjectUserCountByProjectId } from "../use-project-user-count-by-project-id";

// Mock data
const mockProjectId = "project-123";
const mockCount = 5;

// Mock tRPC
const mockQueryOptions = vi.fn();

vi.mock("~/trpc/client", () => ({
  useTRPC: () => ({
    projectUser: {
      countByProjectId: {
        queryOptions: mockQueryOptions,
        queryKey: (projectId: string) => [
          "projectUser",
          "countByProjectId",
          projectId,
        ],
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

describe("useProjectUserCountByProjectId", () => {
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();

    // Default mock implementation
    mockQueryOptions.mockImplementation((projectId) => ({
      queryKey: ["projectUser", "countByProjectId", projectId],
      queryFn: async () => mockCount,
    }));
  });

  it("should fetch project user count with the provided project ID", async () => {
    // Arrange
    const wrapper = createWrapper();

    // Act
    const { result } = renderHook(
      () => useProjectUserCountByProjectId(mockProjectId),
      {
        wrapper,
      },
    );

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockCount);
    expect(mockQueryOptions).toHaveBeenCalledWith(mockProjectId);
  });

  it("should handle error states correctly", async () => {
    // Arrange
    const wrapper = createWrapper();
    const mockError = new Error("Failed to fetch project user count");

    // Setup mock to throw an error
    mockQueryOptions.mockImplementation(() => ({
      queryKey: ["projectUser", "countByProjectId", mockProjectId],
      queryFn: async () => {
        throw mockError;
      },
    }));

    // Act
    const { result } = renderHook(
      () => useProjectUserCountByProjectId(mockProjectId),
      {
        wrapper,
      },
    );

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
