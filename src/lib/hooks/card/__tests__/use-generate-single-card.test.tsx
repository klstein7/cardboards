import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { useGenerateSingleCard } from "../use-generate-single-card";

// Mock tRPC client and mutation function
const mockMutateAsync = vi.fn();

vi.mock("~/trpc/client", () => ({
  useTRPC: () => ({
    card: {
      generateSingle: {
        mutationOptions: () => ({
          mutationFn: mockMutateAsync,
        }),
      },
    },
  }),
}));

// Reusable wrapper
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

describe("useGenerateSingleCard", () => {
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();
  });

  it("should call generateSingle mutation and return the generated card on success", async () => {
    // Arrange
    const wrapper = createWrapper();
    const { result } = renderHook(() => useGenerateSingleCard(), { wrapper });

    const input = {
      boardId: "test-board-id",
      prompt: "Create a task for cleaning code",
      focusType: "task" as const,
      detailLevel: "Standard" as const,
    };

    const generatedResponse = {
      card: {
        title: "Clean code and refactor legacy components",
        description: "<p>Review and clean up old code...</p>",
        priority: "medium",
        labels: ["refactoring", "technical-debt"],
      },
    };

    mockMutateAsync.mockResolvedValue(generatedResponse);

    // Act
    await result.current.mutateAsync(input);

    // Assert
    expect(mockMutateAsync).toHaveBeenCalledWith(input);
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data).toEqual(generatedResponse);
  });

  it("should handle mutation error", async () => {
    // Arrange
    const wrapper = createWrapper();
    const { result } = renderHook(() => useGenerateSingleCard(), { wrapper });

    const error = new Error("Failed to generate card");
    mockMutateAsync.mockRejectedValue(error);

    const input = {
      boardId: "test-board-id",
      prompt: "Bad prompt",
    };

    // Act & Assert
    await expect(result.current.mutateAsync(input)).rejects.toThrow(error);

    // Assert
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(result.current.error).toBe(error);
  });
});
