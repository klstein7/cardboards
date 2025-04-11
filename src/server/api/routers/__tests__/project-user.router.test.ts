import { describe, it, expect, vi, beforeEach } from "vitest";
import { auth } from "@clerk/nextjs/server";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

// Mock react's cache function
vi.mock("react", async (importOriginal) => {
  const actualReact = await importOriginal<typeof import("react")>();
  return { ...actualReact, cache: vi.fn((fn) => fn) };
});

// Mock pusher server
vi.mock("~/pusher/server", () => ({
  pusher: { trigger: vi.fn().mockResolvedValue(undefined) },
}));

// Mock Clerk auth
vi.mock("@clerk/nextjs/server", () => ({ auth: vi.fn() }));

import { type AppRouter, appRouter } from "~/server/api/routers";
import { services } from "~/server/services/container";
import { pusherChannels } from "~/pusher/channels";

// Mock the specific services used by the project user router
vi.mock("~/server/services/container", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("~/server/services/container")>();
  return {
    ...original,
    services: {
      ...original.services,
      projectUserService: {
        list: vi.fn(),
        update: vi.fn(),
        remove: vi.fn(),
        getByProjectIdAndUserId: vi.fn(),
        updateCurrentUserPreferences: vi.fn(),
        countByProjectId: vi.fn(),
        getCurrentProjectUser: vi.fn(),
      },
      authService: {
        ...original.services.authService,
        canAccessProject: vi.fn(),
        requireProjectAdmin: vi.fn(),
      },
    },
  };
});

