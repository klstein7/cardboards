import { describe, it, expect, vi, beforeEach } from "vitest";
import { auth } from "@clerk/nextjs/server";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { TRPCError } from "@trpc/server";

// Mock react's cache function
vi.mock("react", async (importOriginal) => {
  const actualReact = await importOriginal<typeof import("react")>();
  return {
    ...actualReact,
    cache: vi.fn((fn) => fn),
  };
});

import { type AppRouter, appRouter } from "~/server/api/routers";
import { services } from "~/server/services/container";

// Mock Clerk auth
vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

// Mock the specific services used by the analytics router
vi.mock("~/server/services/container", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("~/server/services/container")>();
  return {
    ...original,
    services: {
      ...original.services,
      // Ensure other services are spread if they exist in the original mock
      analyticsService: {
        getProjectProgress: vi.fn(),
        getTaskCompletionTrend: vi.fn(),
        getUserActivity: vi.fn(),
        getPriorityDistribution: vi.fn(),
        getTasksPerDueDate: vi.fn(),
      },
      authService: {
        canAccessProject: vi.fn(),
        // Mock other authService methods used elsewhere if needed
        // This ensures tests for other routers don't break if they rely on authService mocks
        canAccessBoard: vi.fn(),
        requireProjectAdmin: vi.fn(),
      },
    },
  };
});

