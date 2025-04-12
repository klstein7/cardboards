import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { useTasksPerDueDate } from "../use-tasks-per-due-date";

// Mock data
const mockDueDateData = [
  { date: "2023-01-15", count: 3 },
  { date: "2023-02-01", count: 5 },
  { date: "2023-02-15", count: 2 },
];

// Mock tRPC
const mockQueryOptions = vi.fn();

vi.mock("~/trpc/client", () => ({
  useTRPC: () => ({
    analytics: {
      getTasksPerDueDate: {
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

describe("useTasksPerDueDate", () => {
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();

    // Default mock implementation
    mockQueryOptions.mockImplementation((params) => ({
      queryKey: [
        "analytics",
        "tasksPerDueDate",
        params.projectId,
        params.startDate,
        params.endDate,
      ],
      queryFn: async () => mockDueDateData,
    }));
  });

  it("should fetch and return tasks per due date data when parameters are provided", async () => {
    // Arrange
    const wrapper = createWrapper();
    const projectId = "project-123";
    const startDate = new Date("2023-01-01");
    const endDate = new Date("2023-12-31");

    // Act
    const { result } = renderHook(
      () => useTasksPerDueDate(projectId, startDate, endDate),
      { wrapper },
    );

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockDueDateData);
    expect(mockQueryOptions).toHaveBeenCalledWith({
      projectId,
      startDate,
      endDate,
    });
  });

  it("should handle error states correctly", async () => {
    // Arrange
    const wrapper = createWrapper();
    const projectId = "project-123";
    const startDate = new Date("2023-01-01");
    const endDate = new Date("2023-12-31");
    const mockError = new Error("Failed to fetch tasks per due date");

    // Setup mock to throw an error
    mockQueryOptions.mockImplementation(() => ({
      queryKey: ["analytics", "tasksPerDueDate", projectId, startDate, endDate],
      queryFn: async () => {
        throw mockError;
      },
    }));

    // Act
    const { result } = renderHook(
      () => useTasksPerDueDate(projectId, startDate, endDate),
      { wrapper },
    );

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
