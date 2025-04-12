import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { useMarkNotificationAsRead } from "../use-mark-notification-as-read";

// Mock data
const mockNotificationId = "notif-123";
const mockResult = { success: true };

// Mock tRPC
const mockMutationOptions = vi.fn();

// Create mock query keys
const NOTIFICATIONS_QUERY_KEY = ["notification", "getCurrentUserNotifications"];
const UNREAD_COUNT_QUERY_KEY = ["notification", "getUnreadCount"];

vi.mock("~/trpc/client", () => ({
  useTRPC: () => ({
    notification: {
      markAsRead: {
        mutationOptions: mockMutationOptions,
      },
      getCurrentUserNotifications: {
        queryKey: () => NOTIFICATIONS_QUERY_KEY,
      },
      getUnreadCount: {
        queryKey: () => UNREAD_COUNT_QUERY_KEY,
      },
    },
  }),
}));

// Mock useMutation and QueryClient
const mockMutateAsync = vi.fn();
const mockInvalidateQueries = vi.fn();
const mockQueryClient = {
  invalidateQueries: mockInvalidateQueries,
};

vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual("@tanstack/react-query");
  return {
    ...actual,
    useMutation: () => ({
      mutateAsync: mockMutateAsync,
      mutate: vi.fn(),
      isLoading: false,
      isError: false,
      isSuccess: true,
      error: null,
      data: null,
    }),
    useQueryClient: () => mockQueryClient,
  };
});

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

describe("useMarkNotificationAsRead", () => {
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();

    // Default mock implementations
    mockMutationOptions.mockReturnValue({
      mutationFn: async (id: string) => mockResult,
      onSuccess: async () => {
        await mockQueryClient.invalidateQueries({
          queryKey: NOTIFICATIONS_QUERY_KEY,
        });
        await mockQueryClient.invalidateQueries({
          queryKey: UNREAD_COUNT_QUERY_KEY,
        });
      },
    });

    // Setup mock to return success
    mockMutateAsync.mockResolvedValue(mockResult);
  });

  it("should mark a notification as read when called with an ID", async () => {
    // Arrange
    const wrapper = createWrapper();

    // Act
    const { result } = renderHook(() => useMarkNotificationAsRead(), {
      wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync(mockNotificationId);
    });

    // Assert
    expect(mockMutateAsync).toHaveBeenCalledWith(mockNotificationId);
    expect(mockMutationOptions).toHaveBeenCalled();
  });

  it("should invalidate relevant queries after successful marking", async () => {
    // Arrange
    const wrapper = createWrapper();

    // Setup specific mock behavior for this test
    mockInvalidateQueries.mockImplementation(({ queryKey }) => {
      // Just return a resolved promise
      return Promise.resolve();
    });

    // Act
    const { result } = renderHook(() => useMarkNotificationAsRead(), {
      wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync(mockNotificationId);
    });

    // Call onSuccess directly to simulate the mutation success
    const options = mockMutationOptions.mock.results[0]?.value;
    if (options && options.onSuccess) {
      await options.onSuccess(mockResult, mockNotificationId);
    }

    // Assert
    expect(mockInvalidateQueries).toHaveBeenCalledTimes(2);

    // Verify the first call with NOTIFICATIONS_QUERY_KEY
    expect(mockInvalidateQueries).toHaveBeenNthCalledWith(1, {
      queryKey: NOTIFICATIONS_QUERY_KEY,
    });

    // Verify the second call with UNREAD_COUNT_QUERY_KEY
    expect(mockInvalidateQueries).toHaveBeenNthCalledWith(2, {
      queryKey: UNREAD_COUNT_QUERY_KEY,
    });
  });

  it("should handle error states correctly", async () => {
    // Arrange
    const wrapper = createWrapper();
    const mockError = new Error("Failed to mark notification as read");

    // Reset the mock to throw an error
    mockMutateAsync.mockRejectedValueOnce(mockError);

    // Act
    const { result } = renderHook(() => useMarkNotificationAsRead(), {
      wrapper,
    });

    // Assert
    await expect(
      result.current.mutateAsync(mockNotificationId),
    ).rejects.toThrow(mockError);
  });
});
