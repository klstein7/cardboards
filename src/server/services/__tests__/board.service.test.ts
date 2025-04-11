import { auth } from "@clerk/nextjs/server";
import { describe, beforeEach, it, expect, vi } from "vitest";
import { count, eq } from "drizzle-orm";

import { mockDb, mockTx } from "../../../../test/mocks";
import { boards, cards, columns } from "../../db/schema";
import { BoardService } from "../board.service";
import { COLORS } from "~/lib/utils";

// Mock external dependencies
vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

vi.mock("ai", () => ({
  generateObject: vi.fn(),
}));

vi.mock("@ai-sdk/google", () => ({
  google: vi.fn(),
}));

describe("BoardService", () => {
  let boardService: BoardService;
  let mockCardService: any;
  let mockColumnService: any;
  let mockHistoryService: any;
  let mockNotificationService: any;
  let mockProjectService: any;
  let mockProjectUserService: any;

  beforeEach(() => {
    // Create mock services
    mockCardService = {
      list: vi.fn().mockResolvedValue([]),
      createMany: vi.fn().mockResolvedValue([]),
    };

    mockColumnService = {
      list: vi.fn().mockResolvedValue([]),
      createMany: vi.fn().mockResolvedValue([]),
    };

    mockHistoryService = {
      recordBoardAction: vi.fn().mockResolvedValue(undefined),
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
      list: vi.fn(),
    };

    // Set the default response for projectUserService.list
    mockProjectUserService.list.mockResolvedValue([
      { userId: "user-123", role: "admin" },
      { userId: "user-456", role: "member" },
    ]);

    // Create a new instance of BoardService before each test
    boardService = new BoardService(
      mockDb,
      mockCardService,
      mockColumnService,
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

  describe("create", () => {
    it("should create a board with default columns successfully", async () => {
      // Setup
      const boardData = {
        name: "Test Board",
        projectId: "project-123",
      };

      const createdBoard = {
        id: "board-123",
        ...boardData,
        color: COLORS.blue,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock database operations
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([createdBoard]),
        }),
      } as any);

      // Specifically mock projectUserService.list to return members for this test
      mockProjectUserService.list.mockResolvedValue([
        { userId: "user-123", role: "admin" },
        { userId: "user-456", role: "member" },
      ]);

      // Specifically mock projectService.get for this test
      mockProjectService.get.mockResolvedValue({
        id: "project-123",
        name: "Test Project",
      });

      // Execute
      const result = await boardService.create(boardData);

      // Assert
      expect(result).toEqual(createdBoard);
      expect(mockDb.insert).toHaveBeenCalledWith(boards);
      expect(mockHistoryService.recordBoardAction).toHaveBeenCalledWith(
        createdBoard.id,
        createdBoard.projectId,
        "create",
        undefined,
        expect.anything(),
      );
      expect(mockColumnService.createMany).toHaveBeenCalledWith(
        [
          expect.objectContaining({ name: "Todo", order: 0 }),
          expect.objectContaining({ name: "In Progress", order: 1 }),
          expect.objectContaining({
            name: "Done",
            order: 2,
            isCompleted: true,
          }),
        ],
        expect.anything(),
      );
      expect(mockNotificationService.createMany).toHaveBeenCalled();
    });

    it("should create a board with custom columns", async () => {
      // Setup
      const boardData = {
        name: "Test Board",
        projectId: "project-123",
      };

      const customColumns = [
        { name: "Backlog", order: 0, isCompleted: false },
        { name: "In Dev", order: 1, isCompleted: false },
        { name: "Testing", order: 2, isCompleted: false },
        { name: "Completed", order: 3, isCompleted: true },
      ];

      const createdBoard = {
        id: "board-123",
        ...boardData,
        color: COLORS.blue,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock database operations
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([createdBoard]),
        }),
      } as any);

      // Specifically mock projectUserService.list to return members for this test
      mockProjectUserService.list.mockResolvedValue([
        { userId: "user-123", role: "admin" },
        { userId: "user-456", role: "member" },
      ]);

      // Specifically mock projectService.get for this test
      mockProjectService.get.mockResolvedValue({
        id: "project-123",
        name: "Test Project",
      });

      // Execute
      const result = await boardService.create(boardData, customColumns);

      // Assert
      expect(result).toEqual(createdBoard);
      expect(mockColumnService.createMany).toHaveBeenCalledWith(
        customColumns.map((column) => ({
          ...column,
          boardId: createdBoard.id,
        })),
        expect.anything(),
      );
    });

    it("should throw an error if board creation fails", async () => {
      // Setup
      const boardData = {
        name: "Test Board",
        projectId: "project-123",
      };

      // Mock database operations to return empty array (creation failed)
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      } as any);

      // Assert
      await expect(boardService.create(boardData)).rejects.toThrow(
        "Failed to create board",
      );
    });
  });

  describe("list", () => {
    it("should list all boards for a project", async () => {
      // Setup
      const projectId = "project-123";
      const boardsList = [
        { id: "board-1", name: "Board 1", projectId, createdAt: new Date() },
        { id: "board-2", name: "Board 2", projectId, createdAt: new Date() },
      ];

      // Mock select operation
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(boardsList),
        }),
      } as any);

      // Execute
      const result = await boardService.list(projectId);

      // Assert
      expect(result).toEqual(boardsList);
      expect(mockDb.select).toHaveBeenCalled();
    });
  });

  describe("get", () => {
    it("should get a board by ID", async () => {
      // Setup
      const boardId = "board-123";
      const board = {
        id: boardId,
        name: "Test Board",
        projectId: "project-123",
        createdAt: new Date(),
      };

      // Mock select operation
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([board]),
        }),
      } as any);

      // Execute
      const result = await boardService.get(boardId);

      // Assert
      expect(result).toEqual(board);
      expect(mockDb.select).toHaveBeenCalled();
    });

    it("should throw if board not found", async () => {
      // Setup
      const boardId = "non-existent-id";

      // Mock select operation to return empty array (not found)
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      } as any);

      // Assert
      await expect(boardService.get(boardId)).rejects.toThrow(
        "Board not found",
      );
    });
  });

  describe("getWithDetails", () => {
    it("should get a board with all columns and cards", async () => {
      // Setup
      const boardId = "board-123";
      const board = {
        id: boardId,
        name: "Test Board",
        projectId: "project-123",
        createdAt: new Date(),
        updatedAt: new Date(),
        color: COLORS.blue,
      };

      const boardColumns = [
        { id: "column-1", name: "Todo", boardId, order: 0 },
        { id: "column-2", name: "In Progress", boardId, order: 1 },
        { id: "column-3", name: "Done", boardId, order: 2 },
      ];

      const columnCards = [
        { id: 1, title: "Card 1", columnId: "column-1" },
        { id: 2, title: "Card 2", columnId: "column-2" },
      ];

      // Create spies
      const getSpy = vi.spyOn(boardService, "get");
      getSpy.mockResolvedValue(board);

      mockColumnService.list.mockResolvedValue(boardColumns);

      // Mock card service to return different cards for each column
      boardColumns.forEach((column, index) => {
        if (index < 2) {
          // Only first two columns have cards
          mockCardService.list.mockResolvedValueOnce([columnCards[index]]);
        } else {
          mockCardService.list.mockResolvedValueOnce([]);
        }
      });

      // Execute
      const result = await boardService.getWithDetails(boardId);

      // Assert
      expect(result).toEqual({
        ...board,
        columns: boardColumns,
        cards: columnCards,
      });
      expect(getSpy).toHaveBeenCalledWith(boardId, expect.anything());
      expect(mockColumnService.list).toHaveBeenCalledWith(
        board.id,
        expect.anything(),
      );
      expect(mockCardService.list).toHaveBeenCalledTimes(boardColumns.length);
    });
  });

  describe("update", () => {
    it("should update a board successfully", async () => {
      // Setup
      const boardId = "board-123";
      const existingBoard = {
        id: boardId,
        name: "Old Name",
        projectId: "project-123",
        color: COLORS.blue,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updateData = {
        name: "New Name",
        color: COLORS.green,
      };

      const updatedBoard = {
        ...existingBoard,
        ...updateData,
        updatedAt: expect.any(Date),
      };

      // Mock query operations
      mockDb.query = {
        boards: {
          findFirst: vi.fn().mockResolvedValue(existingBoard),
        },
      } as any;

      // Mock update operation
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updatedBoard]),
          }),
        }),
      } as any);

      // Specifically mock projectUserService.list to return members for this test
      mockProjectUserService.list.mockResolvedValue([
        { userId: "user-123", role: "admin" },
        { userId: "user-456", role: "member" },
      ]);

      // Specifically mock projectService.get for this test
      mockProjectService.get.mockResolvedValue({
        id: "project-123",
        name: "Test Project",
      });

      // Mock select operation for member notifications
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ userId: "user-456" }]),
        }),
      } as any);

      // Execute
      const result = await boardService.update(boardId, updateData);

      // Assert
      expect(result).toEqual(updatedBoard);
      expect(mockDb.query.boards.findFirst).toHaveBeenCalled();
      expect(mockDb.update).toHaveBeenCalledWith(boards);
      expect(mockHistoryService.recordBoardAction).toHaveBeenCalledWith(
        boardId,
        updatedBoard.projectId,
        "update",
        expect.any(String),
        expect.anything(),
      );
      expect(mockNotificationService.createMany).toHaveBeenCalled();
    });

    it("should not send notifications if name wasn't changed", async () => {
      // Setup
      const boardId = "board-123";
      const existingBoard = {
        id: boardId,
        name: "Board Name",
        projectId: "project-123",
        color: COLORS.blue,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updateData = {
        color: COLORS.green, // Only color changed, not name
      };

      const updatedBoard = {
        ...existingBoard,
        ...updateData,
        updatedAt: expect.any(Date),
      };

      // Mock query operations
      mockDb.query = {
        boards: {
          findFirst: vi.fn().mockResolvedValue(existingBoard),
        },
      } as any;

      // Mock update operation
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updatedBoard]),
          }),
        }),
      } as any);

      // Execute
      await boardService.update(boardId, updateData);

      // Assert
      expect(mockNotificationService.createMany).not.toHaveBeenCalled();
    });

    it("should throw if board not found", async () => {
      // Setup
      const boardId = "non-existent-id";
      const updateData = { name: "New Name" };

      // Mock query operations to return null (not found)
      mockDb.query = {
        boards: {
          findFirst: vi.fn().mockResolvedValue(null),
        },
      } as any;

      // Assert
      await expect(boardService.update(boardId, updateData)).rejects.toThrow(
        "Board not found",
      );
    });
  });

  describe("del", () => {
    it("should delete a board and notify members", async () => {
      // Setup
      const boardId = "board-123";
      const board = {
        id: boardId,
        name: "Test Board",
        projectId: "project-123",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock query operations
      mockDb.query = {
        boards: {
          findFirst: vi.fn().mockResolvedValue(board),
        },
      } as any;

      // Specifically mock projectUserService.list to return members for this test
      mockProjectUserService.list.mockResolvedValue([
        { userId: "user-123", role: "admin" },
        { userId: "user-456", role: "member" },
      ]);

      // Specifically mock projectService.get for this test
      mockProjectService.get.mockResolvedValue({
        id: "project-123",
        name: "Test Project",
      });

      // Mock delete operation
      mockDb.delete.mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([board]),
        }),
      } as any);

      // Execute
      await boardService.del(boardId);

      // Assert
      expect(mockDb.query.boards.findFirst).toHaveBeenCalled();
      expect(mockProjectUserService.list).toHaveBeenCalledWith(
        board.projectId,
        expect.anything(),
      );
      expect(mockProjectService.get).toHaveBeenCalledWith(
        board.projectId,
        expect.anything(),
      );
      expect(mockNotificationService.createMany).toHaveBeenCalled();
      expect(mockDb.delete).toHaveBeenCalledWith(boards);
      expect(mockHistoryService.recordBoardAction).toHaveBeenCalledWith(
        board.id,
        board.projectId,
        "delete",
        expect.any(String),
        expect.anything(),
      );
    });

    it("should throw if board not found", async () => {
      // Setup
      const boardId = "non-existent-id";

      // Mock query operations to return null (not found)
      mockDb.query = {
        boards: {
          findFirst: vi.fn().mockResolvedValue(null),
        },
      } as any;

      // Assert
      await expect(boardService.del(boardId)).rejects.toThrow(
        "Board not found",
      );
    });

    it("should throw if delete operation fails", async () => {
      // Setup
      const boardId = "board-123";
      const board = {
        id: boardId,
        name: "Test Board",
        projectId: "project-123",
        createdAt: new Date(),
        updatedAt: new Date(),
        color: COLORS.blue,
      };

      // Mock query operations
      mockDb.query = {
        boards: {
          findFirst: vi.fn().mockResolvedValue(board),
        },
      } as any;

      // Specifically mock projectUserService.list to return members for this test
      mockProjectUserService.list.mockResolvedValue([
        { userId: "user-123", role: "admin" },
        { userId: "user-456", role: "member" },
      ]);

      // Specifically mock projectService.get for this test
      mockProjectService.get.mockResolvedValue({
        id: "project-123",
        name: "Test Project",
      });

      // Mock delete operation to return empty array (deletion failed)
      mockDb.delete.mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      } as any);

      // Assert
      await expect(boardService.del(boardId)).rejects.toThrow(
        "Failed to delete board",
      );
    });
  });

  describe("generate", () => {
    it("should generate a board with AI and create it", async () => {
      // Setup
      const projectId = "project-123";
      const prompt = "Create a project management board";

      // Mock AI generation with all required properties
      const aiResponse = {
        object: {
          name: "Project Management",
          columns: [
            {
              name: "Backlog",
              order: 0,
              isCompleted: false,
              cards: [
                {
                  title: "EXAMPLE: Set up project repo",
                  description: "<p>Initial setup</p>",
                  priority: "medium",
                },
              ],
            },
            { name: "In Progress", order: 1, isCompleted: false, cards: [] },
            { name: "Done", order: 2, isCompleted: true, cards: [] },
          ],
        },
        finishReason: "stop",
        usage: { promptTokens: 100, completionTokens: 100, totalTokens: 200 },
        warnings: [],
        request: {} as any,
        response: {} as any, // Added missing properties
        data: [] as any[],
        config: {} as any,
        raw: {} as any,
      };

      const { generateObject } = await import("ai");
      vi.mocked(generateObject).mockResolvedValue(aiResponse as any);

      const createdBoard = {
        id: "board-123",
        name: aiResponse.object.name,
        projectId,
        createdAt: new Date(),
        updatedAt: new Date(),
        color: COLORS.blue,
      };

      const boardColumn = {
        id: "column-1",
        name: "Backlog",
        boardId: createdBoard.id,
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: null,
        isCompleted: false,
      };

      // Create spies
      const createSpy = vi.spyOn(boardService, "create");
      createSpy.mockResolvedValue(createdBoard as any);

      const getWithDetailsSpy = vi.spyOn(boardService, "getWithDetails");
      getWithDetailsSpy.mockResolvedValue({
        ...createdBoard,
        columns: [boardColumn],
        cards: [],
      } as any);

      mockColumnService.list.mockResolvedValue([boardColumn]);

      // Execute
      const result = await boardService.generate(projectId, prompt);

      // Assert
      expect(generateObject).toHaveBeenCalled();
      expect(createSpy).toHaveBeenCalledWith(
        { name: aiResponse.object.name, projectId },
        aiResponse.object.columns,
        expect.anything(),
      );
      expect(mockCardService.createMany).toHaveBeenCalled();
      expect(getWithDetailsSpy).toHaveBeenCalledWith(
        createdBoard.id,
        expect.anything(),
      );
    });
  });

  describe("countByProjectId", () => {
    it("should count boards in a project", async () => {
      // Setup
      const projectId = "project-123";

      // Mock select operation
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 3 }]),
        }),
      } as any);

      // Execute
      const result = await boardService.countByProjectId(projectId);

      // Assert
      expect(result).toBe(3);
      expect(mockDb.select).toHaveBeenCalled();
    });

    it("should return 0 if no result", async () => {
      // Setup
      const projectId = "project-123";

      // Mock select operation to return empty array
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      } as any);

      // Execute
      const result = await boardService.countByProjectId(projectId);

      // Assert
      expect(result).toBe(0);
    });
  });
});
