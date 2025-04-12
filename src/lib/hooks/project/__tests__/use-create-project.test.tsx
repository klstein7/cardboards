import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useCreateProject } from "../use-create-project";

// Mock tRPC client and specifically the mutation function
const mockMutateAsync = vi.fn();
const mockInvalidateQueries = vi.fn();

vi.mock("~/trpc/client", () => ({
  useTRPC: () => ({
    project: {
      create: {
        // Provide the mock mutate function
        mutationOptions: (options: any) => ({
          mutationFn: mockMutateAsync,
          ...options, // Preserve onSuccess etc.
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
  // Mock invalidateQueries on the specific client instance
  queryClient.invalidateQueries = mockInvalidateQueries;

  // eslint-disable-next-line react/display-name
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useCreateProject", () => {
  it("should call the create mutation and invalidate queries on success", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useCreateProject(), { wrapper });

    const newProjectData = { name: "New Test Project", description: "Desc" };
    const createdProject = { id: "new-proj-1", ...newProjectData };

    // Mock the mutation to resolve successfully
    mockMutateAsync.mockResolvedValue(createdProject);

    // Call the mutation
    await result.current.mutateAsync(newProjectData);

    // Assertions
    expect(mockMutateAsync).toHaveBeenCalledWith(newProjectData);
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data).toEqual(createdProject);

    // Check if invalidateQueries was called correctly
    await waitFor(() => {
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["projects", "list"],
      });
    });
  });

  it("should handle mutation error", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useCreateProject(), { wrapper });

    const error = new Error("Failed to create");
    mockMutateAsync.mockRejectedValue(error); // Mock mutation to fail

    try {
      await result.current.mutateAsync({
        name: "Fail Project",
      });
    } catch (e) {
      // Expected error
    }

    // Assert
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(result.current.error).toBe(error);
    expect(mockInvalidateQueries).not.toHaveBeenCalled(); // Invalidation shouldn't happen on error
  });
});
