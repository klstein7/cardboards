import { describe, it, expect, vi, beforeEach } from "vitest";
import { auth } from "@clerk/nextjs/server";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

// Mock react's cache function
vi.mock("react", async (importOriginal) => {
  const actualReact = await importOriginal<typeof import("react")>();
  return {
    ...actualReact,
    cache: vi.fn((fn) => fn),
  };
});

// Mock pusher server
vi.mock("~/pusher/server", () => ({
  pusher: {
    trigger: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock Clerk auth
vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

import { type AppRouter, appRouter } from "~/server/api/routers";
import { services } from "~/server/services/container";
import { pusherChannels } from "~/pusher/channels"; // Import channels for verification
import {
  type BoardCreateSchema,
  type BoardUpdateSchema,
  type BoardGenerateSchema,
} from "~/server/zod"; // Import necessary schemas

// Mock the specific services used by the board router
vi.mock("~/server/services/container", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("~/server/services/container")>();
  return {
    ...original,
    services: {
      ...original.services,
      boardService: {
        create: vi.fn(),
        list: vi.fn(),
        get: vi.fn(),
        update: vi.fn(),
        del: vi.fn(),
        generate: vi.fn(),
        countByProjectId: vi.fn(),
      },
      // Ensure all needed authService methods are mocked
      authService: {
        ...original.services.authService, // Spread existing mocks if applicable
        requireProjectAdmin: vi.fn(),
        canAccessProject: vi.fn(),
        requireBoardAdmin: vi.fn(),
        canAccessBoard: vi.fn(),
      },
    },
  };
});

describe("Board Router", () => {
  const mockUserId = "user-test-board-123";
  let caller: ReturnType<typeof appRouter.createCaller>;
  let pusherMock: typeof import("~/pusher/server").pusher; // To access the mock

  type RouterInput = inferRouterInputs<AppRouter>;
  type RouterOutput = inferRouterOutputs<AppRouter>;

  // Helper to create mock board output
  const createMockBoard = (
    id: string,
    projectId: string,
    overrides: Partial<RouterOutput["board"]["get"]> = {},
  ): RouterOutput["board"]["get"] => ({
    id,
    projectId,
    name: `Board ${id}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
    color: overrides.color ?? "#ffffff",
  });

  beforeEach(async () => {
    vi.clearAllMocks();
    // Setup authenticated user context
    vi.mocked(auth).mockReturnValue({ userId: mockUserId } as any);
    const ctx = { userId: mockUserId };
    caller = appRouter.createCaller(ctx);

    // Import the pusher mock after vi.mock has run
    pusherMock = (await import("~/pusher/server")).pusher;

    // Default successful auth mocks
    vi.mocked(services.authService.requireProjectAdmin).mockResolvedValue(
      {} as any,
    );
    vi.mocked(services.authService.canAccessProject).mockResolvedValue(
      {} as any,
    );
    vi.mocked(services.authService.requireBoardAdmin).mockResolvedValue(
      {} as any,
    );
    vi.mocked(services.authService.canAccessBoard).mockResolvedValue({} as any);
  });

  // --- Test Suites for each procedure ---

  // 1. Create
  describe("board.create", () => {
    it("should create a board, trigger pusher, after requiring project admin", async () => {
      // Arrange
      const inputData: z.infer<typeof BoardCreateSchema> = {
        projectId: "proj-admin-ok",
        name: "New Test Board",
      };
      const mockCreatedBoard = createMockBoard(
        "board-new-1",
        inputData.projectId,
        { name: inputData.name },
      );
      vi.mocked(services.boardService.create).mockResolvedValue(
        mockCreatedBoard,
      );

      // Act
      const result = await caller.board.create(inputData);

      // Assert
      expect(result).toEqual(mockCreatedBoard);
      expect(services.authService.requireProjectAdmin).toHaveBeenCalledTimes(1);
      expect(services.authService.requireProjectAdmin).toHaveBeenCalledWith(
        inputData.projectId,
      );
      expect(services.boardService.create).toHaveBeenCalledTimes(1);
      expect(services.boardService.create).toHaveBeenCalledWith(inputData);

      // Verify pusher trigger
      expect(pusherMock.trigger).toHaveBeenCalledTimes(1);
      expect(pusherMock.trigger).toHaveBeenCalledWith(
        pusherChannels.board.name,
        pusherChannels.board.events.created.name,
        expect.objectContaining({
          input: mockCreatedBoard, // Router passes the created board as input to pusher
          returning: mockCreatedBoard,
          userId: mockUserId,
        }),
      );
    });

    it("should throw FORBIDDEN if requireProjectAdmin fails", async () => {
      // Arrange
      const inputData: z.infer<typeof BoardCreateSchema> = {
        projectId: "proj-admin-fail",
        name: "Forbidden Board",
      };
      const authError = new TRPCError({
        code: "FORBIDDEN",
        message: "Not project admin",
      });
      vi.mocked(services.authService.requireProjectAdmin).mockRejectedValue(
        authError,
      );

      // Act & Assert
      await expect(caller.board.create(inputData)).rejects.toThrow(authError);
      expect(services.authService.requireProjectAdmin).toHaveBeenCalledTimes(1);
      expect(services.authService.requireProjectAdmin).toHaveBeenCalledWith(
        inputData.projectId,
      );
      expect(services.boardService.create).not.toHaveBeenCalled();
      expect(pusherMock.trigger).not.toHaveBeenCalled();
    });

    it("should handle errors from boardService.create and not trigger pusher", async () => {
      // Arrange
      const inputData: z.infer<typeof BoardCreateSchema> = {
        projectId: "proj-service-error",
        name: "Error Board",
      };
      const serviceError = new Error("Database create failed");
      vi.mocked(services.boardService.create).mockRejectedValue(serviceError);

      // Act & Assert
      await expect(caller.board.create(inputData)).rejects.toThrow(
        expect.objectContaining({ message: serviceError.message }),
      );
      expect(services.authService.requireProjectAdmin).toHaveBeenCalledTimes(1); // Auth check happens first
      expect(services.boardService.create).toHaveBeenCalledTimes(1);
      expect(services.boardService.create).toHaveBeenCalledWith(inputData);
      expect(pusherMock.trigger).not.toHaveBeenCalled();
    });
  });

  // 2. List
  describe("board.list", () => {
    it("should list boards after verifying project access", async () => {
      // Arrange
      const projectId = "proj-listable";
      const mockBoards = [
        createMockBoard("board-1", projectId),
        createMockBoard("board-2", projectId),
      ];
      vi.mocked(services.boardService.list).mockResolvedValue(mockBoards);

      // Act
      const result = await caller.board.list(projectId);

      // Assert
      expect(result).toEqual(mockBoards);
      expect(services.authService.canAccessProject).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessProject).toHaveBeenCalledWith(
        projectId,
      );
      expect(services.boardService.list).toHaveBeenCalledTimes(1);
      expect(services.boardService.list).toHaveBeenCalledWith(projectId);
    });

    it("should throw FORBIDDEN if user cannot access the project", async () => {
      // Arrange
      const projectId = "proj-list-forbidden";
      const authError = new TRPCError({
        code: "FORBIDDEN",
        message: "Access Denied",
      });
      vi.mocked(services.authService.canAccessProject).mockRejectedValue(
        authError,
      );

      // Act & Assert
      await expect(caller.board.list(projectId)).rejects.toThrow(authError);
      expect(services.authService.canAccessProject).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessProject).toHaveBeenCalledWith(
        projectId,
      );
      expect(services.boardService.list).not.toHaveBeenCalled();
    });

    it("should handle errors from boardService.list", async () => {
      // Arrange
      const projectId = "proj-list-service-error";
      const serviceError = new Error("Database list failed");
      vi.mocked(services.boardService.list).mockRejectedValue(serviceError);

      // Act & Assert
      await expect(caller.board.list(projectId)).rejects.toThrow(
        expect.objectContaining({ message: serviceError.message }),
      );
      expect(services.authService.canAccessProject).toHaveBeenCalledTimes(1); // Auth check happens first
      expect(services.boardService.list).toHaveBeenCalledTimes(1);
      expect(services.boardService.list).toHaveBeenCalledWith(projectId);
    });
  });

  // 3. Get
  describe("board.get", () => {
    it("should get a board after verifying board access", async () => {
      // Arrange
      const boardId = "board-get-1";
      const mockBoard = createMockBoard(boardId, "proj-getable");
      vi.mocked(services.boardService.get).mockResolvedValue(mockBoard);

      // Act
      const result = await caller.board.get(boardId);

      // Assert
      expect(result).toEqual(mockBoard);
      expect(services.authService.canAccessBoard).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessBoard).toHaveBeenCalledWith(boardId);
      expect(services.boardService.get).toHaveBeenCalledTimes(1);
      expect(services.boardService.get).toHaveBeenCalledWith(boardId);
    });

    it("should throw FORBIDDEN if user cannot access the board", async () => {
      // Arrange
      const boardId = "board-get-forbidden";
      const authError = new TRPCError({
        code: "FORBIDDEN",
        message: "Access Denied",
      });
      vi.mocked(services.authService.canAccessBoard).mockRejectedValue(
        authError,
      );

      // Act & Assert
      await expect(caller.board.get(boardId)).rejects.toThrow(authError);
      expect(services.authService.canAccessBoard).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessBoard).toHaveBeenCalledWith(boardId);
      expect(services.boardService.get).not.toHaveBeenCalled();
    });

    it("should handle errors from boardService.get", async () => {
      // Arrange
      const boardId = "board-get-service-error";
      const serviceError = new Error("Board not found");
      vi.mocked(services.boardService.get).mockRejectedValue(serviceError);

      // Act & Assert
      await expect(caller.board.get(boardId)).rejects.toThrow(
        expect.objectContaining({ message: serviceError.message }),
      );
      expect(services.authService.canAccessBoard).toHaveBeenCalledTimes(1); // Auth check happens first
      expect(services.boardService.get).toHaveBeenCalledTimes(1);
      expect(services.boardService.get).toHaveBeenCalledWith(boardId);
    });
  });

  // 4. Update
  describe("board.update", () => {
    it("should update a board, trigger pusher, after requiring board admin", async () => {
      // Arrange
      const inputData: z.infer<typeof BoardUpdateSchema> = {
        boardId: "board-update-1",
        data: { name: "Updated Board Name" },
      };
      const mockUpdatedBoard = createMockBoard(
        inputData.boardId,
        "proj-updateable",
        inputData.data,
      );
      vi.mocked(services.boardService.update).mockResolvedValue(
        mockUpdatedBoard,
      );

      // Act
      const result = await caller.board.update(inputData);

      // Assert
      expect(result).toEqual(mockUpdatedBoard);
      expect(services.authService.requireBoardAdmin).toHaveBeenCalledTimes(1);
      expect(services.authService.requireBoardAdmin).toHaveBeenCalledWith(
        inputData.boardId,
      );
      expect(services.boardService.update).toHaveBeenCalledTimes(1);
      expect(services.boardService.update).toHaveBeenCalledWith(
        inputData.boardId,
        inputData.data,
      );

      // Verify pusher trigger
      expect(pusherMock.trigger).toHaveBeenCalledTimes(1);
      expect(pusherMock.trigger).toHaveBeenCalledWith(
        pusherChannels.board.name,
        pusherChannels.board.events.updated.name,
        expect.objectContaining({
          input: inputData, // Router passes original input to pusher
          returning: mockUpdatedBoard,
          userId: mockUserId,
        }),
      );
    });

    it("should throw FORBIDDEN if requireBoardAdmin fails", async () => {
      // Arrange
      const inputData: z.infer<typeof BoardUpdateSchema> = {
        boardId: "board-update-forbidden",
        data: { name: "Forbidden Update" },
      };
      const authError = new TRPCError({
        code: "FORBIDDEN",
        message: "Not board admin",
      });
      vi.mocked(services.authService.requireBoardAdmin).mockRejectedValue(
        authError,
      );

      // Act & Assert
      await expect(caller.board.update(inputData)).rejects.toThrow(authError);
      expect(services.authService.requireBoardAdmin).toHaveBeenCalledTimes(1);
      expect(services.authService.requireBoardAdmin).toHaveBeenCalledWith(
        inputData.boardId,
      );
      expect(services.boardService.update).not.toHaveBeenCalled();
      expect(pusherMock.trigger).not.toHaveBeenCalled();
    });

    it("should handle errors from boardService.update and not trigger pusher", async () => {
      // Arrange
      const inputData: z.infer<typeof BoardUpdateSchema> = {
        boardId: "board-update-service-error",
        data: { name: "Error Update" },
      };
      const serviceError = new Error("Database update failed");
      vi.mocked(services.boardService.update).mockRejectedValue(serviceError);

      // Act & Assert
      await expect(caller.board.update(inputData)).rejects.toThrow(
        expect.objectContaining({ message: serviceError.message }),
      );
      expect(services.authService.requireBoardAdmin).toHaveBeenCalledTimes(1); // Auth check happens first
      expect(services.boardService.update).toHaveBeenCalledTimes(1);
      expect(services.boardService.update).toHaveBeenCalledWith(
        inputData.boardId,
        inputData.data,
      );
      expect(pusherMock.trigger).not.toHaveBeenCalled();
    });
  });

  // 5. Delete
  describe("board.delete", () => {
    it("should delete a board, trigger pusher, after requiring board admin", async () => {
      // Arrange
      const boardId = "board-delete-1";
      const mockDeletedBoard = createMockBoard(boardId, "proj-deletable");
      vi.mocked(services.boardService.del).mockResolvedValue(mockDeletedBoard);

      // Act
      const result = await caller.board.delete(boardId);

      // Assert
      expect(result).toEqual(mockDeletedBoard);
      expect(services.authService.requireBoardAdmin).toHaveBeenCalledTimes(1);
      expect(services.authService.requireBoardAdmin).toHaveBeenCalledWith(
        boardId,
      );
      expect(services.boardService.del).toHaveBeenCalledTimes(1);
      expect(services.boardService.del).toHaveBeenCalledWith(boardId);

      // Verify pusher trigger
      expect(pusherMock.trigger).toHaveBeenCalledTimes(1);
      expect(pusherMock.trigger).toHaveBeenCalledWith(
        pusherChannels.board.name,
        pusherChannels.board.events.deleted.name,
        expect.objectContaining({
          input: boardId, // Router passes original input ID to pusher
          returning: mockDeletedBoard,
          userId: mockUserId,
        }),
      );
    });

    it("should throw FORBIDDEN if requireBoardAdmin fails", async () => {
      // Arrange
      const boardId = "board-delete-forbidden";
      const authError = new TRPCError({
        code: "FORBIDDEN",
        message: "Not board admin",
      });
      vi.mocked(services.authService.requireBoardAdmin).mockRejectedValue(
        authError,
      );

      // Act & Assert
      await expect(caller.board.delete(boardId)).rejects.toThrow(authError);
      expect(services.authService.requireBoardAdmin).toHaveBeenCalledTimes(1);
      expect(services.authService.requireBoardAdmin).toHaveBeenCalledWith(
        boardId,
      );
      expect(services.boardService.del).not.toHaveBeenCalled();
      expect(pusherMock.trigger).not.toHaveBeenCalled();
    });

    it("should handle errors from boardService.del and not trigger pusher", async () => {
      // Arrange
      const boardId = "board-delete-service-error";
      const serviceError = new Error("Database delete failed");
      vi.mocked(services.boardService.del).mockRejectedValue(serviceError);

      // Act & Assert
      await expect(caller.board.delete(boardId)).rejects.toThrow(
        expect.objectContaining({ message: serviceError.message }),
      );
      expect(services.authService.requireBoardAdmin).toHaveBeenCalledTimes(1); // Auth check happens first
      expect(services.boardService.del).toHaveBeenCalledTimes(1);
      expect(services.boardService.del).toHaveBeenCalledWith(boardId);
      expect(pusherMock.trigger).not.toHaveBeenCalled();
    });
  });

  // 6. Generate
  describe("board.generate", () => {
    it("should generate a board after requiring project admin", async () => {
      // Arrange
      const inputData: z.infer<typeof BoardGenerateSchema> = {
        projectId: "proj-gen-admin-ok",
        prompt: "Generate a standard scrum board",
      };
      const mockGeneratedBoard = createMockBoard(
        "board-gen-1",
        inputData.projectId,
      );
      vi.mocked(services.boardService.generate).mockResolvedValue(
        mockGeneratedBoard as any,
      );

      // Act
      const result = await caller.board.generate(inputData);

      // Assert
      expect(result).toEqual(mockGeneratedBoard);
      expect(services.authService.requireProjectAdmin).toHaveBeenCalledTimes(1);
      expect(services.authService.requireProjectAdmin).toHaveBeenCalledWith(
        inputData.projectId,
      );
      expect(services.boardService.generate).toHaveBeenCalledTimes(1);
      expect(services.boardService.generate).toHaveBeenCalledWith(
        inputData.projectId,
        inputData.prompt,
      );
    });

    it("should throw FORBIDDEN if requireProjectAdmin fails", async () => {
      // Arrange
      const inputData: z.infer<typeof BoardGenerateSchema> = {
        projectId: "proj-gen-admin-fail",
        prompt: "Forbidden generation",
      };
      const authError = new TRPCError({
        code: "FORBIDDEN",
        message: "Not project admin",
      });
      vi.mocked(services.authService.requireProjectAdmin).mockRejectedValue(
        authError,
      );

      // Act & Assert
      await expect(caller.board.generate(inputData)).rejects.toThrow(authError);
      expect(services.authService.requireProjectAdmin).toHaveBeenCalledTimes(1);
      expect(services.authService.requireProjectAdmin).toHaveBeenCalledWith(
        inputData.projectId,
      );
      expect(services.boardService.generate).not.toHaveBeenCalled();
    });

    it("should handle errors from boardService.generate", async () => {
      // Arrange
      const inputData: z.infer<typeof BoardGenerateSchema> = {
        projectId: "proj-gen-service-error",
        prompt: "Error generation",
      };
      const serviceError = new Error("Generation service failed");
      vi.mocked(services.boardService.generate).mockRejectedValue(serviceError);

      // Act & Assert
      await expect(caller.board.generate(inputData)).rejects.toThrow(
        expect.objectContaining({ message: serviceError.message }),
      );
      expect(services.authService.requireProjectAdmin).toHaveBeenCalledTimes(1); // Auth check happens first
      expect(services.boardService.generate).toHaveBeenCalledTimes(1);
      expect(services.boardService.generate).toHaveBeenCalledWith(
        inputData.projectId,
        inputData.prompt,
      );
    });
  });

  // 7. countByProjectId
  describe("board.countByProjectId", () => {
    it("should return board count after verifying project access", async () => {
      // Arrange
      const projectId = "proj-countable";
      const mockCount = 5;
      vi.mocked(services.boardService.countByProjectId).mockResolvedValue(
        mockCount,
      );

      // Act
      const result = await caller.board.countByProjectId(projectId);

      // Assert
      expect(result).toEqual(mockCount);
      expect(services.authService.canAccessProject).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessProject).toHaveBeenCalledWith(
        projectId,
      );
      expect(services.boardService.countByProjectId).toHaveBeenCalledTimes(1);
      expect(services.boardService.countByProjectId).toHaveBeenCalledWith(
        projectId,
      );
    });

    it("should throw FORBIDDEN if user cannot access the project", async () => {
      // Arrange
      const projectId = "proj-count-forbidden";
      const authError = new TRPCError({
        code: "FORBIDDEN",
        message: "Access Denied",
      });
      vi.mocked(services.authService.canAccessProject).mockRejectedValue(
        authError,
      );

      // Act & Assert
      await expect(caller.board.countByProjectId(projectId)).rejects.toThrow(
        authError,
      );
      expect(services.authService.canAccessProject).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessProject).toHaveBeenCalledWith(
        projectId,
      );
      expect(services.boardService.countByProjectId).not.toHaveBeenCalled();
    });

    it("should handle errors from boardService.countByProjectId", async () => {
      // Arrange
      const projectId = "proj-count-service-error";
      const serviceError = new Error("Database count failed");
      vi.mocked(services.boardService.countByProjectId).mockRejectedValue(
        serviceError,
      );

      // Act & Assert
      await expect(caller.board.countByProjectId(projectId)).rejects.toThrow(
        expect.objectContaining({ message: serviceError.message }),
      );
      expect(services.authService.canAccessProject).toHaveBeenCalledTimes(1); // Auth check happens first
      expect(services.boardService.countByProjectId).toHaveBeenCalledTimes(1);
      expect(services.boardService.countByProjectId).toHaveBeenCalledWith(
        projectId,
      );
    });
  });
});