describe("Analytics Router", () => {
  const mockUserId = "user-test-analytics-123";
  let caller: ReturnType<typeof appRouter.createCaller>;

  type RouterInput = inferRouterInputs<AppRouter>;
  type RouterOutput = inferRouterOutputs<AppRouter>;

  // Shared input data structure for most analytics procedures
  const mockInputBase = {
    projectId: "proj-analytics-1",
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-01-31"),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Setup authenticated user context
    vi.mocked(auth).mockReturnValue({ userId: mockUserId } as any);
    const ctx = { userId: mockUserId };
    caller = appRouter.createCaller(ctx);

    // Default successful auth mock for most tests
    vi.mocked(services.authService.canAccessProject).mockResolvedValue(
      {} as any,
    );
  });

  // --- Test Suites for each procedure ---

  // 1. getProjectProgress
  describe("analytics.getProjectProgress", () => {
    it("should get project progress after verifying project access", async () => {
      // Arrange
      const input: RouterInput["analytics"]["getProjectProgress"] =
        mockInputBase;
      const mockProgressData: RouterOutput["analytics"]["getProjectProgress"] =
        [
          { name: "Board Alpha", value: 75 },
          { name: "Board Beta", value: 40 },
        ];
      vi.mocked(services.analyticsService.getProjectProgress).mockResolvedValue(
        mockProgressData,
      );

      // Act
      const result = await caller.analytics.getProjectProgress(input);

      // Assert
      expect(result).toEqual(mockProgressData);
      expect(services.authService.canAccessProject).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessProject).toHaveBeenCalledWith(
        input.projectId,
      );
      expect(
        services.analyticsService.getProjectProgress,
      ).toHaveBeenCalledTimes(1);
      expect(services.analyticsService.getProjectProgress).toHaveBeenCalledWith(
        input.projectId,
        input.startDate,
        input.endDate,
      );
    });

    it("should throw FORBIDDEN if user cannot access the project", async () => {
      // Arrange
      const input: RouterInput["analytics"]["getProjectProgress"] = {
        ...mockInputBase,
        projectId: "proj-forbidden",
      };
      const authError = new TRPCError({
        code: "FORBIDDEN",
        message: "Access Denied",
      });
      vi.mocked(services.authService.canAccessProject).mockRejectedValue(
        authError,
      );

      // Act & Assert
      await expect(caller.analytics.getProjectProgress(input)).rejects.toThrow(
        authError,
      );
      expect(services.authService.canAccessProject).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessProject).toHaveBeenCalledWith(
        input.projectId,
      );
      expect(
        services.analyticsService.getProjectProgress,
      ).not.toHaveBeenCalled();
    });

    it("should handle errors from analyticsService.getProjectProgress", async () => {
      // Arrange
      const input: RouterInput["analytics"]["getProjectProgress"] = {
        ...mockInputBase,
        projectId: "proj-service-error",
      };
      const serviceError = new Error("Service calculation error");
      vi.mocked(services.analyticsService.getProjectProgress).mockRejectedValue(
        serviceError,
      );

      // Act & Assert
      await expect(caller.analytics.getProjectProgress(input)).rejects.toThrow(
        expect.objectContaining({ message: serviceError.message }),
      );
      expect(services.authService.canAccessProject).toHaveBeenCalledTimes(1); // Auth check happens first
      expect(
        services.analyticsService.getProjectProgress,
      ).toHaveBeenCalledTimes(1);
      expect(services.analyticsService.getProjectProgress).toHaveBeenCalledWith(
        input.projectId,
        input.startDate,
        input.endDate,
      );
    });
  });

  // 2. getTaskCompletionTrend
  describe("analytics.getTaskCompletionTrend", () => {
    it("should get task completion trend after verifying project access", async () => {
      // Arrange
      const input: RouterInput["analytics"]["getTaskCompletionTrend"] =
        mockInputBase;
      const mockTrendData: RouterOutput["analytics"]["getTaskCompletionTrend"] =
        [
          { name: "Jan 1", value: 5 },
          { name: "Jan 8", value: 8 },
        ];
      vi.mocked(
        services.analyticsService.getTaskCompletionTrend,
      ).mockResolvedValue(mockTrendData);

      // Act
      const result = await caller.analytics.getTaskCompletionTrend(input);

      // Assert
      expect(result).toEqual(mockTrendData);
      expect(services.authService.canAccessProject).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessProject).toHaveBeenCalledWith(
        input.projectId,
      );
      expect(
        services.analyticsService.getTaskCompletionTrend,
      ).toHaveBeenCalledTimes(1);
      expect(
        services.analyticsService.getTaskCompletionTrend,
      ).toHaveBeenCalledWith(input.projectId, input.startDate, input.endDate);
    });

    it("should throw FORBIDDEN if user cannot access the project", async () => {
      // Arrange
      const input: RouterInput["analytics"]["getTaskCompletionTrend"] = {
        ...mockInputBase,
        projectId: "proj-forbidden",
      };
      const authError = new TRPCError({
        code: "FORBIDDEN",
        message: "Access Denied",
      });
      vi.mocked(services.authService.canAccessProject).mockRejectedValue(
        authError,
      );

      // Act & Assert
      await expect(
        caller.analytics.getTaskCompletionTrend(input),
      ).rejects.toThrow(authError);
      expect(services.authService.canAccessProject).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessProject).toHaveBeenCalledWith(
        input.projectId,
      );
      expect(
        services.analyticsService.getTaskCompletionTrend,
      ).not.toHaveBeenCalled();
    });

    it("should handle errors from analyticsService.getTaskCompletionTrend", async () => {
      // Arrange
      const input: RouterInput["analytics"]["getTaskCompletionTrend"] = {
        ...mockInputBase,
        projectId: "proj-trend-error",
      };
      const serviceError = new Error("Trend data unavailable");
      vi.mocked(
        services.analyticsService.getTaskCompletionTrend,
      ).mockRejectedValue(serviceError);

      // Act & Assert
      await expect(
        caller.analytics.getTaskCompletionTrend(input),
      ).rejects.toThrow(
        expect.objectContaining({ message: serviceError.message }),
      );
      expect(services.authService.canAccessProject).toHaveBeenCalledTimes(1); // Auth check happens first
      expect(
        services.analyticsService.getTaskCompletionTrend,
      ).toHaveBeenCalledTimes(1);
      expect(
        services.analyticsService.getTaskCompletionTrend,
      ).toHaveBeenCalledWith(input.projectId, input.startDate, input.endDate);
    });
  });

  // 3. getUserActivity
  describe("analytics.getUserActivity", () => {
    it("should get user activity after verifying project access", async () => {
      // Arrange
      const input: RouterInput["analytics"]["getUserActivity"] = mockInputBase;
      const mockActivityData: RouterOutput["analytics"]["getUserActivity"] = [
        { name: "User One", value: 10 },
        { name: "User Two", value: 8 },
      ];
      vi.mocked(services.analyticsService.getUserActivity).mockResolvedValue(
        mockActivityData,
      );

      // Act
      const result = await caller.analytics.getUserActivity(input);

      // Assert
      expect(result).toEqual(mockActivityData);
      expect(services.authService.canAccessProject).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessProject).toHaveBeenCalledWith(
        input.projectId,
      );
      expect(services.analyticsService.getUserActivity).toHaveBeenCalledTimes(
        1,
      );
      expect(services.analyticsService.getUserActivity).toHaveBeenCalledWith(
        input.projectId,
        input.startDate,
        input.endDate,
      );
    });

    it("should throw FORBIDDEN if user cannot access the project", async () => {
      // Arrange
      const input: RouterInput["analytics"]["getUserActivity"] = {
        ...mockInputBase,
        projectId: "proj-forbidden",
      };
      const authError = new TRPCError({
        code: "FORBIDDEN",
        message: "Access Denied",
      });
      vi.mocked(services.authService.canAccessProject).mockRejectedValue(
        authError,
      );

      // Act & Assert
      await expect(caller.analytics.getUserActivity(input)).rejects.toThrow(
        authError,
      );
      expect(services.authService.canAccessProject).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessProject).toHaveBeenCalledWith(
        input.projectId,
      );
      expect(services.analyticsService.getUserActivity).not.toHaveBeenCalled();
    });

    it("should handle errors from analyticsService.getUserActivity", async () => {
      // Arrange
      const input: RouterInput["analytics"]["getUserActivity"] = {
        ...mockInputBase,
        projectId: "proj-activity-error",
      };
      const serviceError = new Error("Activity data unavailable");
      vi.mocked(services.analyticsService.getUserActivity).mockRejectedValue(
        serviceError,
      );

      // Act & Assert
      await expect(caller.analytics.getUserActivity(input)).rejects.toThrow(
        expect.objectContaining({ message: serviceError.message }),
      );
      expect(services.authService.canAccessProject).toHaveBeenCalledTimes(1); // Auth check happens first
      expect(services.analyticsService.getUserActivity).toHaveBeenCalledTimes(
        1,
      );
      expect(services.analyticsService.getUserActivity).toHaveBeenCalledWith(
        input.projectId,
        input.startDate,
        input.endDate,
      );
    });
  });

  // 4. getPriorityDistribution
  describe("analytics.getPriorityDistribution", () => {
    it("should get priority distribution after verifying project access", async () => {
      // Arrange
      const input: RouterInput["analytics"]["getPriorityDistribution"] =
        mockInputBase;
      const mockDistributionData: RouterOutput["analytics"]["getPriorityDistribution"] =
        [
          { name: "high", value: 15 },
          { name: "medium", value: 30 },
          { name: "low", value: 25 },
          { name: "None", value: 10 },
        ];
      vi.mocked(
        services.analyticsService.getPriorityDistribution,
      ).mockResolvedValue(mockDistributionData);

      // Act
      const result = await caller.analytics.getPriorityDistribution(input);

      // Assert
      expect(result).toEqual(mockDistributionData);
      expect(services.authService.canAccessProject).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessProject).toHaveBeenCalledWith(
        input.projectId,
      );
      expect(
        services.analyticsService.getPriorityDistribution,
      ).toHaveBeenCalledTimes(1);
      expect(
        services.analyticsService.getPriorityDistribution,
      ).toHaveBeenCalledWith(input.projectId, input.startDate, input.endDate);
    });

    it("should throw FORBIDDEN if user cannot access the project", async () => {
      // Arrange
      const input: RouterInput["analytics"]["getPriorityDistribution"] = {
        ...mockInputBase,
        projectId: "proj-forbidden",
      };
      const authError = new TRPCError({
        code: "FORBIDDEN",
        message: "Access Denied",
      });
      vi.mocked(services.authService.canAccessProject).mockRejectedValue(
        authError,
      );

      // Act & Assert
      await expect(
        caller.analytics.getPriorityDistribution(input),
      ).rejects.toThrow(authError);
      expect(services.authService.canAccessProject).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessProject).toHaveBeenCalledWith(
        input.projectId,
      );
      expect(
        services.analyticsService.getPriorityDistribution,
      ).not.toHaveBeenCalled();
    });

    it("should handle errors from analyticsService.getPriorityDistribution", async () => {
      // Arrange
      const input: RouterInput["analytics"]["getPriorityDistribution"] = {
        ...mockInputBase,
        projectId: "proj-priority-error",
      };
      const serviceError = new Error("Priority data error");
      vi.mocked(
        services.analyticsService.getPriorityDistribution,
      ).mockRejectedValue(serviceError);

      // Act & Assert
      await expect(
        caller.analytics.getPriorityDistribution(input),
      ).rejects.toThrow(
        expect.objectContaining({ message: serviceError.message }),
      );
      expect(services.authService.canAccessProject).toHaveBeenCalledTimes(1); // Auth check happens first
      expect(
        services.analyticsService.getPriorityDistribution,
      ).toHaveBeenCalledTimes(1);
      expect(
        services.analyticsService.getPriorityDistribution,
      ).toHaveBeenCalledWith(input.projectId, input.startDate, input.endDate);
    });
  });

  // 5. getTasksPerDueDate
  describe("analytics.getTasksPerDueDate", () => {
    it("should get tasks per due date after verifying project access", async () => {
      // Arrange
      const input: RouterInput["analytics"]["getTasksPerDueDate"] =
        mockInputBase;
      const mockDueDateData: RouterOutput["analytics"]["getTasksPerDueDate"] = [
        { name: "2024-01-15", value: 10 },
        { name: "2024-01-20", value: 8 },
        { name: "overdue", value: 5 },
        { name: "no-due-date", value: 20 },
      ];
      vi.mocked(services.analyticsService.getTasksPerDueDate).mockResolvedValue(
        mockDueDateData,
      );

      // Act
      const result = await caller.analytics.getTasksPerDueDate(input);

      // Assert
      expect(result).toEqual(mockDueDateData);
      expect(services.authService.canAccessProject).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessProject).toHaveBeenCalledWith(
        input.projectId,
      );
      expect(
        services.analyticsService.getTasksPerDueDate,
      ).toHaveBeenCalledTimes(1);
      expect(services.analyticsService.getTasksPerDueDate).toHaveBeenCalledWith(
        input.projectId,
        input.startDate,
        input.endDate,
      );
    });

    it("should throw FORBIDDEN if user cannot access the project", async () => {
      // Arrange
      const input: RouterInput["analytics"]["getTasksPerDueDate"] = {
        ...mockInputBase,
        projectId: "proj-forbidden",
      };
      const authError = new TRPCError({
        code: "FORBIDDEN",
        message: "Access Denied",
      });
      vi.mocked(services.authService.canAccessProject).mockRejectedValue(
        authError,
      );

      // Act & Assert
      await expect(caller.analytics.getTasksPerDueDate(input)).rejects.toThrow(
        authError,
      );
      expect(services.authService.canAccessProject).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessProject).toHaveBeenCalledWith(
        input.projectId,
      );
      expect(
        services.analyticsService.getTasksPerDueDate,
      ).not.toHaveBeenCalled();
    });

    it("should handle errors from analyticsService.getTasksPerDueDate", async () => {
      // Arrange
      const input: RouterInput["analytics"]["getTasksPerDueDate"] = {
        ...mockInputBase,
        projectId: "proj-duedate-error",
      };
      const serviceError = new Error("Due date data error");
      vi.mocked(services.analyticsService.getTasksPerDueDate).mockRejectedValue(
        serviceError,
      );

      // Act & Assert
      await expect(caller.analytics.getTasksPerDueDate(input)).rejects.toThrow(
        expect.objectContaining({ message: serviceError.message }),
      );
      expect(services.authService.canAccessProject).toHaveBeenCalledTimes(1); // Auth check happens first
      expect(
        services.analyticsService.getTasksPerDueDate,
      ).toHaveBeenCalledTimes(1);
      expect(services.analyticsService.getTasksPerDueDate).toHaveBeenCalledWith(
        input.projectId,
        input.startDate,
        input.endDate,
      );
    });
  });
});
