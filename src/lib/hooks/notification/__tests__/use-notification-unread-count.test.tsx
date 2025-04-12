import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { useNotificationUnreadCount } from "../use-notification-unread-count";

// Mock data
const mockUnreadCount = 5;

// Mock tRPC
const mockQueryOptions = vi.fn();

vi.mock("~/trpc/client", () => ({
  useTRPC: () => ({
    notification: {
      getUnreadCount: {
        queryOptions: mockQueryOptions,
        queryKey: () => ["notification", "getUnreadCount"],
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

describe("useNotificationUnreadCount", () => {
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();

    // Default mock implementation
    mockQueryOptions.mockImplementation(() => ({
      queryKey: ["notification", "getUnreadCount"],
      queryFn: async () => mockUnreadCount,
    }));
  });

  it("should fetch the unread notification count", async () => {
    // Arrange
    const wrapper = createWrapper();

    // Act
    const { result } = renderHook(() => useNotificationUnreadCount(), {
      wrapper,
    });

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockUnreadCount);
    expect(mockQueryOptions).toHaveBeenCalled();
  });

  it("should handle error states correctly", async () => {
    // Arrange
    const wrapper = createWrapper();
    const mockError = new Error("Failed to fetch unread count");

    // Setup mock to throw an error
    mockQueryOptions.mockImplementation(() => ({
      queryKey: ["notification", "getUnreadCount"],
      queryFn: async () => {
        throw mockError;
      },
    }));

    // Act
    const { result } = renderHook(() => useNotificationUnreadCount(), {
      wrapper,
    });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
