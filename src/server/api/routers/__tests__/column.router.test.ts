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
import { type ColumnUpdate, type ColumnShift } from "~/server/zod";

// Mock the specific services used by the column router
vi.mock("~/server/services/container", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("~/server/services/container")>();
  return {
    ...original,
    services: {
      ...original.services,
      columnService: {
        list: vi.fn(),
        update: vi.fn(),
        shift: vi.fn(),
        create: vi.fn(),
        del: vi.fn(),
      },
      authService: {
        ...original.services.authService,
        canAccessBoard: vi.fn(),
        requireColumnAdmin: vi.fn(),
        requireBoardAdmin: vi.fn(),
      },
    },
  };
});

describe("Column Router", () => {
  const mockUserId = "user-test-column-123";
  let caller: ReturnType<typeof appRouter.createCaller>;
  let pusherMock: typeof import("~/pusher/server").pusher;

  type RouterInput = inferRouterInputs<AppRouter>;
  type RouterOutput = inferRouterOutputs<AppRouter>;

  // Base Column Type
  type MockColumnBase = {
    id: string;
    boardId: string;
    name: string;
    description: string | null;
    order: number;
    isCompleted: boolean;
    createdAt: Date;
    updatedAt: Date | null;
  };

  // Helper to create mock column
  const createMockColumn = (
    id: string,
    boardId: string,
    overrides: Partial<MockColumnBase> = {},
  ): MockColumnBase => ({
    id,
    boardId,
    name: `Column ${id}`,
    description: null,
    order: 1,
    isCompleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.mocked(auth).mockReturnValue({ userId: mockUserId } as any);
    const ctx = { userId: mockUserId };
    caller = appRouter.createCaller(ctx);
    pusherMock = (await import("~/pusher/server")).pusher;

    // Default successful auth mocks
    vi.mocked(services.authService.canAccessBoard).mockResolvedValue({} as any);
    vi.mocked(services.authService.requireColumnAdmin).mockResolvedValue(
      {} as any,
    );
    vi.mocked(services.authService.requireBoardAdmin).mockResolvedValue(
      {} as any,
    );
  });

  // --- Test Suites ---

  describe("column.list", () => {
    it("should list columns after verifying board access", async () => {
      // Arrange
      const boardId = "board-1";
      const mockColumns = [
        createMockColumn("col-1", boardId),
        createMockColumn("col-2", boardId),
      ];
      vi.mocked(services.columnService.list).mockResolvedValue(mockColumns);

      // Act
      const result = await caller.column.list(boardId);

      // Assert
      expect(result).toEqual(mockColumns);
      expect(services.authService.canAccessBoard).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessBoard).toHaveBeenCalledWith(boardId);
      expect(services.columnService.list).toHaveBeenCalledTimes(1);
      expect(services.columnService.list).toHaveBeenCalledWith(boardId);
    });

    it("should throw if user doesn't have board access", async () => {
      // Arrange
      const boardId = "board-1";
      vi.mocked(services.authService.canAccessBoard).mockRejectedValue(
        new TRPCError({ code: "FORBIDDEN" }),
      );

      // Act and Assert
      await expect(caller.column.list(boardId)).rejects.toThrow(TRPCError);
      expect(services.columnService.list).not.toHaveBeenCalled();
    });
  });

  describe("column.update", () => {
    it("should update column, trigger pusher, after verifying admin access", async () => {
      // Arrange
      const columnId = "col-1";
      const updateData = {
        name: "Updated Column",
        description: "New description",
        isCompleted: true,
      };
      const input = {
        columnId,
        data: updateData,
      };
      const mockUpdatedColumn = createMockColumn("col-1", "board-1", {
        name: updateData.name,
        description: updateData.description,
        isCompleted: updateData.isCompleted,
      });
      vi.mocked(services.columnService.update).mockResolvedValue(
        mockUpdatedColumn,
      );

      // Act
      const result = await caller.column.update(input);

      // Assert
      expect(result).toEqual(mockUpdatedColumn);
      expect(services.authService.requireColumnAdmin).toHaveBeenCalledTimes(1);
      expect(services.authService.requireColumnAdmin).toHaveBeenCalledWith(
        columnId,
      );
      expect(services.columnService.update).toHaveBeenCalledTimes(1);
      expect(services.columnService.update).toHaveBeenCalledWith(
        columnId,
        updateData,
      );
      expect(pusherMock.trigger).toHaveBeenCalledTimes(1);
      expect(pusherMock.trigger).toHaveBeenCalledWith(
        pusherChannels.column.name,
        pusherChannels.column.events.updated.name,
        {
          input,
          returning: mockUpdatedColumn,
          userId: mockUserId,
        },
      );
    });

    it("should throw if user is not a column admin", async () => {
      // Arrange
      const input = {
        columnId: "col-1",
        data: { name: "Updated Column" },
      };
      vi.mocked(services.authService.requireColumnAdmin).mockRejectedValue(
        new TRPCError({ code: "FORBIDDEN" }),
      );

      // Act and Assert
      await expect(caller.column.update(input)).rejects.toThrow(TRPCError);
      expect(services.columnService.update).not.toHaveBeenCalled();
      expect(pusherMock.trigger).not.toHaveBeenCalled();
    });
  });

  describe("column.shift", () => {
    it("should shift column, trigger pusher, after verifying admin access", async () => {
      // Arrange
      const columnId = "col-1";
      const shiftData = {
        direction: "up" as const,
      };
      const input = {
        columnId,
        data: shiftData,
      };
      const mockShiftedColumn = createMockColumn("col-1", "board-1", {
        order: 0, // Order decreased (shifted up)
      });
      vi.mocked(services.columnService.shift).mockResolvedValue(
        mockShiftedColumn,
      );

      // Act
      const result = await caller.column.shift(input);

      // Assert
      expect(result).toEqual(mockShiftedColumn);
      expect(services.authService.requireColumnAdmin).toHaveBeenCalledTimes(1);
      expect(services.authService.requireColumnAdmin).toHaveBeenCalledWith(
        columnId,
      );
      expect(services.columnService.shift).toHaveBeenCalledTimes(1);
      expect(services.columnService.shift).toHaveBeenCalledWith(
        columnId,
        shiftData,
      );
      expect(pusherMock.trigger).toHaveBeenCalledTimes(1);
      expect(pusherMock.trigger).toHaveBeenCalledWith(
        pusherChannels.column.name,
        pusherChannels.column.events.updated.name,
        {
          input,
          returning: mockShiftedColumn,
          userId: mockUserId,
        },
      );
    });

    it("should throw if user is not a column admin", async () => {
      // Arrange
      const input = {
        columnId: "col-1",
        data: { direction: "up" as const },
      };
      vi.mocked(services.authService.requireColumnAdmin).mockRejectedValue(
        new TRPCError({ code: "FORBIDDEN" }),
      );

      // Act and Assert
      await expect(caller.column.shift(input)).rejects.toThrow(TRPCError);
      expect(services.columnService.shift).not.toHaveBeenCalled();
      expect(pusherMock.trigger).not.toHaveBeenCalled();
    });
  });

  describe("column.create", () => {
    it("should create column, trigger pusher, after verifying board admin access", async () => {
      // Arrange
      const input = {
        boardId: "board-1",
        name: "New Column",
        description: "Column description",
        isCompleted: false,
      };
      const mockCreatedColumn = createMockColumn("col-new", input.boardId, {
        name: input.name,
        description: input.description,
        isCompleted: input.isCompleted,
      });
      vi.mocked(services.columnService.create).mockResolvedValue(
        mockCreatedColumn,
      );

      // Act
      const result = await caller.column.create(input);

      // Assert
      expect(result).toEqual(mockCreatedColumn);
      expect(services.authService.requireBoardAdmin).toHaveBeenCalledTimes(1);
      expect(services.authService.requireBoardAdmin).toHaveBeenCalledWith(
        input.boardId,
      );
      expect(services.columnService.create).toHaveBeenCalledTimes(1);
      expect(services.columnService.create).toHaveBeenCalledWith(input);
      expect(pusherMock.trigger).toHaveBeenCalledTimes(1);
      expect(pusherMock.trigger).toHaveBeenCalledWith(
        pusherChannels.column.name,
        pusherChannels.column.events.created.name,
        {
          input,
          returning: mockCreatedColumn,
          userId: mockUserId,
        },
      );
    });

    it("should throw if user is not a board admin", async () => {
      // Arrange
      const input = {
        boardId: "board-1",
        name: "New Column",
      };
      vi.mocked(services.authService.requireBoardAdmin).mockRejectedValue(
        new TRPCError({ code: "FORBIDDEN" }),
      );

      // Act and Assert
      await expect(caller.column.create(input)).rejects.toThrow(TRPCError);
      expect(services.columnService.create).not.toHaveBeenCalled();
      expect(pusherMock.trigger).not.toHaveBeenCalled();
    });
  });

  describe("column.delete", () => {
    it("should delete column, trigger pusher, after verifying admin access", async () => {
      // Arrange
      const columnId = "col-1";
      const mockDeletedColumn = createMockColumn(columnId, "board-1");
      vi.mocked(services.columnService.del).mockResolvedValue(
        mockDeletedColumn,
      );

      // Act
      const result = await caller.column.delete(columnId);

      // Assert
      expect(result).toEqual(mockDeletedColumn);
      expect(services.authService.requireColumnAdmin).toHaveBeenCalledTimes(1);
      expect(services.authService.requireColumnAdmin).toHaveBeenCalledWith(
        columnId,
      );
      expect(services.columnService.del).toHaveBeenCalledTimes(1);
      expect(services.columnService.del).toHaveBeenCalledWith(columnId);
      expect(pusherMock.trigger).toHaveBeenCalledTimes(1);
      expect(pusherMock.trigger).toHaveBeenCalledWith(
        pusherChannels.column.name,
        pusherChannels.column.events.deleted.name,
        {
          input: columnId,
          returning: mockDeletedColumn,
          userId: mockUserId,
        },
      );
    });

    it("should throw if user is not a column admin", async () => {
      // Arrange
      const columnId = "col-1";
      vi.mocked(services.authService.requireColumnAdmin).mockRejectedValue(
        new TRPCError({ code: "FORBIDDEN" }),
      );

      // Act and Assert
      await expect(caller.column.delete(columnId)).rejects.toThrow(TRPCError);
      expect(services.columnService.del).not.toHaveBeenCalled();
      expect(pusherMock.trigger).not.toHaveBeenCalled();
    });
  });
});
