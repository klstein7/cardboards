import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { useInvitation } from "../use-invitation";

// Mock data
const mockInvitationId = "inv-123";
const mockInvitation = {
  id: mockInvitationId,
  email: "user@example.com",
  projectId: "project-123",
  status: "PENDING",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  project: {
    id: "project-123",
    name: "Test Project",
  },
};

// Mock tRPC
const mockQueryOptions = vi.fn();

vi.mock("~/trpc/client", () => ({
  useTRPC: () => ({
    invitation: {
      get: {
        queryOptions: mockQueryOptions,
        queryKey: (id: string) => ["invitation", "get", id],
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

describe("useInvitation", () => {
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();

    // Default mock implementation
    mockQueryOptions.mockImplementation((invitationId) => ({
      queryKey: ["invitation", "get", invitationId],
      queryFn: async () => mockInvitation,
    }));
  });

  it("should fetch an invitation by ID", async () => {
    // Arrange
    const wrapper = createWrapper();

    // Act
    const { result } = renderHook(() => useInvitation(mockInvitationId), {
      wrapper,
    });

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockInvitation);
    expect(mockQueryOptions).toHaveBeenCalledWith(mockInvitationId);
  });

  it("should handle error states correctly", async () => {
    // Arrange
    const wrapper = createWrapper();
    const mockError = new Error("Failed to fetch invitation");

    // Setup mock to throw an error
    mockQueryOptions.mockImplementation(() => ({
      queryKey: ["invitation", "get", mockInvitationId],
      queryFn: async () => {
        throw mockError;
      },
    }));

    // Act
    const { result } = renderHook(() => useInvitation(mockInvitationId), {
      wrapper,
    });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
