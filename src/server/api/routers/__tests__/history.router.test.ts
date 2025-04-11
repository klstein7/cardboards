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

// Mock Clerk auth
vi.mock("@clerk/nextjs/server", () => ({ auth: vi.fn() }));

import { type AppRouter, appRouter } from "~/server/api/routers";
import { services } from "~/server/services/container";
import {
  type HistoryListByEntity,
  type HistoryListByProject,
} from "~/server/zod";

// Mock the specific services used by the history router
vi.mock("~/server/services/container", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("~/server/services/container")>();
  return {
    ...original,
    services: {
      ...original.services,
      historyService: {
        listByEntity: vi.fn(),
        listByProject: vi.fn(),
        listByProjectPaginated: vi.fn(),
      },
      authService: {
        ...original.services.authService,
        canAccessProject: vi.fn(),
        canAccessBoard: vi.fn(),
        canAccessColumn: vi.fn(),
        canAccessCard: vi.fn(),
      },
    },
  };
});

describe("History Router", () => {
  const mockUserId = "user-test-history-123";
  let caller: ReturnType<typeof appRouter.createCaller>;

  type RouterInput = inferRouterInputs<AppRouter>;
  type RouterOutput = inferRouterOutputs<AppRouter>;

  // Base History Entry Type
  type MockHistoryEntry = {
    id: string;
    entityId: string;
    entityType:
      | "user"
      | "project"
      | "board"
      | "column"
      | "card"
      | "project_user"
      | "card_comment"
      | "invitation";
    action: "create" | "update" | "delete" | "move";
    details: Record<string, unknown>;
    createdAt: Date;
    projectId: string | null;
    performedById: string | null;
    changes: string | null;
    performedBy: {
      id: string;
      name: string | null;
      image: string | null;
    } | null;
  };

  // Helper to create mock history entries
  const createMockHistoryEntry = (
    id: string,
    entityId: string,
    entityType:
      | "user"
      | "project"
      | "board"
      | "column"
      | "card"
      | "project_user"
      | "card_comment"
      | "invitation",
    action: "create" | "update" | "delete" | "move",
    overrides: Partial<MockHistoryEntry> = {},
  ): MockHistoryEntry => ({
    id,
    entityId,
    entityType,
    action,
    details: {},
    createdAt: new Date(),
    projectId: null,
    performedById: mockUserId,
    changes: null,
    performedBy: {
      id: mockUserId,
      name: "Test User",
      image: null,
    },
    ...overrides,
  });

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.mocked(auth).mockReturnValue({ userId: mockUserId } as any);
    const ctx = { userId: mockUserId };
    caller = appRouter.createCaller(ctx);

    // Default successful auth mocks
    vi.mocked(services.authService.canAccessProject).mockResolvedValue(
      {} as any,
    );
    vi.mocked(services.authService.canAccessBoard).mockResolvedValue({} as any);
    vi.mocked(services.authService.canAccessColumn).mockResolvedValue(
      {} as any,
    );
    vi.mocked(services.authService.canAccessCard).mockResolvedValue({} as any);
  });

  // --- Test Suites ---

  describe("history.getByEntity", () => {
    it("should get history for a project after verifying access", async () => {
      // Arrange
      const input: HistoryListByEntity = {
        entityType: "project",
        entityId: "project-1",
      };
      const mockHistoryEntries = [
        createMockHistoryEntry(
          "hist-1",
          input.entityId,
          input.entityType,
          "create",
        ),
        createMockHistoryEntry(
          "hist-2",
          input.entityId,
          input.entityType,
          "update",
        ),
      ];
      vi.mocked(services.historyService.listByEntity).mockResolvedValue(
        mockHistoryEntries as any,
      );

      // Act
      const result = await caller.history.getByEntity(input);

      // Assert
      expect(result).toEqual(mockHistoryEntries);
      expect(services.authService.canAccessProject).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessProject).toHaveBeenCalledWith(
        input.entityId,
      );
      expect(services.historyService.listByEntity).toHaveBeenCalledTimes(1);
      expect(services.historyService.listByEntity).toHaveBeenCalledWith(
        input.entityType,
        input.entityId,
      );
    });

    it("should get history for a board after verifying access", async () => {
      // Arrange
      const input: HistoryListByEntity = {
        entityType: "board",
        entityId: "board-1",
      };
      const mockHistoryEntries = [
        createMockHistoryEntry(
          "hist-1",
          input.entityId,
          input.entityType,
          "create",
        ),
      ];
      vi.mocked(services.historyService.listByEntity).mockResolvedValue(
        mockHistoryEntries as any,
      );

      // Act
      const result = await caller.history.getByEntity(input);

      // Assert
      expect(result).toEqual(mockHistoryEntries);
      expect(services.authService.canAccessBoard).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessBoard).toHaveBeenCalledWith(
        input.entityId,
      );
      expect(services.historyService.listByEntity).toHaveBeenCalledTimes(1);
      expect(services.historyService.listByEntity).toHaveBeenCalledWith(
        input.entityType,
        input.entityId,
      );
    });

    it("should get history for a column after verifying access", async () => {
      // Arrange
      const input: HistoryListByEntity = {
        entityType: "column",
        entityId: "column-1",
      };
      const mockHistoryEntries = [
        createMockHistoryEntry(
          "hist-1",
          input.entityId,
          input.entityType,
          "create",
        ),
      ];
      vi.mocked(services.historyService.listByEntity).mockResolvedValue(
        mockHistoryEntries as any,
      );

      // Act
      const result = await caller.history.getByEntity(input);

      // Assert
      expect(result).toEqual(mockHistoryEntries);
      expect(services.authService.canAccessColumn).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessColumn).toHaveBeenCalledWith(
        input.entityId,
      );
      expect(services.historyService.listByEntity).toHaveBeenCalledTimes(1);
      expect(services.historyService.listByEntity).toHaveBeenCalledWith(
        input.entityType,
        input.entityId,
      );
    });

    it("should get history for a card after verifying access", async () => {
      // Arrange
      const input: HistoryListByEntity = {
        entityType: "card",
        entityId: "123", // Card IDs are numbers but passed as strings in the input
      };
      const mockHistoryEntries = [
        createMockHistoryEntry(
          "hist-1",
          input.entityId,
          input.entityType,
          "create",
        ),
      ];
      vi.mocked(services.historyService.listByEntity).mockResolvedValue(
        mockHistoryEntries as any,
      );

      // Act
      const result = await caller.history.getByEntity(input);

      // Assert
      expect(result).toEqual(mockHistoryEntries);
      expect(services.authService.canAccessCard).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessCard).toHaveBeenCalledWith(
        Number(input.entityId),
      );
      expect(services.historyService.listByEntity).toHaveBeenCalledTimes(1);
      expect(services.historyService.listByEntity).toHaveBeenCalledWith(
        input.entityType,
        input.entityId,
      );
    });

    it("should throw if user doesn't have access to the entity", async () => {
      // Arrange
      const input: HistoryListByEntity = {
        entityType: "project",
        entityId: "project-1",
      };
      vi.mocked(services.authService.canAccessProject).mockRejectedValue(
        new TRPCError({ code: "FORBIDDEN" }),
      );

      // Act and Assert
      await expect(caller.history.getByEntity(input)).rejects.toThrow(
        TRPCError,
      );
      expect(services.historyService.listByEntity).not.toHaveBeenCalled();
    });
  });

  describe("history.getByProject", () => {
    it("should get history for a project after verifying access", async () => {
      // Arrange
      const input: HistoryListByProject = {
        projectId: "project-1",
      };
      const mockHistoryEntries = [
        createMockHistoryEntry("hist-1", "board-1", "board", "create", {
          details: { projectId: input.projectId },
        }),
        createMockHistoryEntry("hist-2", "card-1", "card", "update", {
          details: { projectId: input.projectId },
        }),
      ];
      vi.mocked(services.historyService.listByProject).mockResolvedValue(
        mockHistoryEntries as any,
      );

      // Act
      const result = await caller.history.getByProject(input);

      // Assert
      expect(result).toEqual(mockHistoryEntries);
      expect(services.authService.canAccessProject).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessProject).toHaveBeenCalledWith(
        input.projectId,
      );
      expect(services.historyService.listByProject).toHaveBeenCalledTimes(1);
      expect(services.historyService.listByProject).toHaveBeenCalledWith(
        input.projectId,
      );
    });

    it("should throw if user doesn't have access to the project", async () => {
      // Arrange
      const input: HistoryListByProject = {
        projectId: "project-1",
      };
      vi.mocked(services.authService.canAccessProject).mockRejectedValue(
        new TRPCError({ code: "FORBIDDEN" }),
      );

      // Act and Assert
      await expect(caller.history.getByProject(input)).rejects.toThrow(
        TRPCError,
      );
      expect(services.historyService.listByProject).not.toHaveBeenCalled();
    });
  });

  describe("history.getByProjectPaginated", () => {
    it("should get paginated history for a project after verifying access", async () => {
      // Arrange
      const input = {
        projectId: "project-1",
        limit: 10,
        offset: 0,
      };
      const mockHistoryEntries = {
        items: [
          createMockHistoryEntry("hist-1", "board-1", "board", "create", {
            details: { projectId: input.projectId },
          }),
          createMockHistoryEntry("hist-2", "card-1", "card", "update", {
            details: { projectId: input.projectId },
          }),
        ],
        pagination: {
          total: 25,
          limit: input.limit,
          offset: input.offset,
        },
      };
      vi.mocked(
        services.historyService.listByProjectPaginated,
      ).mockResolvedValue(mockHistoryEntries as any);

      // Act
      const result = await caller.history.getByProjectPaginated(input);

      // Assert
      expect(result).toEqual(mockHistoryEntries);
      expect(services.authService.canAccessProject).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessProject).toHaveBeenCalledWith(
        input.projectId,
      );
      expect(
        services.historyService.listByProjectPaginated,
      ).toHaveBeenCalledTimes(1);
      expect(
        services.historyService.listByProjectPaginated,
      ).toHaveBeenCalledWith(input.projectId, input.limit, input.offset);
    });

    it("should use default pagination values if not provided", async () => {
      // Arrange
      const input = {
        projectId: "project-1",
      };
      const defaultLimit = 10;
      const defaultOffset = 0;
      const mockHistoryEntries = {
        items: [
          createMockHistoryEntry("hist-1", "board-1", "board", "create", {
            details: { projectId: input.projectId },
          }),
        ],
        pagination: {
          total: 25,
          limit: defaultLimit,
          offset: defaultOffset,
        },
      };
      vi.mocked(
        services.historyService.listByProjectPaginated,
      ).mockResolvedValue(mockHistoryEntries as any);

      // Act
      const result = await caller.history.getByProjectPaginated(input);

      // Assert
      expect(result).toEqual(mockHistoryEntries);
      expect(
        services.historyService.listByProjectPaginated,
      ).toHaveBeenCalledWith(input.projectId, defaultLimit, defaultOffset);
    });

    it("should throw if user doesn't have access to the project", async () => {
      // Arrange
      const input = {
        projectId: "project-1",
        limit: 10,
        offset: 0,
      };
      vi.mocked(services.authService.canAccessProject).mockRejectedValue(
        new TRPCError({ code: "FORBIDDEN" }),
      );

      // Act and Assert
      await expect(caller.history.getByProjectPaginated(input)).rejects.toThrow(
        TRPCError,
      );
      expect(
        services.historyService.listByProjectPaginated,
      ).not.toHaveBeenCalled();
    });
  });
});
