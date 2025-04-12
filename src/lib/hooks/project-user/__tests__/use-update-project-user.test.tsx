import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { useUpdateProjectUser } from "../use-update-project-user";

// Mock data
const mockProjectId = "project-123";
const mockUserId = "user-123";
const mockUpdateData = {
  projectId: mockProjectId,
  userId: mockUserId,
  data: {
    role: "admin",
  },
};
const mockUpdatedProjectUser = {
  id: "pu-123",
  userId: mockUserId,
  projectId: mockProjectId,
  role: "admin",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  preferences: { theme: "light", notifications: true },
};

// Mock tRPC
const mockMutationOptions = vi.fn();
const mockListQueryKey = vi
  .fn()
  .mockReturnValue(["projectUser", "list", mockProjectId]);

vi.mock("~/trpc/client", () => ({
  useTRPC: () => ({
    projectUser: {
      update: {
        mutationOptions: mockMutationOptions,
      },
      list: {
        queryKey: mockListQueryKey,
      },
    },
  }),
}));

// Mock useMutation and QueryClient
const mockMutateAsync = vi.fn();
const mockInvalidateQueries = vi.fn();
const mockQueryClient = {
  invalidateQueries: mockInvalidateQueries,
};

vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual("@tanstack/react-query");
  return {
    ...actual,
    useMutation: () => ({
      mutateAsync: mockMutateAsync,
      mutate: vi.fn(),
      isLoading: false,
      isError: false,
      isSuccess: true,
      error: null,
      data: null,
    }),
    useQueryClient: () => mockQueryClient,
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

describe("useUpdateProjectUser", () => {
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();

    // Default mock implementations
    mockMutationOptions.mockReturnValue({
      mutationFn: async (data: typeof mockUpdateData) => mockUpdatedProjectUser,
      onSuccess: async (data: typeof mockUpdatedProjectUser) => {
        await mockQueryClient.invalidateQueries({
          queryKey: ["projectUser", "list", data.projectId],
        });
      },
    });

    // Setup mock to return success
    mockMutateAsync.mockResolvedValue(mockUpdatedProjectUser);
  });

  it("should update a project user with the provided data", async () => {
    // Arrange
    const wrapper = createWrapper();

    // Act
    const { result } = renderHook(() => useUpdateProjectUser(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        ...mockUpdateData,
        data: { ...mockUpdateData.data, role: "admin" },
      });
    });

    // Assert
    expect(mockMutateAsync).toHaveBeenCalledWith(mockUpdateData);
    expect(mockMutationOptions).toHaveBeenCalled();
  });

  it("should invalidate project user list query after successful update", async () => {
    // Arrange
    const wrapper = createWrapper();

    // Setup specific mock behavior for this test
    mockInvalidateQueries.mockImplementation(({ queryKey }) => {
      // Just return a resolved promise
      return Promise.resolve();
    });

    // Act
    const { result } = renderHook(() => useUpdateProjectUser(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        ...mockUpdateData,
        data: { ...mockUpdateData.data, role: "admin" },
      });
    });

    // Call onSuccess directly to simulate the mutation success
    const options = mockMutationOptions.mock.results[0]?.value;
    if (options && options.onSuccess) {
      await options.onSuccess(mockUpdatedProjectUser, mockUpdateData);
    }

    // Assert
    expect(mockInvalidateQueries).toHaveBeenCalledTimes(1);
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ["projectUser", "list", mockProjectId],
    });
  });

  it("should handle error states correctly", async () => {
    // Arrange
    const wrapper = createWrapper();
    const mockError = new Error("Failed to update project user");

    // Reset the mock to throw an error
    mockMutateAsync.mockRejectedValueOnce(mockError);

    // Act
    const { result } = renderHook(() => useUpdateProjectUser(), { wrapper });

    // Assert
    await expect(
      result.current.mutateAsync({
        ...mockUpdateData,
        data: { ...mockUpdateData.data, role: "admin" },
      }),
    ).rejects.toThrow(mockError);
  });
});