describe("Project User Router", () => {
  const mockUserId = "user-test-project-user-123";
  let caller: ReturnType<typeof appRouter.createCaller>;
  let pusherMock: typeof import("~/pusher/server").pusher;

  type RouterInput = inferRouterInputs<AppRouter>;
  type RouterOutput = inferRouterOutputs<AppRouter>;

  // Base Project User Type
  type MockUser = {
    id: string;
    name: string;
    email: string;
    imageUrl: string | null;
    createdAt: Date;
    updatedAt: Date | null;
  };

  type MockProjectUser = {
    id: string;
    projectId: string;
    userId: string;
    role: "admin" | "member";
    isFavorite: boolean;
    createdAt: Date;
    updatedAt: Date | null;
    user: MockUser;
  };

  // Helper to create mock user
  const createMockUser = (
    id: string,
    overrides: Partial<MockUser> = {},
  ): MockUser => ({
    id,
    name: `User ${id}`,
    email: `user-${id}@example.com`,
    imageUrl: null,
    createdAt: new Date(),
    updatedAt: null,
    ...overrides,
  });

  // Helper to create mock project user
  const createMockProjectUser = (
    id: string,
    projectId: string,
    userId: string,
    overrides: Partial<MockProjectUser> = {},
  ): MockProjectUser => ({
    id,
    projectId,
    userId,
    role: "member",
    isFavorite: false,
    createdAt: new Date(),
    updatedAt: null,
    user: createMockUser(userId),
    ...overrides,
  });

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.mocked(auth).mockReturnValue({ userId: mockUserId } as any);
    const ctx = { userId: mockUserId };
    caller = appRouter.createCaller(ctx);
    pusherMock = (await import("~/pusher/server")).pusher;

    // Default successful auth mocks
    vi.mocked(services.authService.canAccessProject).mockResolvedValue(
      {} as any,
    );
    vi.mocked(services.authService.requireProjectAdmin).mockResolvedValue(
      {} as any,
    );
  });

  // --- Test Suites ---

  describe("projectUser.list", () => {
    it("should list all users in a project after verifying access", async () => {
      // Arrange
      const projectId = "project-1";
      const mockProjectUsers = [
        createMockProjectUser("pu-1", projectId, mockUserId, { role: "admin" }),
        createMockProjectUser("pu-2", projectId, "other-user-1"),
        createMockProjectUser("pu-3", projectId, "other-user-2"),
      ];
      vi.mocked(services.projectUserService.list).mockResolvedValue(
        mockProjectUsers,
      );

      // Act
      const result = await caller.projectUser.list(projectId);

      // Assert
      expect(result).toEqual(mockProjectUsers);
      expect(services.authService.canAccessProject).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessProject).toHaveBeenCalledWith(
        projectId,
      );
      expect(services.projectUserService.list).toHaveBeenCalledTimes(1);
      expect(services.projectUserService.list).toHaveBeenCalledWith(projectId);
    });

    it("should throw if user doesn't have project access", async () => {
      // Arrange
      const projectId = "project-1";
      vi.mocked(services.authService.canAccessProject).mockRejectedValue(
        new TRPCError({ code: "FORBIDDEN" }),
      );

      // Act and Assert
      await expect(caller.projectUser.list(projectId)).rejects.toThrow(
        TRPCError,
      );
      expect(services.projectUserService.list).not.toHaveBeenCalled();
    });
  });

  describe("projectUser.update", () => {
    it("should update a project user after verifying admin access", async () => {
      // Arrange
      const projectId = "project-1";
      const targetUserId = "other-user-1";
      const input = {
        projectId,
        userId: targetUserId,
        data: { role: "admin" as const },
      };

      const mockUpdatedProjectUser = createMockProjectUser(
        "pu-2",
        projectId,
        targetUserId,
        { role: "admin" },
      );

      vi.mocked(services.projectUserService.update).mockResolvedValue(
        mockUpdatedProjectUser,
      );

      // Act
      const result = await caller.projectUser.update(input);

      // Assert
      expect(result).toEqual(mockUpdatedProjectUser);
      expect(services.authService.requireProjectAdmin).toHaveBeenCalledTimes(1);
      expect(services.authService.requireProjectAdmin).toHaveBeenCalledWith(
        projectId,
      );
      expect(services.projectUserService.update).toHaveBeenCalledTimes(1);
      expect(services.projectUserService.update).toHaveBeenCalledWith(
        projectId,
        targetUserId,
        input.data,
      );
      expect(pusherMock.trigger).toHaveBeenCalledTimes(1);
      expect(pusherMock.trigger).toHaveBeenCalledWith(
        pusherChannels.projectUser.name,
        pusherChannels.projectUser.events.updated.name,
        expect.objectContaining({
          input: mockUpdatedProjectUser,
          returning: mockUpdatedProjectUser,
          userId: mockUserId,
        }),
      );
    });

    it("should throw if user is not a project admin", async () => {
      // Arrange
      const input = {
        projectId: "project-1",
        userId: "other-user-1",
        data: { role: "admin" as const },
      };

      vi.mocked(services.authService.requireProjectAdmin).mockRejectedValue(
        new TRPCError({ code: "FORBIDDEN" }),
      );

      // Act and Assert
      await expect(caller.projectUser.update(input)).rejects.toThrow(TRPCError);
      expect(services.projectUserService.update).not.toHaveBeenCalled();
      expect(pusherMock.trigger).not.toHaveBeenCalled();
    });
  });

  describe("projectUser.remove", () => {
    it("should remove a user from a project after verifying admin access", async () => {
      // Arrange
      const projectId = "project-1";
      const targetUserId = "other-user-1";
      const input = {
        projectId,
        userId: targetUserId,
      };

      const mockProjectUser = createMockProjectUser(
        "pu-2",
        projectId,
        targetUserId,
      );

      vi.mocked(
        services.projectUserService.getByProjectIdAndUserId,
      ).mockResolvedValue(mockProjectUser);

      vi.mocked(services.projectUserService.remove).mockResolvedValue(
        undefined,
      );

      // Act
      const result = await caller.projectUser.remove(input);

      // Assert
      expect(result).toEqual(mockProjectUser);
      expect(services.authService.requireProjectAdmin).toHaveBeenCalledTimes(1);
      expect(services.authService.requireProjectAdmin).toHaveBeenCalledWith(
        projectId,
      );
      expect(
        services.projectUserService.getByProjectIdAndUserId,
      ).toHaveBeenCalledTimes(1);
      expect(
        services.projectUserService.getByProjectIdAndUserId,
      ).toHaveBeenCalledWith(projectId, targetUserId);
      expect(services.projectUserService.remove).toHaveBeenCalledTimes(1);
      expect(services.projectUserService.remove).toHaveBeenCalledWith(
        projectId,
        targetUserId,
      );
      expect(pusherMock.trigger).toHaveBeenCalledTimes(1);
      expect(pusherMock.trigger).toHaveBeenCalledWith(
        pusherChannels.projectUser.name,
        pusherChannels.projectUser.events.removed.name,
        expect.objectContaining({
          input: mockProjectUser,
          returning: mockProjectUser,
          userId: mockUserId,
        }),
      );
    });

    it("should throw if user is not a project admin", async () => {
      // Arrange
      const input = {
        projectId: "project-1",
        userId: "other-user-1",
      };

      vi.mocked(services.authService.requireProjectAdmin).mockRejectedValue(
        new TRPCError({ code: "FORBIDDEN" }),
      );

      // Act and Assert
      await expect(caller.projectUser.remove(input)).rejects.toThrow(TRPCError);
      expect(
        services.projectUserService.getByProjectIdAndUserId,
      ).not.toHaveBeenCalled();
      expect(services.projectUserService.remove).not.toHaveBeenCalled();
      expect(pusherMock.trigger).not.toHaveBeenCalled();
    });
  });

  describe("projectUser.updateCurrentUserPreferences", () => {
    it("should update current user preferences after verifying project access", async () => {
      // Arrange
      const projectId = "project-1";
      const input = {
        projectId,
        data: { isFavorite: true },
      };

      const mockProjectUser = createMockProjectUser(
        "pu-1",
        projectId,
        mockUserId,
        { isFavorite: true },
      );

      vi.mocked(
        services.projectUserService.updateCurrentUserPreferences,
      ).mockResolvedValue(mockProjectUser);

      // Act
      const result =
        await caller.projectUser.updateCurrentUserPreferences(input);

      // Assert
      expect(result).toEqual(mockProjectUser);
      expect(services.authService.canAccessProject).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessProject).toHaveBeenCalledWith(
        projectId,
      );
      expect(
        services.projectUserService.updateCurrentUserPreferences,
      ).toHaveBeenCalledTimes(1);
      expect(
        services.projectUserService.updateCurrentUserPreferences,
      ).toHaveBeenCalledWith(projectId, input.data);
      expect(pusherMock.trigger).toHaveBeenCalledTimes(1);
      expect(pusherMock.trigger).toHaveBeenCalledWith(
        pusherChannels.projectUser.name,
        pusherChannels.projectUser.events.updated.name,
        expect.objectContaining({
          input: mockProjectUser,
          returning: mockProjectUser,
          userId: mockUserId,
        }),
      );
    });

    it("should throw if user doesn't have project access", async () => {
      // Arrange
      const input = {
        projectId: "project-1",
        data: { isFavorite: true },
      };

      vi.mocked(services.authService.canAccessProject).mockRejectedValue(
        new TRPCError({ code: "FORBIDDEN" }),
      );

      // Act and Assert
      await expect(
        caller.projectUser.updateCurrentUserPreferences(input),
      ).rejects.toThrow(TRPCError);
      expect(
        services.projectUserService.updateCurrentUserPreferences,
      ).not.toHaveBeenCalled();
      expect(pusherMock.trigger).not.toHaveBeenCalled();
    });
  });

  describe("projectUser.countByProjectId", () => {
    it("should count users in a project after verifying project access", async () => {
      // Arrange
      const projectId = "project-1";
      const count = 3;

      vi.mocked(services.projectUserService.countByProjectId).mockResolvedValue(
        count,
      );

      // Act
      const result = await caller.projectUser.countByProjectId(projectId);

      // Assert
      expect(result).toEqual(count);
      expect(services.authService.canAccessProject).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessProject).toHaveBeenCalledWith(
        projectId,
      );
      expect(
        services.projectUserService.countByProjectId,
      ).toHaveBeenCalledTimes(1);
      expect(services.projectUserService.countByProjectId).toHaveBeenCalledWith(
        projectId,
      );
    });

    it("should throw if user doesn't have project access", async () => {
      // Arrange
      const projectId = "project-1";

      vi.mocked(services.authService.canAccessProject).mockRejectedValue(
        new TRPCError({ code: "FORBIDDEN" }),
      );

      // Act and Assert
      await expect(
        caller.projectUser.countByProjectId(projectId),
      ).rejects.toThrow(TRPCError);
      expect(
        services.projectUserService.countByProjectId,
      ).not.toHaveBeenCalled();
    });
  });

  describe("projectUser.getCurrentProjectUser", () => {
    it("should get current user's membership after verifying project access", async () => {
      // Arrange
      const projectId = "project-1";
      const mockProjectUser = createMockProjectUser(
        "pu-1",
        projectId,
        mockUserId,
        { role: "admin" },
      );

      vi.mocked(
        services.projectUserService.getCurrentProjectUser,
      ).mockResolvedValue(mockProjectUser);

      // Act
      const result = await caller.projectUser.getCurrentProjectUser(projectId);

      // Assert
      expect(result).toEqual(mockProjectUser);
      expect(services.authService.canAccessProject).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessProject).toHaveBeenCalledWith(
        projectId,
      );
      expect(
        services.projectUserService.getCurrentProjectUser,
      ).toHaveBeenCalledTimes(1);
      expect(
        services.projectUserService.getCurrentProjectUser,
      ).toHaveBeenCalledWith(projectId);
    });

    it("should throw if user doesn't have project access", async () => {
      // Arrange
      const projectId = "project-1";

      vi.mocked(services.authService.canAccessProject).mockRejectedValue(
        new TRPCError({ code: "FORBIDDEN" }),
      );

      // Act and Assert
      await expect(
        caller.projectUser.getCurrentProjectUser(projectId),
      ).rejects.toThrow(TRPCError);
      expect(
        services.projectUserService.getCurrentProjectUser,
      ).not.toHaveBeenCalled();
    });
  });
});
