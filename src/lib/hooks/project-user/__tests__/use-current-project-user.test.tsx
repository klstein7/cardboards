import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { useCurrentProjectUser } from "../use-current-project-user";

// Mock data
const mockProjectId = "project-123";
const mockProjectUser = {
  id: "pu-123",
  userId: "user-123",
  projectId: mockProjectId,
  role: "ADMIN",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  preferences: { theme: "light", notifications: true },
};

// Mock hooks and variables
vi.mock("../utils", () => ({
  useStrictCurrentProjectId: () => mockProjectId,
}));

// Mock tRPC
const mockQueryOptions = vi.fn();
const mockQueryKey = vi
  .fn()
  .mockReturnValue(["projectUser", "getCurrentProjectUser", mockProjectId]);

vi.mock("~/trpc/client", () => ({
  useTRPC: () => ({
    projectUser: {
      getCurrentProjectUser: {
        queryOptions: mockQueryOptions,
        queryKey: mockQueryKey,
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

describe("useCurrentProjectUser", () => {
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();

    // Default mock implementation that returns data regardless of input
    mockQueryOptions.mockReturnValue({
      queryKey: ["projectUser", "getCurrentProjectUser", mockProjectId],
      queryFn: async () => mockProjectUser,
    });
  });

  it("should fetch the current project user", async () => {
    // Arrange
    const wrapper = createWrapper();

    // Act
    const { result } = renderHook(() => useCurrentProjectUser(), {
      wrapper,
    });

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockProjectUser);
    expect(mockQueryOptions).toHaveBeenCalled(); // Just check it was called, not with what
  });

  it("should handle error states correctly", async () => {
    // Arrange
    const wrapper = createWrapper();
    const mockError = new Error("Failed to fetch current project user");

    // Override the mock for this test
    mockQueryOptions.mockReturnValue({
      queryKey: ["projectUser", "getCurrentProjectUser", mockProjectId],
      queryFn: async () => {
        throw mockError;
      },
    });

    // Act
    const { result } = renderHook(() => useCurrentProjectUser(), {
      wrapper,
    });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
