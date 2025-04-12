import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { useNotifications } from "../use-notifications";
import { type NotificationFilter } from "~/server/zod";

// Mock data
const mockNotifications = [
  {
    id: "notif-1",
    userId: "user-123",
    projectId: "project-123",
    type: "mention",
    entityId: "card-123",
    entityType: "card",
    isRead: false,
    title: "You were mentioned",
    content: "You were mentioned in a card",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "notif-2",
    userId: "user-123",
    projectId: "project-123",
    type: "comment",
    entityId: "card-456",
    entityType: "card",
    isRead: true,
    title: "New comment",
    content: "A new comment was added",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock filter
const mockFilter: Partial<NotificationFilter> = {
  isRead: false,
  type: "mention",
};

// Mock tRPC
const mockQueryOptions = vi.fn();

vi.mock("~/trpc/client", () => ({
  useTRPC: () => ({
    notification: {
      getCurrentUserNotifications: {
        queryOptions: mockQueryOptions,
        queryKey: (filter?: any) => [
          "notification",
          "getCurrentUserNotifications",
          filter,
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

describe("useNotifications", () => {
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();

    // Default mock implementation
    mockQueryOptions.mockImplementation((filter) => ({
      queryKey: ["notification", "getCurrentUserNotifications", filter],
      queryFn: async () => mockNotifications,
    }));
  });

  it("should fetch notifications without a filter", async () => {
    // Arrange
    const wrapper = createWrapper();

    // Act
    const { result } = renderHook(() => useNotifications(), {
      wrapper,
    });

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockNotifications);
    expect(mockQueryOptions).toHaveBeenCalledWith(undefined);
  });

  it("should fetch notifications with a filter", async () => {
    // Arrange
    const wrapper = createWrapper();

    // Act
    const { result } = renderHook(() => useNotifications(mockFilter), {
      wrapper,
    });

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockNotifications);
    expect(mockQueryOptions).toHaveBeenCalledWith(mockFilter);
  });

  it("should handle error states correctly", async () => {
    // Arrange
    const wrapper = createWrapper();
    const mockError = new Error("Failed to fetch notifications");

    // Setup mock to throw an error
    mockQueryOptions.mockImplementation(() => ({
      queryKey: ["notification", "getCurrentUserNotifications", undefined],
      queryFn: async () => {
        throw mockError;
      },
    }));

    // Act
    const { result } = renderHook(() => useNotifications(), {
      wrapper,
    });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
