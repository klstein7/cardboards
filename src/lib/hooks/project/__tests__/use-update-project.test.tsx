import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useUpdateProject } from "../use-update-project";

// Mock tRPC client
const mockMutateAsync = vi.fn();
const mockInvalidateQueries = vi.fn();

vi.mock("~/trpc/client", () => ({
  useTRPC: () => ({
    project: {
      update: {
        mutationOptions: (options: any) => ({
          mutationFn: mockMutateAsync,
          ...options,
        }),
      },
      // Mock query keys needed for invalidation
      get: {
        queryKey: (id: string) => ["projects", "get", id],
      },
      list: {
        queryKey: () => ["projects", "list"],
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

describe("useUpdateProject", () => {
  it("should call update mutation and invalidate relevant queries on success", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useUpdateProject(), { wrapper });

    const updateData = { projectId: "proj-1", data: { name: "Updated Name" } };
    const updatedProject = {
      id: "proj-1",
      name: "Updated Name",
      description: "... ",
    };

    mockMutateAsync.mockResolvedValue(updatedProject);

    await result.current.mutateAsync(updateData);

    expect(mockMutateAsync).toHaveBeenCalledWith(updateData);

    // Check invalidations
    await waitFor(() => {
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["projects", "get", "proj-1"], // Invalidate specific project
      });
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["projects", "list"], // Invalidate list
      });
    });

    // Assert: Hook state
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data).toEqual(updatedProject);
  });

  it("should handle mutation error", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useUpdateProject(), { wrapper });

    const error = new Error("Failed to update");
    mockMutateAsync.mockRejectedValue(error);

    try {
      await result.current.mutateAsync({
        projectId: "proj-fail",
        data: { name: "Fail Update" },
      });
    } catch (e) {
      // Expected
    }

    // Assert: Hook state
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(result.current.error).toBe(error);
    expect(mockInvalidateQueries).not.toHaveBeenCalled();
  });
});
