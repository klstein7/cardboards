import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { useCardCountByProjectId } from "../use-card-count-by-project-id";

// Mock tRPC
const mockCountQuery = vi.fn().mockResolvedValue(25); // Default mock count

vi.mock("~/trpc/client", () => ({
  useTRPC: () => ({
    card: {
      countByProjectId: {
        queryOptions: (projectId: string) => ({
          queryKey: ["card", "countByProjectId", projectId],
          queryFn: () => mockCountQuery(projectId),
        }),
      },
    },
  }),
}));

// Helper to create QueryClient and Provider
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useCardCountByProjectId", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockCountQuery.mockResolvedValue(25); // Reset to default
  });

  it("should fetch and return the card count for a given projectId", async () => {
    // Arrange
    const projectId = "proj-123";
    const expectedCount = 50;
    mockCountQuery.mockResolvedValue(expectedCount);
    const wrapper = createWrapper();

    // Act
    const { result } = renderHook(() => useCardCountByProjectId(projectId), {
      wrapper,
    });

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(expectedCount);
    expect(mockCountQuery).toHaveBeenCalledWith(projectId);
  });

  it("should handle query error", async () => {
    // Arrange
    const projectId = "proj-456";
    const error = new Error("Failed to fetch project count");
    mockCountQuery.mockRejectedValue(error);
    const wrapper = createWrapper();

    // Act
    const { result } = renderHook(() => useCardCountByProjectId(projectId), {
      wrapper,
    });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
  });
});
