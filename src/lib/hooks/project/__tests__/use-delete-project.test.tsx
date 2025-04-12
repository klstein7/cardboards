import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useDeleteProject } from "../use-delete-project";

// Mock tRPC client
const mockMutateAsync = vi.fn();
const mockInvalidateQueries = vi.fn();

vi.mock("~/trpc/client", () => ({
  useTRPC: () => ({
    project: {
      delete: {
        mutationOptions: (options: any) => ({
          mutationFn: mockMutateAsync,
          ...options,
        }),
      },
      list: {
        queryKey: () => ["projects", "list"], // Needed for invalidation key
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
  queryClient.invalidateQueries = mockInvalidateQueries;

  // eslint-disable-next-line react/display-name
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useDeleteProject", () => {
  it("should call delete mutation and invalidate list query on success", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useDeleteProject(), { wrapper });

    const projectIdToDelete = "proj-to-delete-1";

    // Mock mutation to resolve successfully (delete often returns void or null)
    mockMutateAsync.mockResolvedValue(undefined);

    // Call the mutation
    await result.current.mutateAsync(projectIdToDelete);

    expect(mockMutateAsync).toHaveBeenCalledWith(projectIdToDelete);
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Check list invalidation
    await waitFor(() => {
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["projects", "list"],
      });
    });
  });

  it("should handle mutation error", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useDeleteProject(), { wrapper });

    const error = new Error("Failed to delete");
    mockMutateAsync.mockRejectedValue(error);

    const projectIdToDelete = "proj-fail-delete";

    try {
      await result.current.mutateAsync(projectIdToDelete);
    } catch (e) {
      // Expected
    }

    expect(mockMutateAsync).toHaveBeenCalledWith(projectIdToDelete);
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(result.current.error).toBe(error);
    expect(mockInvalidateQueries).not.toHaveBeenCalled();
  });
});
