import { describe, beforeEach, it, expect, vi } from "vitest";
import { eq } from "drizzle-orm";

import { mockDb, mockTx } from "../../../../test/mocks";
import { boards } from "../../db/schema";
import { BoardContextService } from "../board-context.service";

describe("BoardContextService", () => {
  let boardContextService: BoardContextService;

  beforeEach(() => {
    // Create a new instance of BoardContextService before each test
    boardContextService = new BoardContextService(mockDb);

    // Reset all mocks
    vi.resetAllMocks();
  });

  describe("getProjectId", () => {
    it("should get project ID for a given board ID", async () => {
      // Setup
      const boardId = "board-123";
      const projectId = "project-456";

      // Mock query operations
      mockDb.query = {
        boards: {
          findFirst: vi.fn().mockResolvedValue({
            projectId,
          }),
        },
      } as any;

      // Execute
      const result = await boardContextService.getProjectId(boardId);

      // Assert
      expect(result).toEqual(projectId);
      expect(mockDb.query.boards.findFirst).toHaveBeenCalledWith({
        where: eq(boards.id, boardId),
        columns: {
          projectId: true,
        },
      });
    });

    it("should throw if board not found", async () => {
      // Setup
      const boardId = "nonexistent-board";

      // Mock query operations to return null (not found)
      mockDb.query = {
        boards: {
          findFirst: vi.fn().mockResolvedValue(null),
        },
      } as any;

      // Assert
      await expect(boardContextService.getProjectId(boardId)).rejects.toThrow(
        `Board context not found for boardId: ${boardId}`,
      );
    });

    it("should use transaction when provided", async () => {
      // Setup
      const boardId = "board-123";
      const projectId = "project-456";

      // Mock transaction query operations
      mockTx.query = {
        boards: {
          findFirst: vi.fn().mockResolvedValue({
            projectId,
          }),
        },
      } as any;

      // Execute
      const result = await boardContextService.getProjectId(boardId, mockTx);

      // Assert
      expect(result).toEqual(projectId);
      expect(mockTx.query.boards.findFirst).toHaveBeenCalledWith({
        where: eq(boards.id, boardId),
        columns: {
          projectId: true,
        },
      });
      // Ensure DB wasn't used directly
      expect(mockDb.query.boards?.findFirst).not.toHaveBeenCalled();
    });
  });

  describe("getBoardDetails", () => {
    it("should get board details for a given board ID", async () => {
      // Setup
      const boardId = "board-123";
      const boardDetails = {
        id: boardId,
        name: "Test Board",
        projectId: "project-456",
      };

      // Mock query operations
      mockDb.query = {
        boards: {
          findFirst: vi.fn().mockResolvedValue(boardDetails),
        },
      } as any;

      // Execute
      const result = await boardContextService.getBoardDetails(boardId);

      // Assert
      expect(result).toEqual(boardDetails);
      expect(mockDb.query.boards.findFirst).toHaveBeenCalledWith({
        where: eq(boards.id, boardId),
        columns: {
          id: true,
          name: true,
          projectId: true,
        },
      });
    });

    it("should throw if board not found", async () => {
      // Setup
      const boardId = "nonexistent-board";

      // Mock query operations to return null (not found)
      mockDb.query = {
        boards: {
          findFirst: vi.fn().mockResolvedValue(null),
        },
      } as any;

      // Assert
      await expect(
        boardContextService.getBoardDetails(boardId),
      ).rejects.toThrow(`Board context not found for boardId: ${boardId}`);
    });

    it("should use transaction when provided", async () => {
      // Setup
      const boardId = "board-123";
      const boardDetails = {
        id: boardId,
        name: "Test Board",
        projectId: "project-456",
      };

      // Mock transaction query operations
      mockTx.query = {
        boards: {
          findFirst: vi.fn().mockResolvedValue(boardDetails),
        },
      } as any;

      // Execute
      const result = await boardContextService.getBoardDetails(boardId, mockTx);

      // Assert
      expect(result).toEqual(boardDetails);
      expect(mockTx.query.boards.findFirst).toHaveBeenCalledWith({
        where: eq(boards.id, boardId),
        columns: {
          id: true,
          name: true,
          projectId: true,
        },
      });
      // Ensure DB wasn't used directly
      expect(mockDb.query.boards?.findFirst).not.toHaveBeenCalled();
    });
  });
});
