import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { useCreateInvitation } from "../use-create-invitation";

// Mock data
const mockProjectId = "project-123";

const mockCreatedInvitation = {
  id: "inv-456",
  projectId: mockProjectId,
  invitedById: "user-789",
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  status: "PENDING",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Mock tRPC
const mockMutationOptions = vi.fn();

vi.mock("~/trpc/client", () => ({
  useTRPC: () => ({
    invitation: {
      create: {
        mutationOptions: mockMutationOptions,
      },
    },
  }),
}));

// Mock useMutation
const mockMutateAsync = vi.fn();

vi.mock("@tanstack/react-query", async () => {
  const originalModule = await vi.importActual("@tanstack/react-query");
  return {
    ...originalModule,
    useMutation: () => ({
      mutateAsync: mockMutateAsync,
      mutate: vi.fn(),
      isLoading: false,
      isError: false,
      isSuccess: true,
      error: null,
    }),
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

describe("useCreateInvitation", () => {
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();

    // Default mock implementations
    mockMutationOptions.mockImplementation(() => ({
      mutationFn: async (data: string) => {
        return mockCreatedInvitation;
      },
    }));

    // Setup mock to return created invitation
    mockMutateAsync.mockResolvedValue(mockCreatedInvitation);
  });

  it("should create an invitation when called with a valid project ID", async () => {
    // Arrange
    const wrapper = createWrapper();

    // Act
    const { result } = renderHook(() => useCreateInvitation(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync(mockProjectId);
    });

    // Assert
    expect(mockMutateAsync).toHaveBeenCalledWith(mockProjectId);
    expect(mockMutationOptions).toHaveBeenCalled();
  });

  it("should handle error states correctly", async () => {
    // Arrange
    const wrapper = createWrapper();
    const mockError = new Error("Failed to create invitation");

    // Setup mock to throw an error
    mockMutateAsync.mockRejectedValue(mockError);

    // Act
    const { result } = renderHook(() => useCreateInvitation(), { wrapper });

    // Assert
    await expect(result.current.mutateAsync(mockProjectId)).rejects.toThrow(
      mockError,
    );
  });
});
