import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { useAnalytics } from "../use-analytics";

// Mock data
const mockProgressData = { completed: 15, total: 30 };
const mockTrendData = [
  { date: "2023-01-01", count: 2 },
  { date: "2023-01-02", count: 3 },
];
const mockActivityData = [
  { userId: "user1", taskCount: 10, username: "John" },
  { userId: "user2", taskCount: 5, username: "Jane" },
];
const mockPriorityData = { high: 5, medium: 10, low: 15, none: 2 };
const mockDueDateData = [
  { date: "2023-02-01", count: 3 },
  { date: "2023-02-15", count: 7 },
];

// Mock tRPC
const mockProgressOptions = vi.fn();
const mockTrendOptions = vi.fn();
const mockActivityOptions = vi.fn();
const mockPriorityOptions = vi.fn();
const mockDueDateOptions = vi.fn();

vi.mock("~/trpc/client", () => ({
  useTRPC: () => ({
    analytics: {
      getProjectProgress: {
        queryOptions: mockProgressOptions,
      },
      getTaskCompletionTrend: {
        queryOptions: mockTrendOptions,
      },
      getUserActivity: {
        queryOptions: mockActivityOptions,
      },
      getPriorityDistribution: {
        queryOptions: mockPriorityOptions,
      },
      getTasksPerDueDate: {
        queryOptions: mockDueDateOptions,
      },
    },
  }),
}));

