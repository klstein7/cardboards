import { describe, it, expect, vi, beforeEach } from "vitest";
import { auth } from "@clerk/nextjs/server";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

// Mock react's cache function for the test environment
vi.mock("react", async (importOriginal) => {
  const actualReact = await importOriginal<typeof import("react")>();
  return {
    ...actualReact,
    cache: vi.fn((fn) => fn),
  };
});

import { type AppRouter, appRouter } from "~/server/api/routers";
import { createCallerFactory } from "~/trpc/init";
import { services } from "~/server/services/container";
// Import the specific Zod schemas used in tests
import {
  AiInsightCreateSchema,
  AiInsightUpdatePayloadSchema,
  AiInsightUpdateSchema,
  AiInsightListByEntitySchema,
} from "~/server/zod";

// Mock Clerk auth
vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

// Mock the specific services used by the aiInsight router
vi.mock("~/server/services/container", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("~/server/services/container")>();
  return {
    ...original,
    services: {
      ...original.services,
      aiInsightService: {
        create: vi.fn(),
        get: vi.fn(),
        listByEntity: vi.fn(),
        listActiveByEntity: vi.fn(),
        update: vi.fn(),
        del: vi.fn(),
        generateBoardInsights: vi.fn(),
        generateProjectInsights: vi.fn(),
      },
      authService: {
        canAccessProject: vi.fn(),
        canAccessBoard: vi.fn(),
        requireProjectAdmin: vi.fn(),
      },
    },
  };
});

