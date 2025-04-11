import { auth } from "@clerk/nextjs/server";
import { describe, beforeEach, it, expect, vi } from "vitest";
import { and, count, desc, eq } from "drizzle-orm";

import { mockDb, mockTx } from "../../../../test/mocks";
import { history } from "../../db/schema";
import { HistoryService } from "../history.service";

// Mock Clerk auth
vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

describe("HistoryService", () => {
  let historyService: HistoryService;
  let mockProjectUserService: any;

  beforeEach(() => {
    // Create mock ProjectUserService
    mockProjectUserService = {
      getCurrentProjectUser: vi.fn().mockResolvedValue({
        id: "project-user-123",
        userId: "user-123",
        projectId: "project-123",
        role: "admin",
      }),
    };

    // Create a new instance of HistoryService before each test
    historyService = new HistoryService(mockDb, mockProjectUserService);

    // Reset all mocks
    vi.resetAllMocks();

    // Default auth mock
    vi.mocked(auth).mockReturnValue({
      userId: "user-123",
    } as any);
  });

  describe("create", () => {
    it("should create a new history entry", async () => {
      // Setup
      const historyData = {
        entityType: "card" as const,
        entityId: "123",
        action: "create" as const,
        projectId: "project-123",
        changes: JSON.stringify({ title: "New Card" }),
      };

      const historyEntry = {
        id: "history-123",
        ...historyData,
        performedById: "project-user-123",
        createdAt: new Date(),
      };

      // Mock insert operation
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([historyEntry]),
        }),
      } as any);

      // Execute
      const result = await historyService.create(historyData);

      // Assert
      expect(result).toEqual(historyEntry);
      expect(mockDb.insert).toHaveBeenCalledWith(history);
      expect(mockDb.insert(history).values).toHaveBeenCalledWith({
        ...historyData,
        performedById: undefined,
      });
      expect(mockProjectUserService.getCurrentProjectUser).toHaveBeenCalledWith(
        "project-123",
        mockDb,
      );
    });

    it("should create history entry without performedById if getCurrentProjectUser fails", async () => {
      // Setup
      const historyData = {
        entityType: "card" as const,
        entityId: "123",
        action: "create" as const,
        projectId: "project-123",
        changes: JSON.stringify({ title: "New Card" }),
      };

      const historyEntry = {
        id: "history-123",
        ...historyData,
        performedById: undefined,
        createdAt: new Date(),
      };

      // Mock getCurrentProjectUser to throw an error
      mockProjectUserService.getCurrentProjectUser.mockRejectedValue(
        new Error("User not found"),
      );

      // Mock insert operation
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([historyEntry]),
        }),
      } as any);

      // Execute
      const result = await historyService.create(historyData);

      // Assert
      expect(result).toEqual(historyEntry);
      expect(mockDb.insert(history).values).toHaveBeenCalledWith({
        ...historyData,
        performedById: undefined,
      });
    });

    it("should throw if insert fails", async () => {
      // Setup
      const historyData = {
        entityType: "card" as const,
        entityId: "123",
        action: "create" as const,
        projectId: "project-123",
      };

      // Mock insert operation to return empty array
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      } as any);

      // Assert
      await expect(historyService.create(historyData)).rejects.toThrow(
        "Failed to create history entry",
      );
    });

    it("should use transaction when provided", async () => {
      // Setup
      const historyData = {
        entityType: "card" as const,
        entityId: "123",
        action: "create" as const,
        projectId: "project-123",
      };

      const historyEntry = {
        id: "history-123",
        ...historyData,
        performedById: "project-user-123",
        createdAt: new Date(),
      };

      // Mock transaction insert operation
      mockTx.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([historyEntry]),
        }),
      } as any);

      // Execute
      const result = await historyService.create(historyData, mockTx);

      // Assert
      expect(result).toEqual(historyEntry);
      expect(mockTx.insert).toHaveBeenCalledWith(history);
      expect(mockProjectUserService.getCurrentProjectUser).toHaveBeenCalledWith(
        "project-123",
        mockTx,
      );
      // Ensure DB wasn't used directly
      expect(mockDb.insert).not.toHaveBeenCalled();
    });
  });

  describe("get", () => {
    it("should get a history entry by ID", async () => {
      // Setup
      const historyId = "history-123";
      const historyEntry = {
        id: historyId,
        entityType: "card",
        entityId: "123",
        action: "create",
        projectId: "project-123",
        project: { id: "project-123", name: "Test Project" },
        performedBy: {
          id: "project-user-123",
          user: { id: "user-123", name: "Test User" },
        },
        createdAt: new Date(),
      };

      // Mock query operations
      mockDb.query = {
        history: {
          findFirst: vi.fn().mockResolvedValue(historyEntry),
        },
      } as any;

      // Execute
      const result = await historyService.get(historyId);

      // Assert
      expect(result).toEqual(historyEntry);
      expect(mockDb.query.history.findFirst).toHaveBeenCalledWith({
        where: eq(history.id, historyId),
        with: {
          project: true,
          performedBy: {
            with: {
              user: true,
            },
          },
        },
      });
    });

    it("should throw if history entry not found", async () => {
      // Setup
      const historyId = "nonexistent-history";

      // Mock query operations to return null (not found)
      mockDb.query = {
        history: {
          findFirst: vi.fn().mockResolvedValue(null),
        },
      } as any;

      // Assert
      await expect(historyService.get(historyId)).rejects.toThrow(
        "History entry not found",
      );
    });
  });

  describe("listByEntity", () => {
    it("should list history entries for a specific entity", async () => {
      // Setup
      const entityType = "card";
      const entityId = "123";
      const historyEntries = [
        {
          id: "history-1",
          entityType,
          entityId,
          action: "create",
          performedBy: { user: { name: "Test User" } },
          createdAt: new Date(),
        },
        {
          id: "history-2",
          entityType,
          entityId,
          action: "update",
          performedBy: { user: { name: "Test User" } },
          createdAt: new Date(),
        },
      ];

      // Mock query operations
      mockDb.query = {
        history: {
          findMany: vi.fn().mockResolvedValue(historyEntries),
        },
      } as any;

      // Execute
      const result = await historyService.listByEntity(entityType, entityId);

      // Assert
      expect(result).toEqual(historyEntries);
      expect(mockDb.query.history.findMany).toHaveBeenCalledWith({
        where: and(
          eq(history.entityType, entityType),
          eq(history.entityId, entityId),
        ),
        orderBy: desc(history.createdAt),
        with: {
          performedBy: {
            with: {
              user: true,
            },
          },
        },
      });
    });
  });

  describe("listByProject", () => {
    it("should list history entries for a project", async () => {
      // Setup
      const projectId = "project-123";
      const historyEntries = [
        {
          id: "history-1",
          entityType: "board",
          entityId: "board-1",
          action: "create",
          projectId,
          performedBy: { user: { name: "Test User" } },
          createdAt: new Date(),
        },
        {
          id: "history-2",
          entityType: "card",
          entityId: "123",
          action: "update",
          projectId,
          performedBy: { user: { name: "Test User" } },
          createdAt: new Date(),
        },
      ];

      // Mock query operations
      mockDb.query = {
        history: {
          findMany: vi.fn().mockResolvedValue(historyEntries),
        },
      } as any;

      // Execute
      const result = await historyService.listByProject(projectId);

      // Assert
      expect(result).toEqual(historyEntries);
      expect(mockDb.query.history.findMany).toHaveBeenCalledWith({
        where: eq(history.projectId, projectId),
        orderBy: desc(history.createdAt),
        with: {
          performedBy: {
            with: {
              user: true,
            },
          },
        },
      });
    });
  });

  describe("listByProjectPaginated", () => {
    it("should list paginated history entries for a project", async () => {
      // Setup
      const projectId = "project-123";
      const limit = 5;
      const offset = 10;
      const totalCount = 25;

      const historyEntries = [
        {
          id: "history-1",
          entityType: "board",
          entityId: "board-1",
          action: "create",
          projectId,
          performedBy: { user: { name: "Test User" } },
          createdAt: new Date(),
        },
        {
          id: "history-2",
          entityType: "card",
          entityId: "123",
          action: "update",
          projectId,
          performedBy: { user: { name: "Test User" } },
          createdAt: new Date(),
        },
      ];

      // Mock operations
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ totalCount }]),
        }),
      } as any);

      mockDb.query = {
        history: {
          findMany: vi.fn().mockResolvedValue(historyEntries),
        },
      } as any;

      // Execute
      const result = await historyService.listByProjectPaginated(
        projectId,
        limit,
        offset,
      );

      // Assert
      expect(result).toEqual({
        items: historyEntries,
        pagination: {
          total: totalCount,
          limit,
          offset,
        },
      });

      expect(mockDb.select).toHaveBeenCalledWith({ totalCount: count() });
      expect(mockDb.select().from).toHaveBeenCalledWith(history);
      expect(mockDb.select().from(history).where).toHaveBeenCalledWith(
        eq(history.projectId, projectId),
      );

      expect(mockDb.query.history.findMany).toHaveBeenCalledWith({
        where: eq(history.projectId, projectId),
        orderBy: desc(history.createdAt),
        limit,
        offset,
        with: {
          performedBy: {
            with: {
              user: true,
            },
          },
        },
      });
    });
  });

  describe("recordProjectAction", () => {
    it("should create history entry for project action", async () => {
      // Setup
      const projectId = "project-123";
      const action = "create";
      const changes = JSON.stringify({ name: "New Project" });

      // Create a spy on the create method
      const createSpy = vi.spyOn(historyService, "create");
      createSpy.mockResolvedValue({ id: "history-123" } as any);

      // Execute
      await historyService.recordProjectAction(projectId, action, changes);

      // Assert
      expect(createSpy).toHaveBeenCalledWith(
        {
          entityType: "project",
          entityId: projectId,
          action,
          projectId,
          changes,
        },
        undefined,
      );
    });

    it("should use transaction when provided", async () => {
      // Setup
      const projectId = "project-123";
      const action = "update";

      // Create a spy on the create method
      const createSpy = vi.spyOn(historyService, "create");
      createSpy.mockResolvedValue({ id: "history-123" } as any);

      // Execute
      await historyService.recordProjectAction(
        projectId,
        action,
        undefined,
        mockTx,
      );

      // Assert
      expect(createSpy).toHaveBeenCalledWith(
        {
          entityType: "project",
          entityId: projectId,
          action,
          projectId,
          changes: undefined,
        },
        mockTx,
      );
    });
  });

  describe("recordBoardAction", () => {
    it("should create history entry for board action", async () => {
      // Setup
      const boardId = "board-123";
      const projectId = "project-123";
      const action = "create";
      const changes = JSON.stringify({ name: "New Board" });

      // Create a spy on the create method
      const createSpy = vi.spyOn(historyService, "create");
      createSpy.mockResolvedValue({ id: "history-123" } as any);

      // Execute
      await historyService.recordBoardAction(
        boardId,
        projectId,
        action,
        changes,
      );

      // Assert
      expect(createSpy).toHaveBeenCalledWith(
        {
          entityType: "board",
          entityId: boardId,
          action,
          projectId,
          changes,
        },
        undefined,
      );
    });
  });

  describe("recordColumnAction", () => {
    it("should create history entry for column action", async () => {
      // Setup
      const columnId = "column-123";
      const projectId = "project-123";
      const action = "create";
      const changes = JSON.stringify({ name: "New Column" });

      // Create a spy on the create method
      const createSpy = vi.spyOn(historyService, "create");
      createSpy.mockResolvedValue({ id: "history-123" } as any);

      // Execute
      await historyService.recordColumnAction(
        columnId,
        projectId,
        action,
        changes,
      );

      // Assert
      expect(createSpy).toHaveBeenCalledWith(
        {
          entityType: "column",
          entityId: columnId,
          action,
          projectId,
          changes,
        },
        undefined,
      );
    });
  });

  describe("recordCardAction", () => {
    it("should create history entry for card action", async () => {
      // Setup
      const cardId = 123;
      const projectId = "project-123";
      const action = "create";
      const changes = JSON.stringify({ title: "New Card" });

      // Create a spy on the create method
      const createSpy = vi.spyOn(historyService, "create");
      createSpy.mockResolvedValue({ id: "history-123" } as any);

      // Execute
      await historyService.recordCardAction(cardId, projectId, action, changes);

      // Assert
      expect(createSpy).toHaveBeenCalledWith(
        {
          entityType: "card",
          entityId: cardId.toString(),
          action,
          projectId,
          changes,
        },
        undefined,
      );
    });
  });
});
