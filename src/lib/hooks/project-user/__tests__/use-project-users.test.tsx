import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { useProjectUsers } from "../use-project-users";

// Mock data
const mockProjectId = "project-123";
const mockProjectUsers = [
  {
    id: "pu-123",
    userId: "user-123",
    projectId: mockProjectId,
    role: "ADMIN",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    preferences: { theme: "light", notifications: true },
    user: {
      id: "user-123",
      name: "Alice Smith",
      email: "alice@example.com",
      image: "https://example.com/alice.jpg",
    },
  },
  {
    id: "pu-456",
    userId: "user-456",
    projectId: mockProjectId,
    role: "MEMBER",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    preferences: { theme: "dark", notifications: false },
    user: {
      id: "user-456",
      name: "Bob Johnson",
      email: "bob@example.com",
      image: "https://example.com/bob.jpg",
    },
  },
];

// Mock tRPC
const mockQueryOptions = vi.fn();

vi.mock("~/trpc/client", () => ({
  useTRPC: () => ({
    projectUser: {
      list: {
        queryOptions: mockQueryOptions,
        queryKey: (projectId: string) => ["projectUser", "list", projectId],
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

describe("useProjectUsers", () => {
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();

    // Default mock implementation
    mockQueryOptions.mockImplementation((projectId) => ({
      queryKey: ["projectUser", "list", projectId],
      queryFn: async () => mockProjectUsers,
    }));
  });

  it("should fetch project users with the provided project ID", async () => {
    // Arrange
    const wrapper = createWrapper();

    // Act
    const { result } = renderHook(() => useProjectUsers(mockProjectId), {
      wrapper,
    });

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockProjectUsers);
    expect(mockQueryOptions).toHaveBeenCalledWith(mockProjectId);
  });

  it("should handle error states correctly", async () => {
    // Arrange
    const wrapper = createWrapper();
    const mockError = new Error("Failed to fetch project users");

    // Setup mock to throw an error
    mockQueryOptions.mockImplementation(() => ({
      queryKey: ["projectUser", "list", mockProjectId],
      queryFn: async () => {
        throw mockError;
      },
    }));

    // Act
    const { result } = renderHook(() => useProjectUsers(mockProjectId), {
      wrapper,
    });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
