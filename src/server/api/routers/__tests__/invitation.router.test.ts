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

// Mock the specific services used by the invitation router
vi.mock("~/server/services/container", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("~/server/services/container")>();
  return {
    ...original,
    services: {
      ...original.services,
      invitationService: {
        create: vi.fn(),
        get: vi.fn(),
        accept: vi.fn(),
      },
      authService: {
        ...original.services.authService,
        requireProjectAdmin: vi.fn(),
      },
    },
  };
});

describe("Invitation Router", () => {
  const mockUserId = "user-test-invitation-123";
  let caller: ReturnType<typeof appRouter.createCaller>;
  let pusherMock: typeof import("~/pusher/server").pusher;

  type RouterInput = inferRouterInputs<AppRouter>;
  type RouterOutput = inferRouterOutputs<AppRouter>;

  // Base Invitation Type
  type MockInvitation = {
    id: string;
    projectId: string;
    createdAt: Date;
    updatedAt: Date | null;
    expiresAt: Date;
    isActive: boolean;
    invitedById: string;
    project: {
      id: string;
      name: string;
    };
  };

  // Base ProjectUser Type (for accept endpoint)
  type MockProjectUser = {
    id: string;
    projectId: string;
    userId: string;
    role: "admin" | "member";
    createdAt: Date;
    updatedAt: Date | null;
    isFavorite: boolean;
  };

  // Helper to create mock invitation
  const createMockInvitation = (
    id: string,
    projectId: string,
    overrides: Partial<MockInvitation> = {},
  ): MockInvitation => ({
    id,
    projectId,
    createdAt: new Date(),
    updatedAt: null,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    isActive: true,
    invitedById: mockUserId,
    project: {
      id: projectId,
      name: `Project ${projectId}`,
    },
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
    createdAt: new Date(),
    updatedAt: null,
    isFavorite: false,
    ...overrides,
  });

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.mocked(auth).mockReturnValue({ userId: mockUserId } as any);
    const ctx = { userId: mockUserId };
    caller = appRouter.createCaller(ctx);
    pusherMock = (await import("~/pusher/server")).pusher;

    // Default successful auth mocks
    vi.mocked(services.authService.requireProjectAdmin).mockResolvedValue(
      {} as any,
    );
  });

  // --- Test Suites ---

  describe("invitation.create", () => {
    it("should create invitation after verifying project admin access", async () => {
      // Arrange
      const projectId = "project-1";
      const mockInvitation = createMockInvitation("inv-1", projectId);
      vi.mocked(services.invitationService.create).mockResolvedValue(
        mockInvitation,
      );

      // Act
      const result = await caller.invitation.create(projectId);

      // Assert
      expect(result).toEqual(mockInvitation);
      expect(services.authService.requireProjectAdmin).toHaveBeenCalledTimes(1);
      expect(services.authService.requireProjectAdmin).toHaveBeenCalledWith(
        projectId,
      );
      expect(services.invitationService.create).toHaveBeenCalledTimes(1);
      expect(services.invitationService.create).toHaveBeenCalledWith(projectId);
    });

    it("should throw if user is not a project admin", async () => {
      // Arrange
      const projectId = "project-1";
      vi.mocked(services.authService.requireProjectAdmin).mockRejectedValue(
        new TRPCError({ code: "FORBIDDEN" }),
      );

      // Act and Assert
      await expect(caller.invitation.create(projectId)).rejects.toThrow(
        TRPCError,
      );
      expect(services.invitationService.create).not.toHaveBeenCalled();
    });
  });

  describe("invitation.get", () => {
    it("should get invitation by ID", async () => {
      // Arrange
      const invitationId = "inv-1";
      const mockInvitation = createMockInvitation(invitationId, "project-1");
      vi.mocked(services.invitationService.get).mockResolvedValue(
        mockInvitation,
      );

      // Act
      const result = await caller.invitation.get(invitationId);

      // Assert
      expect(result).toEqual(mockInvitation);
      expect(services.invitationService.get).toHaveBeenCalledTimes(1);
      expect(services.invitationService.get).toHaveBeenCalledWith(invitationId);
    });

    it("should throw if invitation is not found", async () => {
      // Arrange
      const invitationId = "inv-nonexistent";
      vi.mocked(services.invitationService.get).mockRejectedValue(
        new TRPCError({ code: "NOT_FOUND" }),
      );

      // Act and Assert
      await expect(caller.invitation.get(invitationId)).rejects.toThrow(
        TRPCError,
      );
    });
  });

  describe("invitation.accept", () => {
    it("should accept invitation and trigger pusher", async () => {
      // Arrange
      const invitationId = "inv-1";
      const projectId = "project-1";

      const mockInvitation = createMockInvitation(invitationId, projectId);
      const mockProjectUser = createMockProjectUser(
        "pu-1",
        projectId,
        mockUserId,
      );

      vi.mocked(services.invitationService.get).mockResolvedValue(
        mockInvitation,
      );
      vi.mocked(services.invitationService.accept).mockResolvedValue(
        mockProjectUser,
      );

      // Act
      const result = await caller.invitation.accept(invitationId);

      // Assert
      expect(result).toEqual(mockProjectUser);
      expect(services.invitationService.get).toHaveBeenCalledTimes(1);
      expect(services.invitationService.get).toHaveBeenCalledWith(invitationId);
      expect(services.invitationService.accept).toHaveBeenCalledTimes(1);
      expect(services.invitationService.accept).toHaveBeenCalledWith(
        invitationId,
        mockUserId,
      );
      expect(pusherMock.trigger).toHaveBeenCalledTimes(1);
      expect(pusherMock.trigger).toHaveBeenCalledWith(
        pusherChannels.projectUser.name,
        pusherChannels.projectUser.events.added.name,
        {
          input: mockProjectUser,
          returning: mockProjectUser,
          userId: mockUserId,
        },
      );
    });

    it("should throw if invitation is not found", async () => {
      // Arrange
      const invitationId = "inv-nonexistent";
      vi.mocked(services.invitationService.get).mockRejectedValue(
        new TRPCError({ code: "NOT_FOUND" }),
      );

      // Act and Assert
      await expect(caller.invitation.accept(invitationId)).rejects.toThrow(
        TRPCError,
      );
      expect(services.invitationService.accept).not.toHaveBeenCalled();
      expect(pusherMock.trigger).not.toHaveBeenCalled();
    });
  });
});
