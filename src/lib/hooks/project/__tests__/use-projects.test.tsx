import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useProjects } from "../use-projects";

// Mock the tRPC client
vi.mock("~/trpc/client", () => ({
  useTRPC: () => ({
    project: {
      list: {
        queryOptions: () => ({
          queryKey: ["projects", "list"],
          queryFn: async () => [
            { id: "proj_1", name: "Project 1" },
            { id: "proj_2", name: "Project 2" },
          ], // Mock data
        }),
      },
    },
  }),
}));

// Helper component to wrap with QueryClientProvider
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries for tests
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useProjects", () => {
  it("should return a list of projects", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useProjects(), { wrapper });

    // Wait for the query to fetch data
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert the data is correct
    expect(result.current.data).toEqual([
      { id: "proj_1", name: "Project 1" },
      { id: "proj_2", name: "Project 2" },
    ]);
  });
});