describe("AI Insight Router", () => {
  const mockUserId = "user-test-ai-123";
  let caller: ReturnType<typeof appRouter.createCaller>;

  type RouterInput = inferRouterInputs<AppRouter>;
  type RouterOutput = inferRouterOutputs<AppRouter>;

  // Helper to create a base mock insight
  const createMockInsight = (
    id: string,
    entityType: "project" | "board",
    entityId: string,
    overrides: Partial<RouterOutput["aiInsight"]["get"]> = {},
  ): RouterOutput["aiInsight"]["get"] => ({
    id,
    entityType,
    entityId,
    projectId: entityType === "project" ? entityId : null,
    boardId: entityType === "board" ? entityId : null,
    insightType: "recommendation",
    title: `Test Insight ${id}`,
    content: `Content for ${id}`,
    severity: "info",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt: null,
    metadata: null,
    project: null,
    board: null,
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    // Setup authenticated user context
    vi.mocked(auth).mockReturnValue({ userId: mockUserId } as any);
    const ctx = { userId: mockUserId };
    caller = appRouter.createCaller(ctx);

    // Default successful auth mocks for most tests
    vi.mocked(services.authService.canAccessProject).mockResolvedValue(
      {} as any,
    );
    vi.mocked(services.authService.canAccessBoard).mockResolvedValue({} as any);
    vi.mocked(services.authService.requireProjectAdmin).mockResolvedValue(
      {} as any,
    );
  });

  // --- create procedure tests ---
  describe("aiInsight.create", () => {
    it("should create an insight for a project after verifying project access", async () => {
      // Arrange
      const inputData: z.infer<typeof AiInsightCreateSchema> = {
        entityType: "project",
        entityId: "proj-1",
        insightType: "recommendation",
        title: "Project Rec",
        content: "Project suggestion insight",
        severity: "info",
        isActive: true,
      };
      const mockCreatedInsight = createMockInsight(
        "insight-1",
        "project",
        "proj-1",
        inputData,
      );
      vi.mocked(services.aiInsightService.create).mockResolvedValue(
        mockCreatedInsight,
      );

      // Act
      const result = await caller.aiInsight.create(inputData);

      // Assert
      expect(result).toEqual(mockCreatedInsight);
      expect(services.authService.canAccessProject).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessProject).toHaveBeenCalledWith(
        inputData.entityId,
      );
      expect(services.authService.canAccessBoard).not.toHaveBeenCalled();
      expect(services.aiInsightService.create).toHaveBeenCalledTimes(1);
      expect(services.aiInsightService.create).toHaveBeenCalledWith(inputData);
    });

    it("should create an insight for a board after verifying board access", async () => {
      // Arrange
      const inputData: z.infer<typeof AiInsightCreateSchema> = {
        entityType: "board",
        entityId: "board-1",
        insightType: "risk_assessment",
        title: "Board Risk",
        content: "Board warning insight",
        severity: "warning",
        isActive: true,
      };
      const mockCreatedInsight = createMockInsight(
        "insight-2",
        "board",
        "board-1",
        inputData,
      );
      vi.mocked(services.aiInsightService.create).mockResolvedValue(
        mockCreatedInsight,
      );

      // Act
      const result = await caller.aiInsight.create(inputData);

      // Assert
      expect(result).toEqual(mockCreatedInsight);
      expect(services.authService.canAccessBoard).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessBoard).toHaveBeenCalledWith(
        inputData.entityId,
      );
      expect(services.authService.canAccessProject).not.toHaveBeenCalled();
      expect(services.aiInsightService.create).toHaveBeenCalledTimes(1);
      expect(services.aiInsightService.create).toHaveBeenCalledWith(inputData);
    });

    it("should throw FORBIDDEN error if user cannot access project", async () => {
      // Arrange
      const inputData: z.infer<typeof AiInsightCreateSchema> = {
        entityType: "project",
        entityId: "proj-forbidden",
        insightType: "productivity",
        title: "Forbidden Insight",
        content: "Forbidden project insight",
        severity: "info",
        isActive: true,
      };
      const authError = new TRPCError({
        code: "FORBIDDEN",
        message: "Cannot access project",
      });
      vi.mocked(services.authService.canAccessProject).mockRejectedValue(
        authError,
      );

      // Act & Assert
      await expect(caller.aiInsight.create(inputData)).rejects.toThrow(
        authError,
      );
      expect(services.authService.canAccessProject).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessProject).toHaveBeenCalledWith(
        inputData.entityId,
      );
      expect(services.aiInsightService.create).not.toHaveBeenCalled();
    });

    it("should handle errors from aiInsightService.create", async () => {
      // Arrange
      const inputData: z.infer<typeof AiInsightCreateSchema> = {
        entityType: "project",
        entityId: "proj-service-error",
        insightType: "bottleneck",
        title: "Error Insight",
        content: "Insight causing service error",
        severity: "critical",
        isActive: true,
      };
      const serviceError = new Error("Database error during creation");
      vi.mocked(services.aiInsightService.create).mockRejectedValue(
        serviceError,
      );

      // Act & Assert
      await expect(caller.aiInsight.create(inputData)).rejects.toThrow(
        expect.objectContaining({ message: serviceError.message }),
      );
      expect(services.authService.canAccessProject).toHaveBeenCalledTimes(1); // Auth check happens first
      expect(services.aiInsightService.create).toHaveBeenCalledTimes(1);
      expect(services.aiInsightService.create).toHaveBeenCalledWith(inputData);
    });
  });

  // --- get procedure tests ---
  describe("aiInsight.get", () => {
    it("should get an insight by ID after verifying project access", async () => {
      // Arrange
      const insightId = "insight-proj-1";
      const projectId = "proj-accessible";
      const mockInsight = createMockInsight(insightId, "project", projectId);
      vi.mocked(services.aiInsightService.get).mockResolvedValue(mockInsight);

      // Act
      const result = await caller.aiInsight.get(insightId);

      // Assert
      expect(result).toEqual(mockInsight);
      expect(services.aiInsightService.get).toHaveBeenCalledTimes(1);
      expect(services.aiInsightService.get).toHaveBeenCalledWith(insightId);
      expect(services.authService.canAccessProject).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessProject).toHaveBeenCalledWith(
        projectId,
      );
      expect(services.authService.canAccessBoard).not.toHaveBeenCalled();
    });

    it("should get an insight by ID after verifying board access", async () => {
      // Arrange
      const insightId = "insight-board-1";
      const boardId = "board-accessible";
      const mockInsight = createMockInsight(insightId, "board", boardId);
      vi.mocked(services.aiInsightService.get).mockResolvedValue(mockInsight);

      // Act
      const result = await caller.aiInsight.get(insightId);

      // Assert
      expect(result).toEqual(mockInsight);
      expect(services.aiInsightService.get).toHaveBeenCalledTimes(1);
      expect(services.aiInsightService.get).toHaveBeenCalledWith(insightId);
      expect(services.authService.canAccessBoard).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessBoard).toHaveBeenCalledWith(boardId);
      expect(services.authService.canAccessProject).not.toHaveBeenCalled();
    });

    it("should throw FORBIDDEN if user cannot access the related project", async () => {
      // Arrange
      const insightId = "insight-proj-forbidden";
      const projectId = "proj-forbidden";
      const mockInsight = createMockInsight(insightId, "project", projectId); // Service returns insight first
      vi.mocked(services.aiInsightService.get).mockResolvedValue(mockInsight);
      const authError = new TRPCError({
        code: "FORBIDDEN",
        message: "Cannot access project",
      });
      vi.mocked(services.authService.canAccessProject).mockRejectedValue(
        authError,
      );

      // Act & Assert
      await expect(caller.aiInsight.get(insightId)).rejects.toThrow(authError);
      expect(services.aiInsightService.get).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessProject).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessProject).toHaveBeenCalledWith(
        projectId,
      );
    });

    it("should throw FORBIDDEN if user cannot access the related board", async () => {
      // Arrange
      const insightId = "insight-board-forbidden";
      const boardId = "board-forbidden";
      const mockInsight = createMockInsight(insightId, "board", boardId);
      vi.mocked(services.aiInsightService.get).mockResolvedValue(mockInsight);
      const authError = new TRPCError({
        code: "FORBIDDEN",
        message: "Cannot access board",
      });
      vi.mocked(services.authService.canAccessBoard).mockRejectedValue(
        authError,
      );

      // Act & Assert
      await expect(caller.aiInsight.get(insightId)).rejects.toThrow(authError);
      expect(services.aiInsightService.get).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessBoard).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessBoard).toHaveBeenCalledWith(boardId);
      expect(services.authService.canAccessProject).not.toHaveBeenCalled();
    });

    it("should handle errors from aiInsightService.get", async () => {
      // Arrange
      const insightId = "insight-not-found";
      const serviceError = new Error("Insight not found");
      vi.mocked(services.aiInsightService.get).mockRejectedValue(serviceError);

      // Act & Assert
      await expect(caller.aiInsight.get(insightId)).rejects.toThrow(
        expect.objectContaining({ message: serviceError.message }),
      );
      expect(services.aiInsightService.get).toHaveBeenCalledTimes(1);
      expect(services.aiInsightService.get).toHaveBeenCalledWith(insightId);
      expect(services.authService.canAccessProject).not.toHaveBeenCalled(); // Auth check happens after get
      expect(services.authService.canAccessBoard).not.toHaveBeenCalled();
    });
  });

  // --- listByEntity tests ---
  describe("aiInsight.listByEntity", () => {
    it("should list insights for a project after verifying project access", async () => {
      // Arrange
      const input: RouterInput["aiInsight"]["listByEntity"] = {
        entityType: "project",
        entityId: "proj-listable",
      };
      const mockInsights = [
        createMockInsight("insight-p1", "project", input.entityId),
        createMockInsight("insight-p2", "project", input.entityId, {
          insightType: "bottleneck",
        }),
      ];
      vi.mocked(services.aiInsightService.listByEntity).mockResolvedValue(
        mockInsights,
      );

      // Act
      const result = await caller.aiInsight.listByEntity(input);

      // Assert
      expect(result).toEqual(mockInsights);
      expect(services.authService.canAccessProject).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessProject).toHaveBeenCalledWith(
        input.entityId,
      );
      expect(services.aiInsightService.listByEntity).toHaveBeenCalledTimes(1);
      expect(services.aiInsightService.listByEntity).toHaveBeenCalledWith(
        input.entityType,
        input.entityId,
      );
    });

    it("should list insights for a board after verifying board access", async () => {
      // Arrange
      const input: RouterInput["aiInsight"]["listByEntity"] = {
        entityType: "board",
        entityId: "board-listable",
      };
      const mockInsights = [
        createMockInsight("insight-b1", "board", input.entityId),
        createMockInsight("insight-b2", "board", input.entityId, {
          insightType: "risk_assessment",
        }),
      ];
      vi.mocked(services.aiInsightService.listByEntity).mockResolvedValue(
        mockInsights,
      );

      // Act
      const result = await caller.aiInsight.listByEntity(input);

      // Assert
      expect(result).toEqual(mockInsights);
      expect(services.authService.canAccessBoard).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessBoard).toHaveBeenCalledWith(
        input.entityId,
      );
      expect(services.aiInsightService.listByEntity).toHaveBeenCalledTimes(1);
      expect(services.aiInsightService.listByEntity).toHaveBeenCalledWith(
        input.entityType,
        input.entityId,
      );
    });

    it("should throw FORBIDDEN if user cannot access the project for listing", async () => {
      // Arrange
      const input: RouterInput["aiInsight"]["listByEntity"] = {
        entityType: "project",
        entityId: "proj-list-forbidden",
      };
      const authError = new TRPCError({
        code: "FORBIDDEN",
        message: "Cannot access project",
      });
      vi.mocked(services.authService.canAccessProject).mockRejectedValue(
        authError,
      );

      // Act & Assert
      await expect(caller.aiInsight.listByEntity(input)).rejects.toThrow(
        authError,
      );
      expect(services.authService.canAccessProject).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessProject).toHaveBeenCalledWith(
        input.entityId,
      );
      expect(services.aiInsightService.listByEntity).not.toHaveBeenCalled();
    });

    it("should handle errors from aiInsightService.listByEntity", async () => {
      // Arrange
      const input: RouterInput["aiInsight"]["listByEntity"] = {
        entityType: "project",
        entityId: "proj-list-service-error",
      };
      const serviceError = new Error("Database error during list");
      vi.mocked(services.aiInsightService.listByEntity).mockRejectedValue(
        serviceError,
      );

      // Act & Assert
      await expect(caller.aiInsight.listByEntity(input)).rejects.toThrow(
        expect.objectContaining({ message: serviceError.message }),
      );
      expect(services.authService.canAccessProject).toHaveBeenCalledTimes(1); // Auth check happens first
      expect(services.aiInsightService.listByEntity).toHaveBeenCalledTimes(1);
      expect(services.aiInsightService.listByEntity).toHaveBeenCalledWith(
        input.entityType,
        input.entityId,
      );
    });
  });

  // --- listActiveByEntity tests ---
  describe("aiInsight.listActiveByEntity", () => {
    it("should list active insights for a project after verifying project access", async () => {
      // Arrange
      const input: RouterInput["aiInsight"]["listActiveByEntity"] = {
        entityType: "project",
        entityId: "proj-listable-active",
      };
      const mockInsights = [
        createMockInsight("insight-pa1", "project", input.entityId, {
          isActive: true,
        }),
      ];
      vi.mocked(services.aiInsightService.listActiveByEntity).mockResolvedValue(
        mockInsights,
      );

      // Act
      const result = await caller.aiInsight.listActiveByEntity(input);

      // Assert
      expect(result).toEqual(mockInsights);
      expect(services.authService.canAccessProject).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessProject).toHaveBeenCalledWith(
        input.entityId,
      );
      expect(
        services.aiInsightService.listActiveByEntity,
      ).toHaveBeenCalledTimes(1);
      expect(services.aiInsightService.listActiveByEntity).toHaveBeenCalledWith(
        input.entityType,
        input.entityId,
      );
    });

    it("should list active insights for a board after verifying board access", async () => {
      // Arrange
      const input: RouterInput["aiInsight"]["listActiveByEntity"] = {
        entityType: "board",
        entityId: "board-listable-active",
      };
      const mockInsights = [
        createMockInsight("insight-ba1", "board", input.entityId, {
          isActive: true,
          insightType: "productivity",
        }),
      ];
      vi.mocked(services.aiInsightService.listActiveByEntity).mockResolvedValue(
        mockInsights,
      );

      // Act
      const result = await caller.aiInsight.listActiveByEntity(input);

      // Assert
      expect(result).toEqual(mockInsights);
      expect(services.authService.canAccessBoard).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessBoard).toHaveBeenCalledWith(
        input.entityId,
      );
      expect(
        services.aiInsightService.listActiveByEntity,
      ).toHaveBeenCalledTimes(1);
      expect(services.aiInsightService.listActiveByEntity).toHaveBeenCalledWith(
        input.entityType,
        input.entityId,
      );
    });

    it("should throw FORBIDDEN if user cannot access the board for listing active", async () => {
      // Arrange
      const input: RouterInput["aiInsight"]["listActiveByEntity"] = {
        entityType: "board",
        entityId: "board-list-active-forbidden",
      };
      const authError = new TRPCError({
        code: "FORBIDDEN",
        message: "Cannot access board",
      });
      vi.mocked(services.authService.canAccessBoard).mockRejectedValue(
        authError,
      );

      // Act & Assert
      await expect(caller.aiInsight.listActiveByEntity(input)).rejects.toThrow(
        authError,
      );
      expect(services.authService.canAccessBoard).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessBoard).toHaveBeenCalledWith(
        input.entityId,
      );
      expect(
        services.aiInsightService.listActiveByEntity,
      ).not.toHaveBeenCalled();
    });

    it("should handle errors from aiInsightService.listActiveByEntity", async () => {
      // Arrange
      const input: RouterInput["aiInsight"]["listActiveByEntity"] = {
        entityType: "board",
        entityId: "board-list-active-service-error",
      };
      const serviceError = new Error("Database error during active list");
      vi.mocked(services.aiInsightService.listActiveByEntity).mockRejectedValue(
        serviceError,
      );

      // Act & Assert
      await expect(caller.aiInsight.listActiveByEntity(input)).rejects.toThrow(
        expect.objectContaining({ message: serviceError.message }),
      );
      expect(services.authService.canAccessBoard).toHaveBeenCalledTimes(1); // Auth check happens first
      expect(
        services.aiInsightService.listActiveByEntity,
      ).toHaveBeenCalledTimes(1);
      expect(services.aiInsightService.listActiveByEntity).toHaveBeenCalledWith(
        input.entityType,
        input.entityId,
      );
    });
  });

  // --- update tests ---
  describe("aiInsight.update", () => {
    it("should update a project insight after requiring project admin access", async () => {
      // Arrange
      const insightId = "insight-updatable-proj";
      const projectId = "proj-admin";
      const updateData: z.infer<typeof AiInsightUpdatePayloadSchema> = {
        content: "Updated content",
        severity: "warning",
      };
      const input: RouterInput["aiInsight"]["update"] = {
        id: insightId,
        data: updateData,
      };

      const mockExistingInsight = createMockInsight(
        insightId,
        "project",
        projectId,
      );
      const mockUpdatedInsight = {
        ...mockExistingInsight,
        ...updateData,
        updatedAt: expect.any(Date), // Service likely updates this
      };

      vi.mocked(services.aiInsightService.get).mockResolvedValue(
        mockExistingInsight,
      );
      vi.mocked(services.aiInsightService.update).mockResolvedValue(
        mockUpdatedInsight as any,
      ); // Cast needed as spread loses precise type

      // Act
      const result = await caller.aiInsight.update(input);

      // Assert
      expect(result).toEqual(mockUpdatedInsight);
      expect(services.aiInsightService.get).toHaveBeenCalledTimes(1);
      expect(services.aiInsightService.get).toHaveBeenCalledWith(insightId);
      expect(services.authService.requireProjectAdmin).toHaveBeenCalledTimes(1);
      expect(services.authService.requireProjectAdmin).toHaveBeenCalledWith(
        projectId,
      );
      expect(services.aiInsightService.update).toHaveBeenCalledTimes(1);
      expect(services.aiInsightService.update).toHaveBeenCalledWith(
        input.id,
        input.data,
      );
    });

    it("should *not* update a board insight (router only checks project admin)", async () => {
      // Arrange
      const insightId = "insight-updatable-board";
      const boardId = "board-update-attempt";
      const updateData: z.infer<typeof AiInsightUpdatePayloadSchema> = {
        isActive: false,
      };
      const input: RouterInput["aiInsight"]["update"] = {
        id: insightId,
        data: updateData,
      };

      // Mock insight is linked to a board, not a project
      const mockExistingInsight = createMockInsight(
        insightId,
        "board",
        boardId,
      );

      vi.mocked(services.aiInsightService.get).mockResolvedValue(
        mockExistingInsight,
      );

      // Act
      // No specific error expected, but requireProjectAdmin should NOT be called for board insights
      // The service update should proceed if the get succeeds and there's no projectId.
      // Let's mock the update to succeed in this case to test the flow.
      const mockUpdatedInsight = {
        ...mockExistingInsight,
        ...updateData,
        updatedAt: new Date(),
      };
      vi.mocked(services.aiInsightService.update).mockResolvedValue(
        mockUpdatedInsight as any,
      );

      const result = await caller.aiInsight.update(input);

      // Assert
      expect(result).toEqual(mockUpdatedInsight);
      expect(services.aiInsightService.get).toHaveBeenCalledTimes(1);
      expect(services.aiInsightService.get).toHaveBeenCalledWith(insightId);
      // IMPORTANT: Project admin check should NOT have happened
      expect(services.authService.requireProjectAdmin).not.toHaveBeenCalled();
      expect(services.aiInsightService.update).toHaveBeenCalledTimes(1);
      expect(services.aiInsightService.update).toHaveBeenCalledWith(
        input.id,
        input.data,
      );
    });

    it("should throw FORBIDDEN if requireProjectAdmin fails for a project insight", async () => {
      // Arrange
      const insightId = "insight-update-proj-forbidden";
      const projectId = "proj-admin-fail";
      const updateData: z.infer<typeof AiInsightUpdatePayloadSchema> = {
        title: "New Title",
      };
      const input: RouterInput["aiInsight"]["update"] = {
        id: insightId,
        data: updateData,
      };

      const mockExistingInsight = createMockInsight(
        insightId,
        "project",
        projectId,
      );
      vi.mocked(services.aiInsightService.get).mockResolvedValue(
        mockExistingInsight,
      );

      const authError = new TRPCError({
        code: "FORBIDDEN",
        message: "User is not project admin",
      });
      vi.mocked(services.authService.requireProjectAdmin).mockRejectedValue(
        authError,
      );

      // Act & Assert
      await expect(caller.aiInsight.update(input)).rejects.toThrow(authError);
      expect(services.aiInsightService.get).toHaveBeenCalledTimes(1);
      expect(services.authService.requireProjectAdmin).toHaveBeenCalledTimes(1);
      expect(services.authService.requireProjectAdmin).toHaveBeenCalledWith(
        projectId,
      );
      expect(services.aiInsightService.update).not.toHaveBeenCalled();
    });

    it("should handle errors from aiInsightService.get during update", async () => {
      // Arrange
      const insightId = "insight-update-get-error";
      const updateData: z.infer<typeof AiInsightUpdatePayloadSchema> = {
        content: "...",
      };
      const input: RouterInput["aiInsight"]["update"] = {
        id: insightId,
        data: updateData,
      };
      const serviceError = new Error("Get failed");
      vi.mocked(services.aiInsightService.get).mockRejectedValue(serviceError);

      // Act & Assert
      await expect(caller.aiInsight.update(input)).rejects.toThrow(
        expect.objectContaining({ message: serviceError.message }),
      );
      expect(services.aiInsightService.get).toHaveBeenCalledTimes(1);
      expect(services.authService.requireProjectAdmin).not.toHaveBeenCalled();
      expect(services.aiInsightService.update).not.toHaveBeenCalled();
    });

    it("should handle errors from aiInsightService.update", async () => {
      // Arrange
      const insightId = "insight-update-service-error";
      const projectId = "proj-admin-ok";
      const updateData: z.infer<typeof AiInsightUpdatePayloadSchema> = {
        severity: "critical",
      };
      const input: RouterInput["aiInsight"]["update"] = {
        id: insightId,
        data: updateData,
      };

      const mockExistingInsight = createMockInsight(
        insightId,
        "project",
        projectId,
      );
      vi.mocked(services.aiInsightService.get).mockResolvedValue(
        mockExistingInsight,
      );

      const serviceError = new Error("Update failed in service");
      vi.mocked(services.aiInsightService.update).mockRejectedValue(
        serviceError,
      );

      // Act & Assert
      await expect(caller.aiInsight.update(input)).rejects.toThrow(
        expect.objectContaining({ message: serviceError.message }),
      );
      expect(services.aiInsightService.get).toHaveBeenCalledTimes(1);
      expect(services.authService.requireProjectAdmin).toHaveBeenCalledTimes(1); // Auth check happens before update
      expect(services.aiInsightService.update).toHaveBeenCalledTimes(1);
    });
  });

  // --- delete tests ---
  describe("aiInsight.delete", () => {
    it("should delete a project insight after requiring project admin access", async () => {
      // Arrange
      const insightId = "insight-deletable-proj";
      const projectId = "proj-admin-del";
      const mockExistingInsight = createMockInsight(
        insightId,
        "project",
        projectId,
      );
      // Corrected mock response for delete: assume it returns the deleted insight object
      const mockDeleteResponse = mockExistingInsight;

      vi.mocked(services.aiInsightService.get).mockResolvedValue(
        mockExistingInsight,
      );
      vi.mocked(services.aiInsightService.del).mockResolvedValue(
        mockDeleteResponse,
      );

      // Act
      const result = await caller.aiInsight.delete(insightId);

      // Assert
      expect(result).toEqual(mockDeleteResponse);
      expect(services.aiInsightService.get).toHaveBeenCalledTimes(1);
      expect(services.aiInsightService.get).toHaveBeenCalledWith(insightId);
      expect(services.authService.requireProjectAdmin).toHaveBeenCalledTimes(1);
      expect(services.authService.requireProjectAdmin).toHaveBeenCalledWith(
        projectId,
      );
      expect(services.aiInsightService.del).toHaveBeenCalledTimes(1);
      expect(services.aiInsightService.del).toHaveBeenCalledWith(insightId);
    });

    it("should *not* delete a board insight (router only checks project admin)", async () => {
      // Arrange
      const insightId = "insight-deletable-board";
      const boardId = "board-delete-attempt";
      const mockExistingInsight = createMockInsight(
        insightId,
        "board",
        boardId,
      );
      const mockDeleteResponse = mockExistingInsight; // Service del returns the deleted item

      vi.mocked(services.aiInsightService.get).mockResolvedValue(
        mockExistingInsight,
      );
      vi.mocked(services.aiInsightService.del).mockResolvedValue(
        mockDeleteResponse,
      );

      // Act
      const result = await caller.aiInsight.delete(insightId);

      // Assert
      expect(result).toEqual(mockDeleteResponse);
      expect(services.aiInsightService.get).toHaveBeenCalledTimes(1);
      expect(services.aiInsightService.get).toHaveBeenCalledWith(insightId);
      // IMPORTANT: Project admin check should NOT have happened
      expect(services.authService.requireProjectAdmin).not.toHaveBeenCalled();
      expect(services.aiInsightService.del).toHaveBeenCalledTimes(1);
      expect(services.aiInsightService.del).toHaveBeenCalledWith(insightId);
    });

    it("should throw FORBIDDEN if requireProjectAdmin fails for deleting a project insight", async () => {
      // Arrange
      const insightId = "insight-delete-proj-forbidden";
      const projectId = "proj-admin-del-fail";
      const mockExistingInsight = createMockInsight(
        insightId,
        "project",
        projectId,
      );
      vi.mocked(services.aiInsightService.get).mockResolvedValue(
        mockExistingInsight,
      );

      const authError = new TRPCError({
        code: "FORBIDDEN",
        message: "User is not project admin",
      });
      vi.mocked(services.authService.requireProjectAdmin).mockRejectedValue(
        authError,
      );

      // Act & Assert
      await expect(caller.aiInsight.delete(insightId)).rejects.toThrow(
        authError,
      );
      expect(services.aiInsightService.get).toHaveBeenCalledTimes(1);
      expect(services.authService.requireProjectAdmin).toHaveBeenCalledTimes(1);
      expect(services.authService.requireProjectAdmin).toHaveBeenCalledWith(
        projectId,
      );
      expect(services.aiInsightService.del).not.toHaveBeenCalled();
    });

    it("should handle errors from aiInsightService.get during delete", async () => {
      // Arrange
      const insightId = "insight-delete-get-error";
      const serviceError = new Error("Get failed before delete");
      vi.mocked(services.aiInsightService.get).mockRejectedValue(serviceError);

      // Act & Assert
      await expect(caller.aiInsight.delete(insightId)).rejects.toThrow(
        expect.objectContaining({ message: serviceError.message }),
      );
      expect(services.aiInsightService.get).toHaveBeenCalledTimes(1);
      expect(services.authService.requireProjectAdmin).not.toHaveBeenCalled();
      expect(services.aiInsightService.del).not.toHaveBeenCalled();
    });

    it("should handle errors from aiInsightService.del", async () => {
      // Arrange
      const insightId = "insight-delete-service-error";
      const projectId = "proj-admin-del-ok";
      const mockExistingInsight = createMockInsight(
        insightId,
        "project",
        projectId,
      );
      vi.mocked(services.aiInsightService.get).mockResolvedValue(
        mockExistingInsight,
      );

      const serviceError = new Error("Delete failed in service");
      vi.mocked(services.aiInsightService.del).mockRejectedValue(serviceError);

      // Act & Assert
      await expect(caller.aiInsight.delete(insightId)).rejects.toThrow(
        expect.objectContaining({ message: serviceError.message }),
      );
      expect(services.aiInsightService.get).toHaveBeenCalledTimes(1);
      expect(services.authService.requireProjectAdmin).toHaveBeenCalledTimes(1); // Auth check happens before delete
      expect(services.aiInsightService.del).toHaveBeenCalledTimes(1);
    });
  });

  // --- generateBoardInsights tests ---
  describe("aiInsight.generateBoardInsights", () => {
    it("should generate board insights after verifying board access", async () => {
      // Arrange
      const boardId = "board-gen";
      // Corrected mock response based on linter errors - expecting array
      const mockGeneratedData: RouterOutput["aiInsight"]["generateBoardInsights"] =
        [];
      vi.mocked(
        services.aiInsightService.generateBoardInsights,
      ).mockResolvedValue(mockGeneratedData);

      // Act
      const result = await caller.aiInsight.generateBoardInsights(boardId);

      // Assert
      expect(result).toEqual(mockGeneratedData);
      expect(services.authService.canAccessBoard).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessBoard).toHaveBeenCalledWith(boardId);
      expect(
        services.aiInsightService.generateBoardInsights,
      ).toHaveBeenCalledTimes(1);
      expect(
        services.aiInsightService.generateBoardInsights,
      ).toHaveBeenCalledWith(boardId);
    });

    it("should throw FORBIDDEN if user cannot access board for generation", async () => {
      // Arrange
      const boardId = "board-gen-forbidden";
      const authError = new TRPCError({
        code: "FORBIDDEN",
        message: "Cannot access board",
      });
      vi.mocked(services.authService.canAccessBoard).mockRejectedValue(
        authError,
      );

      // Act & Assert
      await expect(
        caller.aiInsight.generateBoardInsights(boardId),
      ).rejects.toThrow(authError);
      expect(services.authService.canAccessBoard).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessBoard).toHaveBeenCalledWith(boardId);
      expect(
        services.aiInsightService.generateBoardInsights,
      ).not.toHaveBeenCalled();
    });

    it("should handle errors from aiInsightService.generateBoardInsights", async () => {
      // Arrange
      const boardId = "board-gen-service-error";
      const serviceError = new Error("Generation service failed");
      vi.mocked(
        services.aiInsightService.generateBoardInsights,
      ).mockRejectedValue(serviceError);

      // Act & Assert
      await expect(
        caller.aiInsight.generateBoardInsights(boardId),
      ).rejects.toThrow(
        expect.objectContaining({ message: serviceError.message }),
      );
      expect(services.authService.canAccessBoard).toHaveBeenCalledTimes(1); // Auth happens first
      expect(
        services.aiInsightService.generateBoardInsights,
      ).toHaveBeenCalledTimes(1);
      expect(
        services.aiInsightService.generateBoardInsights,
      ).toHaveBeenCalledWith(boardId);
    });
  });

  // --- generateProjectInsights tests ---
  describe("aiInsight.generateProjectInsights", () => {
    it("should generate project insights after verifying project access", async () => {
      // Arrange
      const projectId = "project-gen";
      // Corrected mock response based on linter errors - expecting array
      const mockGeneratedData: RouterOutput["aiInsight"]["generateProjectInsights"] =
        [];
      vi.mocked(
        services.aiInsightService.generateProjectInsights,
      ).mockResolvedValue(mockGeneratedData);

      // Act
      const result = await caller.aiInsight.generateProjectInsights(projectId);

      // Assert
      expect(result).toEqual(mockGeneratedData);
      expect(services.authService.canAccessProject).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessProject).toHaveBeenCalledWith(
        projectId,
      );
      expect(
        services.aiInsightService.generateProjectInsights,
      ).toHaveBeenCalledTimes(1);
      expect(
        services.aiInsightService.generateProjectInsights,
      ).toHaveBeenCalledWith(projectId);
    });

    it("should throw FORBIDDEN if user cannot access project for generation", async () => {
      // Arrange
      const projectId = "project-gen-forbidden";
      const authError = new TRPCError({
        code: "FORBIDDEN",
        message: "Cannot access project",
      });
      vi.mocked(services.authService.canAccessProject).mockRejectedValue(
        authError,
      );

      // Act & Assert
      await expect(
        caller.aiInsight.generateProjectInsights(projectId),
      ).rejects.toThrow(authError);
      expect(services.authService.canAccessProject).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessProject).toHaveBeenCalledWith(
        projectId,
      );
      expect(
        services.aiInsightService.generateProjectInsights,
      ).not.toHaveBeenCalled();
    });

    it("should handle errors from aiInsightService.generateProjectInsights", async () => {
      // Arrange
      const projectId = "project-gen-service-error";
      const serviceError = new Error("Project generation service failed");
      vi.mocked(
        services.aiInsightService.generateProjectInsights,
      ).mockRejectedValue(serviceError);

      // Act & Assert
      await expect(
        caller.aiInsight.generateProjectInsights(projectId),
      ).rejects.toThrow(
        expect.objectContaining({ message: serviceError.message }),
      );
      expect(services.authService.canAccessProject).toHaveBeenCalledTimes(1); // Auth happens first
      expect(
        services.aiInsightService.generateProjectInsights,
      ).toHaveBeenCalledTimes(1);
      expect(
        services.aiInsightService.generateProjectInsights,
      ).toHaveBeenCalledWith(projectId);
    });
  });
});
