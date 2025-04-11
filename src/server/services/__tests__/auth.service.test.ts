import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockDb, mockProjectUserService, mockTx } from "../../../../test/mocks";
import { boards, cards, columns, projectUsers } from "../../db/schema";
import { AuthService } from "../auth.service";

// Mock the Clerk auth module
vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

describe("AuthService", () => {
  let authService: AuthService;

  beforeEach(() => {
    // Create a new instance of AuthService before each test
    authService = new AuthService(mockDb, mockProjectUserService);

    // Reset the auth mock
    vi.mocked(auth).mockReturnValue({
      userId: "test-user-id",
    } as any);
  });

  describe("requireProjectAdmin", () => {
    it("should throw error if user is not admin", async () => {
      // Setup
      const projectId = "test-project-id";
      const projectUser = { role: "member" };

      // Mock the getCurrentProjectUser to return a non-admin user
      mockProjectUserService.getCurrentProjectUser.mockResolvedValue(
        projectUser as any,
      );

      // Assert that it throws the correct error
      await expect(authService.requireProjectAdmin(projectId)).rejects.toThrow(
        "Unauthorized: Admin access required",
      );

      // Verify the mock was called correctly
      expect(mockProjectUserService.getCurrentProjectUser).toHaveBeenCalledWith(
        projectId,
        mockDb,
      );
    });

    it("should return the project user if user is admin", async () => {
      // Setup
      const projectId = "test-project-id";
      const projectUser = { role: "admin" };

      // Mock the getCurrentProjectUser to return an admin user
      mockProjectUserService.getCurrentProjectUser.mockResolvedValue(
        projectUser as any,
      );

      // Assert that it returns the project user
      const result = await authService.requireProjectAdmin(projectId);
      expect(result).toEqual(projectUser);

      // Verify the mock was called correctly
      expect(mockProjectUserService.getCurrentProjectUser).toHaveBeenCalledWith(
        projectId,
        mockDb,
      );
    });
  });

  describe("canAccessProject", () => {
    it("should throw if userId is not available", async () => {
      // Setup - mock auth to return no userId
      vi.mocked(auth).mockReturnValue({
        userId: null,
      } as any);

      // Assert
      await expect(authService.canAccessProject("project-id")).rejects.toThrow(
        "Unauthorized: You must be logged in",
      );
    });

    it("should throw if user does not have access to project", async () => {
      // Setup
      const projectId = "test-project-id";
      const userId = "test-user-id";

      // Mock the select query to return an empty array (no project user found)
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      } as any);

      // Assert
      await expect(authService.canAccessProject(projectId)).rejects.toThrow(
        "Unauthorized: You don't have access to this project",
      );

      // Verify the mock was called correctly
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.select().from).toHaveBeenCalledWith(projectUsers);
    });

    it("should return project user if user has access", async () => {
      // Setup
      const projectId = "test-project-id";
      const userId = "test-user-id";
      const projectUser = { id: "pu-1", userId, projectId, role: "member" };

      // Mock the select query to return the project user
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([projectUser]),
        }),
      } as any);

      // Assert
      const result = await authService.canAccessProject(projectId);
      expect(result).toEqual(projectUser);

      // Verify the mocks were called correctly
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.select().from).toHaveBeenCalledWith(projectUsers);
      expect(mockDb.select().from(projectUsers).where).toHaveBeenCalledWith(
        and(
          eq(projectUsers.projectId, projectId),
          eq(projectUsers.userId, userId),
        ),
      );
    });
  });

  describe("canAccessBoard", () => {
    it("should throw if userId is not available", async () => {
      // Setup - mock auth to return no userId
      vi.mocked(auth).mockReturnValue({
        userId: null,
      } as any);

      // Assert
      await expect(authService.canAccessBoard("board-id")).rejects.toThrow(
        "Unauthorized: You must be logged in",
      );
    });

    it("should throw if board not found", async () => {
      // Setup
      const boardId = "test-board-id";

      // Mock the select query to return an empty array (no board found)
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      } as any);

      // Assert
      await expect(authService.canAccessBoard(boardId)).rejects.toThrow(
        "Board not found",
      );
    });

    it("should check project access and return board", async () => {
      // Setup
      const boardId = "test-board-id";
      const projectId = "test-project-id";
      const board = { id: boardId, projectId };

      // Mock the select query to return a board
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([board]),
        }),
      } as any);

      // Create a spy on canAccessProject
      const canAccessProjectSpy = vi.spyOn(authService, "canAccessProject");
      canAccessProjectSpy.mockResolvedValue({ id: "pu-1" } as any);

      // Assert
      const result = await authService.canAccessBoard(boardId);

      // Verify result
      expect(result).toEqual(board);

      // Verify canAccessProject was called with correct projectId
      expect(canAccessProjectSpy).toHaveBeenCalledWith(projectId, mockDb);
    });
  });

  describe("canAccessColumn", () => {
    it("should throw if userId is not available", async () => {
      // Setup - mock auth to return no userId
      vi.mocked(auth).mockReturnValue({
        userId: null,
      } as any);

      // Assert
      await expect(authService.canAccessColumn("column-id")).rejects.toThrow(
        "Unauthorized: You must be logged in",
      );
    });

    it("should throw if column not found", async () => {
      // Setup
      const columnId = "test-column-id";

      // Mock the select query to return an empty array (no column found)
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      } as any);

      // Assert
      await expect(authService.canAccessColumn(columnId)).rejects.toThrow(
        "Column not found",
      );
    });

    it("should check board access and return column", async () => {
      // Setup
      const columnId = "test-column-id";
      const boardId = "test-board-id";
      const column = { id: columnId, boardId };

      // Mock the select query to return a column
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([column]),
        }),
      } as any);

      // Create a spy on canAccessBoard
      const canAccessBoardSpy = vi.spyOn(authService, "canAccessBoard");
      canAccessBoardSpy.mockResolvedValue({ id: boardId } as any);

      // Assert
      const result = await authService.canAccessColumn(columnId);

      // Verify result
      expect(result).toEqual(column);

      // Verify canAccessBoard was called with correct boardId
      expect(canAccessBoardSpy).toHaveBeenCalledWith(boardId, mockDb);
    });
  });

  describe("canAccessCard", () => {
    it("should throw if userId is not available", async () => {
      // Setup - mock auth to return no userId
      vi.mocked(auth).mockReturnValue({
        userId: null,
      } as any);

      // Assert
      await expect(authService.canAccessCard(123)).rejects.toThrow(
        "Unauthorized: You must be logged in",
      );
    });

    it("should throw if card not found", async () => {
      // Setup
      const cardId = 123;

      // Mock the select query to return an empty array (no card found)
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      } as any);

      // Assert
      await expect(authService.canAccessCard(cardId)).rejects.toThrow(
        "Card not found",
      );
    });

    it("should check column access and return card", async () => {
      // Setup
      const cardId = 123;
      const columnId = "test-column-id";
      const card = { id: cardId, columnId };

      // Mock the select query to return a card
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([card]),
        }),
      } as any);

      // Create a spy on canAccessColumn
      const canAccessColumnSpy = vi.spyOn(authService, "canAccessColumn");
      canAccessColumnSpy.mockResolvedValue({ id: columnId } as any);

      // Assert
      const result = await authService.canAccessCard(cardId);

      // Verify result
      expect(result).toEqual(card);

      // Verify canAccessColumn was called with correct columnId
      expect(canAccessColumnSpy).toHaveBeenCalledWith(columnId, mockDb);
    });
  });

  describe("isProjectAdmin", () => {
    it("should return true if user is project admin", async () => {
      // Setup
      const projectId = "test-project-id";
      const projectUser = { role: "admin" };

      // Mock the getCurrentProjectUser to return an admin user
      mockProjectUserService.getCurrentProjectUser.mockResolvedValue(
        projectUser as any,
      );

      // Assert
      const result = await authService.isProjectAdmin(projectId);
      expect(result).toBe(true);
    });

    it("should return false if user is not project admin", async () => {
      // Setup
      const projectId = "test-project-id";
      const projectUser = { role: "member" };

      // Mock the getCurrentProjectUser to return a non-admin user
      mockProjectUserService.getCurrentProjectUser.mockResolvedValue(
        projectUser as any,
      );

      // Assert
      const result = await authService.isProjectAdmin(projectId);
      expect(result).toBe(false);
    });

    it("should return false if error occurs checking role", async () => {
      // Setup
      const projectId = "test-project-id";

      // Mock the getCurrentProjectUser to throw an error
      mockProjectUserService.getCurrentProjectUser.mockRejectedValue(
        new Error("Service error"),
      );

      // Assert
      const result = await authService.isProjectAdmin(projectId);
      expect(result).toBe(false);
    });
  });

  // Additional tests for other methods can be added here
});
