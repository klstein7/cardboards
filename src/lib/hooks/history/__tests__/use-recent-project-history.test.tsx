import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useRecentProjectHistory } from "../use-recent-project-history";

const mockHistoryItems = [
  {
    id: "hist-1",
    projectId: "project-1",
    entityType: "card",
    action: "move",
    createdAt: new Date().toISOString(),
  },
];
const mockQueryOptions = vi.fn();

vi.mock("~/trpc/client", () => ({
  useTRPC: () => ({
    history: {
      getRecent: {
        queryOptions: mockQueryOptions,
      },
    },
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  // eslint-disable-next-line react/display-name
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useRecentProjectHistory", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockQueryOptions.mockImplementation(({ limit }) => ({
      queryKey: ["history", "getRecent", limit],
      queryFn: async () => mockHistoryItems,
    }));
  });

  it("should fetch recent project history with the requested limit", async () => {
    const { result } = renderHook(() => useRecentProjectHistory(25), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockHistoryItems);
    expect(mockQueryOptions).toHaveBeenCalledWith({ limit: 25 });
  });

  it("should default to forty recent history entries", async () => {
    const { result } = renderHook(() => useRecentProjectHistory(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockQueryOptions).toHaveBeenCalledWith({ limit: 40 });
  });
});
