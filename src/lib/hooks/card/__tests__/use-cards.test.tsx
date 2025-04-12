import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import {
  describe,
  expect,
  it,
  vi,
  beforeEach,
  type Mock,
  type MockInstance,
} from "vitest";

// Import the actual hooks to spy on
import * as UtilsHooks from "../../utils";
import * as AssignedToHook from "../../utils/use-debounded-assigned-to";
import { useCards } from "../use-cards";

// Mock data
const mockCards = [
  {
    id: "card-1",
    columnId: "col-1",
    title: "Apple Task",
    description: "Buy apples",
    labels: ["groceries"],
    assignedToId: "user-a",
  },
  {
    id: "card-2",
    columnId: "col-1",
    title: "Banana Task",
    description: "Eat bananas",
    labels: ["food"],
    assignedToId: "user-b",
  },
  {
    id: "card-3",
    columnId: "col-1",
    title: "Carrot Task",
    description: "Find carrots",
    labels: ["groceries", "veg"],
    assignedToId: "user-a",
  },
];

// Mock tRPC
vi.mock("~/trpc/client", () => ({
  useTRPC: () => ({
    card: {
      list: {
        queryOptions: (columnId: string) => ({
          queryKey: ["cards", "list", columnId],
          queryFn: async () => mockCards.filter((c) => c.columnId === columnId),
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
        gcTime: Infinity, // Prevent garbage collection during tests
      },
    },
  });
  // eslint-disable-next-line react/display-name
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useCards", () => {
  // Declare spies with correct MockInstance types
  let spyUseDebouncedSearch: MockInstance<() => string>;
  let spyUseDebouncedLabels: MockInstance<() => string[]>;
  let spyUseDebouncedAssignedTo: MockInstance<() => string[]>;

  beforeEach(() => {
    // Reset any previous spies and mocks
    vi.restoreAllMocks();

    // Setup spies for the utility hooks
    spyUseDebouncedSearch = vi
      .spyOn(UtilsHooks, "useDebouncedSearch")
      .mockReturnValue(""); // Default value
    spyUseDebouncedLabels = vi
      .spyOn(UtilsHooks, "useDebouncedLabels")
      .mockReturnValue([]); // Default value
    spyUseDebouncedAssignedTo = vi
      .spyOn(AssignedToHook, "useDebouncedAssignedTo")
      .mockReturnValue([]); // Default value
  });

  it("should fetch and return cards for a column without filters", async () => {
    // Arrange
    const wrapper = createWrapper();

    // Act
    const { result } = renderHook(() => useCards("col-1"), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(result.current.data).toEqual(mockCards);
    expect(spyUseDebouncedSearch).toHaveBeenCalled(); // Check if spies were called
    expect(spyUseDebouncedLabels).toHaveBeenCalled();
    expect(spyUseDebouncedAssignedTo).toHaveBeenCalled();
  });

  it("should filter cards by search term", async () => {
    // Arrange
    spyUseDebouncedSearch.mockReturnValue("apple"); // Override spy return value
    const wrapper = createWrapper();

    // Act
    const { result } = renderHook(() => useCards("col-1"), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    await waitFor(() => {
      expect(result.current.data).toEqual([mockCards[0]]);
    });
  });

  it("should filter cards by labels", async () => {
    // Arrange
    spyUseDebouncedLabels.mockReturnValue(["groceries"]); // Override spy return value
    const wrapper = createWrapper();

    // Act
    const { result } = renderHook(() => useCards("col-1"), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    await waitFor(() => {
      expect(result.current.data).toEqual([mockCards[0], mockCards[2]]);
    });
  });

  it("should filter cards by assigned user", async () => {
    // Arrange
    spyUseDebouncedAssignedTo.mockReturnValue(["user-a"]); // Override spy return value
    const wrapper = createWrapper();

    // Act
    const { result } = renderHook(() => useCards("col-1"), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    await waitFor(() => {
      expect(result.current.data).toEqual([mockCards[0], mockCards[2]]);
    });
  });

  it("should filter cards by combined search and label filters", async () => {
    // Arrange
    spyUseDebouncedSearch.mockReturnValue("task"); // Override spy return value
    spyUseDebouncedLabels.mockReturnValue(["groceries"]); // Override spy return value
    const wrapper = createWrapper();

    // Act
    const { result } = renderHook(() => useCards("col-1"), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    await waitFor(() => {
      expect(result.current.data).toEqual([mockCards[0], mockCards[2]]);
    });
  });
});