// Mock React Query's useQuery
const mockQueryResult = vi.fn();
vi.mock("@tanstack/react-query", async () => {
  const originalModule = await vi.importActual("@tanstack/react-query");
  return {
    ...originalModule,
    useQuery: () => mockQueryResult(),
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

describe("useAnalytics", () => {
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();

    // Default mock implementations
    mockProgressOptions.mockImplementation((params) => ({
      queryKey: [
        "analytics",
        "progress",
        params.projectId,
        params.startDate,
        params.endDate,
      ],
      queryFn: async () => mockProgressData,
    }));

    mockTrendOptions.mockImplementation((params) => ({
      queryKey: [
        "analytics",
        "trend",
        params.projectId,
        params.startDate,
        params.endDate,
      ],
      queryFn: async () => mockTrendData,
    }));

    mockActivityOptions.mockImplementation((params) => ({
      queryKey: [
        "analytics",
        "activity",
        params.projectId,
        params.startDate,
        params.endDate,
      ],
      queryFn: async () => mockActivityData,
    }));

    mockPriorityOptions.mockImplementation((params) => ({
      queryKey: [
        "analytics",
        "priority",
        params.projectId,
        params.startDate,
        params.endDate,
      ],
      queryFn: async () => mockPriorityData,
    }));

    mockDueDateOptions.mockImplementation((params) => ({
      queryKey: [
        "analytics",
        "dueDate",
        params.projectId,
        params.startDate,
        params.endDate,
      ],
      queryFn: async () => mockDueDateData,
    }));
  });

  it("should fetch and combine all analytics data when parameters are provided", async () => {
    // Setup mock for this test
    mockQueryResult.mockImplementation(() => ({
      data: undefined,
      isPending: false,
      isFetching: false,
      isError: false,
      isSuccess: true,
      error: null,
      refetch: vi.fn(),
    }));

    // For specific queries, return their corresponding data
    mockQueryResult
      .mockReturnValueOnce({
        data: mockProgressData,
        isSuccess: true,
        isPending: false,
        isError: false,
        refetch: vi.fn(),
      }) // progress
      .mockReturnValueOnce({
        data: mockTrendData,
        isSuccess: true,
        isPending: false,
        isError: false,
        refetch: vi.fn(),
      }) // trend
      .mockReturnValueOnce({
        data: mockActivityData,
        isSuccess: true,
        isPending: false,
        isError: false,
        refetch: vi.fn(),
      }) // activity
      .mockReturnValueOnce({
        data: mockPriorityData,
        isSuccess: true,
        isPending: false,
        isError: false,
        refetch: vi.fn(),
      }) // priorities
      .mockReturnValueOnce({
        data: mockDueDateData,
        isSuccess: true,
        isPending: false,
        isError: false,
        refetch: vi.fn(),
      }); // dueDates

    // Arrange
    const wrapper = createWrapper();
    const projectId = "project-123";
    const startDate = new Date("2023-01-01");
    const endDate = new Date("2023-12-31");

    // Act
    const { result } = renderHook(
      () => useAnalytics(projectId, startDate, endDate),
      { wrapper },
    );

    // Assert - ensure data is correctly assigned
    expect(result.current.progress.data).toEqual(mockProgressData);
    expect(result.current.trend.data).toEqual(mockTrendData);
    expect(result.current.activity.data).toEqual(mockActivityData);
    expect(result.current.priorities.data).toEqual(mockPriorityData);
    expect(result.current.dueDates.data).toEqual(mockDueDateData);

    // Verify query options were called with correct parameters
    const expectedParams = { projectId, startDate, endDate };
    expect(mockProgressOptions).toHaveBeenCalledWith(expectedParams);
    expect(mockTrendOptions).toHaveBeenCalledWith(expectedParams);
    expect(mockActivityOptions).toHaveBeenCalledWith(expectedParams);
    expect(mockPriorityOptions).toHaveBeenCalledWith(expectedParams);
    expect(mockDueDateOptions).toHaveBeenCalledWith(expectedParams);
  });

  it("should handle when some queries fail", async () => {
    // Arrange
    const mockError = new Error("Failed to fetch trend data");

    // Setup mocks for this test
    mockQueryResult
      .mockReturnValueOnce({
        data: mockProgressData,
        isSuccess: true,
        isPending: false,
        isError: false,
        refetch: vi.fn(),
      }) // progress
      .mockReturnValueOnce({
        data: undefined,
        isSuccess: false,
        isPending: false,
        isError: true,
        error: mockError,
        refetch: vi.fn(),
      }) // trend (fails)
      .mockReturnValueOnce({
        data: mockActivityData,
        isSuccess: true,
        isPending: false,
        isError: false,
        refetch: vi.fn(),
      }) // activity
      .mockReturnValueOnce({
        data: mockPriorityData,
        isSuccess: true,
        isPending: false,
        isError: false,
        refetch: vi.fn(),
      }) // priorities
      .mockReturnValueOnce({
        data: mockDueDateData,
        isSuccess: true,
        isPending: false,
        isError: false,
        refetch: vi.fn(),
      }); // dueDates

    const wrapper = createWrapper();
    const projectId = "project-123";
    const startDate = new Date("2023-01-01");
    const endDate = new Date("2023-12-31");

    // Act
    const { result } = renderHook(
      () => useAnalytics(projectId, startDate, endDate),
      { wrapper },
    );

    // Assert
    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBe(mockError);

    // Other data should still be available
    expect(result.current.progress.data).toEqual(mockProgressData);
    expect(result.current.trend.error).toBeDefined();
    expect(result.current.activity.data).toEqual(mockActivityData);
  });

  it("should call refetch on all queries when refetch is called", async () => {
    // Setup spy on refetch methods
    const refetchSpies = {
      progress: vi.fn().mockResolvedValue({}),
      trend: vi.fn().mockResolvedValue({}),
      activity: vi.fn().mockResolvedValue({}),
      priorities: vi.fn().mockResolvedValue({}),
      dueDates: vi.fn().mockResolvedValue({}),
    };

    // Setup mocks with spies
    mockQueryResult
      .mockReturnValueOnce({
        data: mockProgressData,
        isSuccess: true,
        isPending: false,
        isError: false,
        refetch: refetchSpies.progress,
      }) // progress
      .mockReturnValueOnce({
        data: mockTrendData,
        isSuccess: true,
        isPending: false,
        isError: false,
        refetch: refetchSpies.trend,
      }) // trend
      .mockReturnValueOnce({
        data: mockActivityData,
        isSuccess: true,
        isPending: false,
        isError: false,
        refetch: refetchSpies.activity,
      }) // activity
      .mockReturnValueOnce({
        data: mockPriorityData,
        isSuccess: true,
        isPending: false,
        isError: false,
        refetch: refetchSpies.priorities,
      }) // priorities
      .mockReturnValueOnce({
        data: mockDueDateData,
        isSuccess: true,
        isPending: false,
        isError: false,
        refetch: refetchSpies.dueDates,
      }); // dueDates

    // Arrange
    const wrapper = createWrapper();
    const projectId = "project-123";
    const startDate = new Date("2023-01-01");
    const endDate = new Date("2023-12-31");

    // Act
    const { result } = renderHook(
      () => useAnalytics(projectId, startDate, endDate),
      { wrapper },
    );

    // Call refetch
    act(() => {
      result.current.refetch();
    });

    // Assert - verify all refetch methods were called
    expect(refetchSpies.progress).toHaveBeenCalled();
    expect(refetchSpies.trend).toHaveBeenCalled();
    expect(refetchSpies.activity).toHaveBeenCalled();
    expect(refetchSpies.priorities).toHaveBeenCalled();
    expect(refetchSpies.dueDates).toHaveBeenCalled();
  });

  it("should work with optional date parameters", async () => {
    // Setup mocks for this test
    mockQueryResult
      .mockReturnValueOnce({
        data: mockProgressData,
        isSuccess: true,
        isPending: false,
        isError: false,
        refetch: vi.fn(),
      }) // progress
      .mockReturnValueOnce({
        data: mockTrendData,
        isSuccess: true,
        isPending: false,
        isError: false,
        refetch: vi.fn(),
      }) // trend
      .mockReturnValueOnce({
        data: mockActivityData,
        isSuccess: true,
        isPending: false,
        isError: false,
        refetch: vi.fn(),
      }) // activity
      .mockReturnValueOnce({
        data: mockPriorityData,
        isSuccess: true,
        isPending: false,
        isError: false,
        refetch: vi.fn(),
      }) // priorities
      .mockReturnValueOnce({
        data: mockDueDateData,
        isSuccess: true,
        isPending: false,
        isError: false,
        refetch: vi.fn(),
      }); // dueDates

    // Arrange
    const wrapper = createWrapper();
    const projectId = "project-123";
    // No start or end date provided

    // Act
    const { result } = renderHook(() => useAnalytics(projectId), { wrapper });

    // Verify query options were called with correct parameters (undefined dates)
    const expectedParams = {
      projectId,
      startDate: undefined,
      endDate: undefined,
    };
    expect(mockProgressOptions).toHaveBeenCalledWith(expectedParams);
    expect(mockTrendOptions).toHaveBeenCalledWith(expectedParams);
    expect(mockActivityOptions).toHaveBeenCalledWith(expectedParams);
    expect(mockPriorityOptions).toHaveBeenCalledWith(expectedParams);
    expect(mockDueDateOptions).toHaveBeenCalledWith(expectedParams);
  });
});
