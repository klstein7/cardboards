import { auth } from "@clerk/nextjs/server";
import { describe, beforeEach, it, expect, vi } from "vitest";
import { and, asc, eq, gte, sql } from "drizzle-orm";

import { mockDb, mockTx } from "../../../../test/mocks";
import { columns } from "../../db/schema";
import { ColumnService } from "../column.service";

// Mock Clerk auth
vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

describe("ColumnService", () => {
  let columnService: ColumnService;
  let mockBoardContextService: any;
  let mockHistoryService: any;
  let mockNotificationService: any;
  let mockProjectService: any;
  let mockProjectUserService: any;

  beforeEach(() => {
    // Create mock services
    mockBoardContextService = {
      getProjectId: vi.fn().mockResolvedValue("project-123"),
    };

    mockHistoryService = {
      recordColumnAction: vi.fn().mockResolvedValue(undefined),
    };

    mockNotificationService = {
      createMany: vi.fn().mockResolvedValue(undefined),
    };

    mockProjectService = {
      get: vi
        .fn()
        .mockResolvedValue({ id: "project-123", name: "Test Project" }),
    };

    mockProjectUserService = {
      list: vi.fn().mockResolvedValue([
        { userId: "user-123", role: "admin" },
        { userId: "user-456", role: "member" },
      ]),
    };

    // Create a new instance of ColumnService before each test
    columnService = new ColumnService(
      mockDb,
      mockBoardContextService,
      mockHistoryService,
      mockNotificationService,
      mockProjectService,
      mockProjectUserService,
    );

    // Reset all mocks
    vi.resetAllMocks();

    // Default auth mock
    vi.mocked(auth).mockReturnValue({
      userId: "user-123",
    } as any);
  });

  describe("get", () => {
    it("should get a column by ID", async () => {
      // Setup
      const columnId = "column-123";
      const column = {
        id: columnId,
        name: "Todo",
        boardId: "board-123",
        order: 0,
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: null,
      };

      // Mock query operations
      mockDb.query = {
        columns: {
          findFirst: vi.fn().mockResolvedValue(column),
        },
      } as any;

      // Execute
      const result = await columnService.get(columnId);

      // Assert
      expect(result).toEqual(column);
      expect(mockDb.query.columns.findFirst).toHaveBeenCalled();
    });

    it("should throw if column not found", async () => {
      // Setup
      const columnId = "non-existent-id";

      // Mock query operations to return null (not found)
      mockDb.query = {
        columns: {
          findFirst: vi.fn().mockResolvedValue(null),
        },
      } as any;

      // Assert
      await expect(columnService.get(columnId)).rejects.toThrow(
        "Column not found",
      );
    });
  });

  describe("create", () => {
    it("should create a column with calculated order", async () => {
      // Setup
      const boardId = "board-123";
      const columnData = {
        name: "In Progress",
        boardId,
        description: "Tasks being worked on",
      };

      const createdColumn = {
        id: "column-123",
        ...columnData,
        order: 1,
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock list to return existing columns
      const listSpy = vi.spyOn(columnService, "list");
      listSpy.mockResolvedValue([
        { order: 0, id: "column-0", name: "Todo", boardId },
      ] as any);

      // Mock insert operation
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([createdColumn]),
        }),
      } as any);

      // Mock boardContextService.getProjectId
      mockBoardContextService.getProjectId.mockResolvedValue("project-123");

      // Execute
      const result = await columnService.create(columnData);

      // Assert
      expect(result).toEqual(createdColumn);
      expect(mockDb.insert).toHaveBeenCalledWith(columns);
      expect(mockHistoryService.recordColumnAction).toHaveBeenCalledWith(
        createdColumn.id,
        "project-123",
        "create",
        undefined,
        expect.anything(),
      );
    });

    it("should create a column with specified order and shift existing columns", async () => {
      // Setup
      const boardId = "board-123";
      const columnData = {
        name: "Backlog",
        boardId,
        order: 0, // Insert at the beginning
      };

      const createdColumn = {
        id: "column-123",
        ...columnData,
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock list to return existing columns
      const listSpy = vi.spyOn(columnService, "list");
      listSpy.mockResolvedValue([
        { order: 0, id: "column-0", name: "Todo", boardId },
        { order: 1, id: "column-1", name: "In Progress", boardId },
      ] as any);

      // Mock update operation for shifting
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      } as any);

      // Mock insert operation
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([createdColumn]),
        }),
      } as any);

      // Execute
      const result = await columnService.create(columnData);

      // Assert
      expect(result).toEqual(createdColumn);
      expect(mockDb.update).toHaveBeenCalledWith(columns); // Should update existing columns
      expect(mockDb.insert).toHaveBeenCalledWith(columns);
    });

    it("should throw an error if column creation fails", async () => {
      // Setup
      const columnData = {
        name: "Todo",
        boardId: "board-123",
      };

      // Mock list to return empty columns
      const listSpy = vi.spyOn(columnService, "list");
      listSpy.mockResolvedValue([]);

      // Mock insert operation to return empty array (creation failed)
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      } as any);

      // Assert
      await expect(columnService.create(columnData)).rejects.toThrow(
        "Failed to create column",
      );
    });
  });

  describe("createMany", () => {
    it("should create multiple columns at once", async () => {
      // Setup
      const boardId = "board-123";
      const columnsData = [
        { name: "Todo", boardId, order: 0 },
        { name: "In Progress", boardId, order: 1 },
        { name: "Done", boardId, order: 2, isCompleted: true },
      ];

      // Mock insert operation
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      } as any);

      // Execute
      await columnService.createMany(columnsData);

      // Assert
      expect(mockDb.insert).toHaveBeenCalledWith(columns);
      expect(mockDb.insert(columns).values).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ name: "Todo", order: 0 }),
          expect.objectContaining({ name: "In Progress", order: 1 }),
          expect.objectContaining({ name: "Done", order: 2 }),
        ]),
      );
    });

    it("should add order property if not provided", async () => {
      // Setup
      const boardId = "board-123";
      const columnsData = [
        { name: "Todo", boardId },
        { name: "In Progress", boardId },
        { name: "Done", boardId, isCompleted: true },
      ];

      // Mock insert operation
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      } as any);

      // Execute
      await columnService.createMany(columnsData);

      // Assert
      expect(mockDb.insert).toHaveBeenCalledWith(columns);
      expect(mockDb.insert(columns).values).toHaveBeenCalledWith([
        { ...columnsData[0], order: 0 },
        { ...columnsData[1], order: 1 },
        { ...columnsData[2], order: 2 },
      ]);
    });
  });

  describe("list", () => {
    it("should list all columns for a board in order", async () => {
      // Setup
      const boardId = "board-123";
      const columnsList = [
        { id: "column-1", name: "Todo", boardId, order: 0 },
        { id: "column-2", name: "In Progress", boardId, order: 1 },
        { id: "column-3", name: "Done", boardId, order: 2 },
      ];

      // Mock query operations
      mockDb.query = {
        columns: {
          findMany: vi.fn().mockResolvedValue(columnsList),
        },
      } as any;

      // Execute
      const result = await columnService.list(boardId);

      // Assert
      expect(result).toEqual(columnsList);
      expect(mockDb.query.columns.findMany).toHaveBeenCalled();
    });
  });

  describe("getFirstColumnByBoardId", () => {
    it("should get the first column for a board", async () => {
      // Setup
      const boardId = "board-123";
      const columnsList = [
        { id: "column-1", name: "Todo", boardId, order: 0 },
        { id: "column-2", name: "In Progress", boardId, order: 1 },
      ];

      // Mock list to return columns
      const listSpy = vi.spyOn(columnService, "list");
      listSpy.mockResolvedValue(columnsList as any);

      // Execute
      const result = await columnService.getFirstColumnByBoardId(boardId);

      // Assert
      expect(result).toEqual(columnsList[0]);
      expect(listSpy).toHaveBeenCalledWith(boardId, expect.anything());
    });

    it("should throw if no columns found", async () => {
      // Setup
      const boardId = "board-123";

      // Mock list to return empty array
      const listSpy = vi.spyOn(columnService, "list");
      listSpy.mockResolvedValue([]);

      // Assert
      await expect(
        columnService.getFirstColumnByBoardId(boardId),
      ).rejects.toThrow("No columns found");
    });
  });

  describe("update", () => {
    it("should update a column successfully", async () => {
      // Setup
      const columnId = "column-123";
      const existingColumn = {
        id: columnId,
        name: "Old Name",
        boardId: "board-123",
        order: 0,
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: null,
      };

      const updateData = {
        name: "New Name",
        description: "Updated description",
      };

      const updatedColumn = {
        ...existingColumn,
        ...updateData,
      };

      // Mock get operation
      const getSpy = vi.spyOn(columnService, "get");
      getSpy.mockResolvedValue(existingColumn as any);

      // Mock update operation
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updatedColumn]),
          }),
        }),
      } as any);

      // Mock projectUserService.list for this test
      mockProjectUserService.list.mockResolvedValue([
        { userId: "user-123", role: "admin" },
        { userId: "user-456", role: "member" },
      ]);

      // Mock projectService.get for this test
      mockProjectService.get.mockResolvedValue({
        id: "project-123",
        name: "Test Project",
      });

      // Mock boardContextService.getProjectId for this test
      mockBoardContextService.getProjectId.mockResolvedValue("project-123");

      // Execute
      const result = await columnService.update(columnId, updateData);

      // Assert
      expect(result).toEqual(updatedColumn);
      expect(getSpy).toHaveBeenCalledWith(columnId, expect.anything());
      expect(mockDb.update).toHaveBeenCalledWith(columns);
      expect(mockHistoryService.recordColumnAction).toHaveBeenCalledWith(
        columnId,
        "project-123",
        "update",
        expect.any(String),
        expect.anything(),
      );
      expect(mockNotificationService.createMany).toHaveBeenCalled();
    });

    it("should not send notifications if name wasn't changed", async () => {
      // Setup
      const columnId = "column-123";
      const existingColumn = {
        id: columnId,
        name: "Column Name",
        boardId: "board-123",
        order: 0,
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: null,
      };

      const updateData = {
        name: "Column Name",
        description: "Updated description",
      };

      const updatedColumn = {
        ...existingColumn,
        ...updateData,
      };

      // Mock get operation
      const getSpy = vi.spyOn(columnService, "get");
      getSpy.mockResolvedValue(existingColumn as any);

      // Mock update operation
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updatedColumn]),
          }),
        }),
      } as any);

      // Execute
      await columnService.update(columnId, updateData);

      // Assert
      expect(mockNotificationService.createMany).not.toHaveBeenCalled();
    });
  });

  describe("del", () => {
    it("should delete a column and notify members", async () => {
      // Setup
      const columnId = "column-123";
      const column = {
        id: columnId,
        name: "Test Column",
        boardId: "board-123",
        order: 1,
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: null,
      };

      // Mock get operation
      const getSpy = vi.spyOn(columnService, "get");
      getSpy.mockResolvedValue(column as any);

      // Mock projectUserService.list for this test
      mockProjectUserService.list.mockResolvedValue([
        { userId: "user-123", role: "admin" },
        { userId: "user-456", role: "member" },
      ]);

      // Mock projectService.get for this test
      mockProjectService.get.mockResolvedValue({
        id: "project-123",
        name: "Test Project",
      });

      // Mock update operation (for shifting order)
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      } as any);

      // Mock delete operation
      mockDb.delete.mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([column]),
        }),
      } as any);

      // Mock boardContextService.getProjectId for this test
      mockBoardContextService.getProjectId.mockResolvedValue("project-123");

      // Execute
      const result = await columnService.del(columnId);

      // Assert
      expect(result).toEqual(column);
      expect(getSpy).toHaveBeenCalledWith(columnId, expect.anything());
      expect(mockProjectUserService.list).toHaveBeenCalledWith(
        "project-123",
        expect.anything(),
      );
      expect(mockProjectService.get).toHaveBeenCalledWith(
        "project-123",
        expect.anything(),
      );
      expect(mockNotificationService.createMany).toHaveBeenCalled();
      expect(mockDb.update).toHaveBeenCalledWith(columns); // For shifting
      expect(mockDb.delete).toHaveBeenCalledWith(columns);
      expect(mockHistoryService.recordColumnAction).toHaveBeenCalledWith(
        columnId,
        "project-123",
        "delete",
        expect.any(String),
        expect.anything(),
      );
    });

    it("should throw if deletion fails", async () => {
      // Setup
      const columnId = "column-123";
      const column = {
        id: columnId,
        name: "Test Column",
        boardId: "board-123",
        order: 1,
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: null,
      };

      // Mock get operation
      const getSpy = vi.spyOn(columnService, "get");
      getSpy.mockResolvedValue(column as any);

      // Mock projectUserService.list for this test
      mockProjectUserService.list.mockResolvedValue([
        { userId: "user-123", role: "admin" },
        { userId: "user-456", role: "member" },
      ]);

      // Mock projectService.get for this test
      mockProjectService.get.mockResolvedValue({
        id: "project-123",
        name: "Test Project",
      });

      // Mock update operation (for shifting order)
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      } as any);

      // Mock delete operation to return empty array
      mockDb.delete.mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      } as any);

      // Mock boardContextService.getProjectId for this test
      mockBoardContextService.getProjectId.mockResolvedValue("project-123");

      // Assert
      await expect(columnService.del(columnId)).rejects.toThrow(
        "Failed to delete column",
      );
    });
  });

  describe("shift", () => {
    it("should shift a column up", async () => {
      // Setup
      const columnId = "column-2";
      const column = {
        id: columnId,
        name: "In Progress",
        boardId: "board-123",
        order: 1,
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: null,
      };

      const allColumns = [
        { id: "column-1", name: "Todo", boardId: "board-123", order: 0 },
        column,
        { id: "column-3", name: "Done", boardId: "board-123", order: 2 },
      ];

      const updatedColumn = { ...column, order: 0 };

      // Mock get operation
      const getSpy = vi.spyOn(columnService, "get");
      getSpy.mockResolvedValueOnce(column as any);
      getSpy.mockResolvedValueOnce(updatedColumn as any);

      // Mock list operation
      const listSpy = vi.spyOn(columnService, "list");
      listSpy.mockResolvedValue(allColumns as any);

      // Mock first update operation (current column)
      mockDb.update.mockReturnValueOnce({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updatedColumn]),
          }),
        }),
      } as any);

      // Mock second update operation (adjacent column)
      mockDb.update.mockReturnValueOnce({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      } as any);

      // Mock boardContextService.getProjectId for shift test
      mockBoardContextService.getProjectId.mockResolvedValue("project-123");

      // Execute
      const result = await columnService.shift(columnId, { direction: "up" });

      // Assert
      expect(result).toEqual(updatedColumn);
      expect(getSpy).toHaveBeenCalledWith(columnId, expect.anything());
      expect(listSpy).toHaveBeenCalledWith(column.boardId, expect.anything());
      expect(mockDb.update).toHaveBeenCalledTimes(2);
      expect(mockHistoryService.recordColumnAction).toHaveBeenCalledWith(
        columnId,
        "project-123",
        "move",
        expect.any(String),
        expect.anything(),
      );
    });

    it("should shift a column down", async () => {
      // Setup
      const columnId = "column-1";
      const column = {
        id: columnId,
        name: "Todo",
        boardId: "board-123",
        order: 0,
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: null,
      };

      const allColumns = [
        column,
        { id: "column-2", name: "In Progress", boardId: "board-123", order: 1 },
        { id: "column-3", name: "Done", boardId: "board-123", order: 2 },
      ];

      const updatedColumn = { ...column, order: 1 };

      // Mock get operation
      const getSpy = vi.spyOn(columnService, "get");
      getSpy.mockResolvedValueOnce(column as any);
      getSpy.mockResolvedValueOnce(updatedColumn as any);

      // Mock list operation
      const listSpy = vi.spyOn(columnService, "list");
      listSpy.mockResolvedValue(allColumns as any);

      // Mock first update operation (current column)
      mockDb.update.mockReturnValueOnce({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updatedColumn]),
          }),
        }),
      } as any);

      // Mock second update operation (adjacent column)
      mockDb.update.mockReturnValueOnce({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      } as any);

      // Execute
      const result = await columnService.shift(columnId, { direction: "down" });

      // Assert
      expect(result).toEqual(updatedColumn);
      expect(mockDb.update).toHaveBeenCalledTimes(2);
    });

    it("should return the same column if already at the top and shifting up", async () => {
      // Setup
      const columnId = "column-1";
      const column = {
        id: columnId,
        name: "Todo",
        boardId: "board-123",
        order: 0,
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: null,
      };

      const allColumns = [
        column,
        { id: "column-2", name: "In Progress", boardId: "board-123", order: 1 },
        { id: "column-3", name: "Done", boardId: "board-123", order: 2 },
      ];

      // Mock get operation
      const getSpy = vi.spyOn(columnService, "get");
      getSpy.mockResolvedValue(column as any);

      // Mock list operation
      const listSpy = vi.spyOn(columnService, "list");
      listSpy.mockResolvedValue(allColumns as any);

      // Execute
      const result = await columnService.shift(columnId, { direction: "up" });

      // Assert
      expect(result).toEqual(column);
      expect(mockDb.update).not.toHaveBeenCalled();
    });
  });
});
