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
import {
  type CardCreateSchema,
  type CardCreateManySchema,
  type CardUpdateSchema,
  type CardMoveSchema,
} from "~/server/zod"; // Import necessary schemas

// Mock the specific services used by the card router
vi.mock("~/server/services/container", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("~/server/services/container")>();
  return {
    ...original,
    services: {
      ...original.services,
      cardService: {
        create: vi.fn(),
        createMany: vi.fn(),
        get: vi.fn(),
        update: vi.fn(),
        move: vi.fn(),
        del: vi.fn(),
        duplicate: vi.fn(),
        list: vi.fn(),
        generate: vi.fn(),
        generateSingle: vi.fn(),
        countByBoardId: vi.fn(),
        countCompletedByBoardId: vi.fn(),
        countByProjectId: vi.fn(),
        assignToCurrentUser: vi.fn(),
      },
      authService: {
        // Ensure all needed auth methods are mocked
        ...original.services.authService, // Spread existing mocks
        canAccessColumn: vi.fn(),
        canAccessCard: vi.fn(),
        canAccessBoard: vi.fn(),
        canAccessProject: vi.fn(),
        // Include others if necessary for completeness
        requireProjectAdmin: vi.fn(),
        requireBoardAdmin: vi.fn(),
      },
    },
  };
});

describe("Card Router", () => {
  const mockUserId = "user-test-card-123";
  let caller: ReturnType<typeof appRouter.createCaller>;
  let pusherMock: typeof import("~/pusher/server").pusher;

  type RouterInput = inferRouterInputs<AppRouter>;
  type RouterOutput = inferRouterOutputs<AppRouter>;

  // Base Card Type (approximating service return, adjust if needed)
  // Based on service review, includes string[] for labels, only assignedToId
  type MockCardBase = {
    id: number;
    columnId: string;
    title: string;
    description: string | null;
    order: number;
    createdAt: Date;
    updatedAt: Date | null;
    dueDate: Date | null;
    assignedToId: string | null;
    labels: string[];
    priority: "low" | "medium" | "high" | "urgent" | null;
  };

  // Helper to create mock card output (base structure matching service returns)
  const createMockCardBase = (
    id: number,
    columnId: string,
    overrides: Partial<MockCardBase> = {},
  ): MockCardBase => ({
    id,
    columnId,
    title: `Card ${id}`,
    description: null,
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    dueDate: null,
    assignedToId: null,
    labels: [],
    priority: null,
    ...overrides,
  });

  // Derive from actual router output type and add priority
  type MockCardWithRelations = RouterOutput["card"]["list"][number] & {
    priority: "low" | "medium" | "high" | "urgent" | null;
  };

  const createMockCardWithRelations = (
    id: number,
    columnId: string,
    overrides: Partial<MockCardWithRelations> = {},
  ): MockCardWithRelations => ({
    id,
    columnId,
    title: `Card ${id}`,
    description: null,
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    dueDate: null,
    assignedToId: null,
    priority: null,
    labels: null,
    assignedTo: null,
    ...overrides,
  });

  // Structure returned by 'generate' methods
  type MockGeneratedCardData = {
    description: string;
    title: string;
    priority: string;
    labels: string[];
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.mocked(auth).mockReturnValue({ userId: mockUserId } as any);
    const ctx = { userId: mockUserId };
    caller = appRouter.createCaller(ctx);
    pusherMock = (await import("~/pusher/server")).pusher;

    // Default successful auth mocks
    vi.mocked(services.authService.canAccessColumn).mockResolvedValue(
      {} as any,
    );
    vi.mocked(services.authService.canAccessCard).mockResolvedValue({} as any);
    vi.mocked(services.authService.canAccessBoard).mockResolvedValue({} as any);
    vi.mocked(services.authService.canAccessProject).mockResolvedValue(
      {} as any,
    );
  });

  // --- Test Suites ---

  describe("card.create", () => {
    it("should create card, trigger pusher, after verifying column access", async () => {
      // Arrange
      // Input type expects labels as {id, text}[]
      const inputData: z.infer<typeof CardCreateSchema> = {
        columnId: "col-1",
        title: "New Card",
        labels: [{ id: "l1", text: "Bug" }], // No 'order'
      };
      // Return type expects labels as string[]
      const mockCreatedCard = createMockCardBase(1, inputData.columnId, {
        title: inputData.title,
        order: 0,
        labels: ["Bug"],
      }); // Order is set in RETURNED mock
      vi.mocked(services.cardService.create).mockResolvedValue(mockCreatedCard);

      // Act
      const result = await caller.card.create(inputData);

      // Assert
      expect(result).toEqual(mockCreatedCard);
      expect(services.authService.canAccessColumn).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessColumn).toHaveBeenCalledWith(
        inputData.columnId,
      );
      expect(services.cardService.create).toHaveBeenCalledTimes(1);
      // Service receives input with {id, text} labels (without order)
      expect(services.cardService.create).toHaveBeenCalledWith(inputData);
      expect(pusherMock.trigger).toHaveBeenCalledTimes(1);
      expect(pusherMock.trigger).toHaveBeenCalledWith(
        pusherChannels.card.name,
        pusherChannels.card.events.created.name,
        // Pusher gets the *returned* card structure (labels: string[])
        expect.objectContaining({
          input: mockCreatedCard,
          returning: mockCreatedCard,
          userId: mockUserId,
        }),
      );
    });

    it("should throw FORBIDDEN if user cannot access column", async () => {
      // Arrange
      const inputData: z.infer<typeof CardCreateSchema> = {
        columnId: "col-forbidden",
        title: "Forbidden Card",
        labels: [],
      }; // No 'order'
      const authError = new TRPCError({
        code: "FORBIDDEN",
        message: "Cannot access column",
      });
      vi.mocked(services.authService.canAccessColumn).mockRejectedValue(
        authError,
      );

      // Act & Assert
      await expect(caller.card.create(inputData)).rejects.toThrow(authError);
      expect(services.authService.canAccessColumn).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessColumn).toHaveBeenCalledWith(
        inputData.columnId,
      );
      expect(services.cardService.create).not.toHaveBeenCalled();
      expect(pusherMock.trigger).not.toHaveBeenCalled();
    });

    it("should handle errors from cardService.create and not trigger pusher", async () => {
      // Arrange
      const inputData: z.infer<typeof CardCreateSchema> = {
        columnId: "col-service-err",
        title: "Error Card",
        labels: [],
      }; // No 'order'
      const serviceError = new Error("DB create failed");
      vi.mocked(services.cardService.create).mockRejectedValue(serviceError);

      // Act & Assert
      await expect(caller.card.create(inputData)).rejects.toThrow(
        expect.objectContaining({ message: serviceError.message }),
      );
      expect(services.authService.canAccessColumn).toHaveBeenCalledTimes(1); // Auth checked first
      expect(services.cardService.create).toHaveBeenCalledTimes(1);
      expect(services.cardService.create).toHaveBeenCalledWith(inputData);
      expect(pusherMock.trigger).not.toHaveBeenCalled();
    });
  });

  describe("card.createMany", () => {
    it("should create multiple cards after verifying board access", async () => {
      // Arrange
      const inputData: z.infer<typeof CardCreateManySchema> = {
        boardId: "board-multi-create",
        // Input data matches schema (labels: {id, text}[]) - no 'order'
        data: [
          { columnId: "col-m1", title: "Multi Card 1", labels: [] },
          {
            columnId: "col-m2",
            title: "Multi Card 2",
            description: "Desc",
            labels: [{ id: "l1", text: "Label1" }],
          },
        ],
      };
      // Mock output matches service return type (labels: string[])
      const mockCreatedCards = [
        // Map input data safely to mock data structure
        ...inputData.data.map((cardInput, index) =>
          createMockCardBase(10 + index, cardInput.columnId ?? "FallbackCol", {
            title: cardInput.title ?? "Fallback Title",
            order: index, // Assign order based on index for mock
            description: cardInput.description ?? null,
            labels: (cardInput.labels ?? []).map((l) => l.text), // Add safeguard for labels array
          }),
        ),
      ];
      vi.mocked(services.cardService.createMany).mockResolvedValue(
        mockCreatedCards,
      );

      // Act
      const result = await caller.card.createMany(inputData);

      // Assert
      expect(result).toEqual(mockCreatedCards);
      expect(services.authService.canAccessBoard).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessBoard).toHaveBeenCalledWith(
        inputData.boardId,
      );
      expect(services.cardService.createMany).toHaveBeenCalledTimes(1);
      // Service receives input with {id, text} labels (without order)
      expect(services.cardService.createMany).toHaveBeenCalledWith(
        inputData.boardId,
        inputData.data,
      );
      expect(pusherMock.trigger).not.toHaveBeenCalled(); // No pusher trigger for createMany
    });

    // Add FORBIDDEN and service error tests for createMany
    it("should throw FORBIDDEN if user cannot access board for createMany", async () => {
      // Arrange
      const inputData: z.infer<typeof CardCreateManySchema> = {
        boardId: "board-forbidden",
        data: [],
      };
      const authError = new TRPCError({
        code: "FORBIDDEN",
        message: "Cannot access board",
      });
      vi.mocked(services.authService.canAccessBoard).mockRejectedValue(
        authError,
      );

      // Act & Assert
      await expect(caller.card.createMany(inputData)).rejects.toThrow(
        authError,
      );
      expect(services.authService.canAccessBoard).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessBoard).toHaveBeenCalledWith(
        inputData.boardId,
      );
      expect(services.cardService.createMany).not.toHaveBeenCalled();
    });

    it("should handle errors from cardService.createMany", async () => {
      // Arrange
      const inputData: z.infer<typeof CardCreateManySchema> = {
        boardId: "board-multi-err",
        data: [{ columnId: "c", title: "t", labels: [] }],
      }; // No 'order'
      const serviceError = new Error("DB createMany failed");
      vi.mocked(services.cardService.createMany).mockRejectedValue(
        serviceError,
      );

      // Act & Assert
      await expect(caller.card.createMany(inputData)).rejects.toThrow(
        expect.objectContaining({ message: serviceError.message }),
      );
      expect(services.authService.canAccessBoard).toHaveBeenCalledTimes(1);
      expect(services.cardService.createMany).toHaveBeenCalledTimes(1);
      expect(services.cardService.createMany).toHaveBeenCalledWith(
        inputData.boardId,
        inputData.data,
      );
    });
  });

  describe("card.get", () => {
    it("should get card after verifying card access", async () => {
      // Arrange
      const cardId = 2;
      // Use the potentially relation-inclusive helper/type for 'get'
      const mockCard = createMockCardWithRelations(cardId, "col-get");
      vi.mocked(services.cardService.get).mockResolvedValue(mockCard);

      // Act
      const result = await caller.card.get(cardId);

      // Assert
      expect(result).toEqual(mockCard);
      expect(services.authService.canAccessCard).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessCard).toHaveBeenCalledWith(cardId);
      expect(services.cardService.get).toHaveBeenCalledTimes(1);
      expect(services.cardService.get).toHaveBeenCalledWith(cardId);
    });

    // Add FORBIDDEN and service error tests for get
    it("should throw FORBIDDEN if user cannot access card for get", async () => {
      // Arrange
      const cardId = 3;
      const authError = new TRPCError({
        code: "FORBIDDEN",
        message: "Cannot access card",
      });
      vi.mocked(services.authService.canAccessCard).mockRejectedValue(
        authError,
      );

      // Act & Assert
      await expect(caller.card.get(cardId)).rejects.toThrow(authError);
      expect(services.authService.canAccessCard).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessCard).toHaveBeenCalledWith(cardId);
      expect(services.cardService.get).not.toHaveBeenCalled();
    });

    it("should handle errors from cardService.get", async () => {
      // Arrange
      const cardId = 4;
      const serviceError = new Error("Card not found");
      vi.mocked(services.cardService.get).mockRejectedValue(serviceError);

      // Act & Assert
      await expect(caller.card.get(cardId)).rejects.toThrow(
        expect.objectContaining({ message: serviceError.message }),
      );
      expect(services.authService.canAccessCard).toHaveBeenCalledTimes(1);
      expect(services.cardService.get).toHaveBeenCalledTimes(1);
      expect(services.cardService.get).toHaveBeenCalledWith(cardId);
    });
  });

  describe("card.update", () => {
    it("should update card, trigger pusher, after verifying card access", async () => {
      // Arrange
      const inputData: z.infer<typeof CardUpdateSchema> = {
        cardId: 5,
        data: { title: "Updated Title" },
      };
      // Service returns base card structure
      const mockUpdatedCard = createMockCardBase(
        inputData.cardId,
        "col-update",
        { title: inputData.data.title },
      );
      vi.mocked(services.cardService.update).mockResolvedValue(mockUpdatedCard);

      // Act
      const result = await caller.card.update(inputData);

      // Assert
      expect(result).toEqual(mockUpdatedCard);
      expect(services.authService.canAccessCard).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessCard).toHaveBeenCalledWith(
        inputData.cardId,
      );
      expect(services.cardService.update).toHaveBeenCalledTimes(1);
      expect(services.cardService.update).toHaveBeenCalledWith(
        inputData.cardId,
        inputData.data,
      );
      expect(pusherMock.trigger).toHaveBeenCalledTimes(1);
      expect(pusherMock.trigger).toHaveBeenCalledWith(
        pusherChannels.card.name,
        pusherChannels.card.events.updated.name,
        expect.objectContaining({
          input: mockUpdatedCard,
          returning: mockUpdatedCard,
          userId: mockUserId,
        }),
      );
    });

    // Add FORBIDDEN and service error tests for update
    it("should throw FORBIDDEN if user cannot access card for update", async () => {
      // Arrange
      const inputData: z.infer<typeof CardUpdateSchema> = {
        cardId: 6,
        data: { title: "Forbidden Update" },
      };
      const authError = new TRPCError({
        code: "FORBIDDEN",
        message: "Cannot access card",
      });
      vi.mocked(services.authService.canAccessCard).mockRejectedValue(
        authError,
      );

      // Act & Assert
      await expect(caller.card.update(inputData)).rejects.toThrow(authError);
      expect(services.authService.canAccessCard).toHaveBeenCalledTimes(1);
      expect(services.cardService.update).not.toHaveBeenCalled();
      expect(pusherMock.trigger).not.toHaveBeenCalled();
    });

    it("should handle errors from cardService.update and not trigger pusher", async () => {
      // Arrange
      const inputData: z.infer<typeof CardUpdateSchema> = {
        cardId: 7,
        data: { title: "Error Update" },
      };
      const serviceError = new Error("DB update failed");
      vi.mocked(services.cardService.update).mockRejectedValue(serviceError);

      // Act & Assert
      await expect(caller.card.update(inputData)).rejects.toThrow(
        expect.objectContaining({ message: serviceError.message }),
      );
      expect(services.authService.canAccessCard).toHaveBeenCalledTimes(1);
      expect(services.cardService.update).toHaveBeenCalledTimes(1);
      expect(pusherMock.trigger).not.toHaveBeenCalled();
    });
  });

  describe("card.move", () => {
    it("should move card, trigger pusher, after verifying card access", async () => {
      // Arrange
      const inputData: z.infer<typeof CardMoveSchema> = {
        cardId: 8,
        sourceColumnId: "col-src",
        destinationColumnId: "col-dest",
        newOrder: 0,
      };
      // Service returns base card structure
      const mockMovedCard = createMockCardBase(
        inputData.cardId,
        inputData.destinationColumnId,
        { order: inputData.newOrder },
      );
      vi.mocked(services.cardService.move).mockResolvedValue(mockMovedCard);

      // Act
      const result = await caller.card.move(inputData);

      // Assert
      expect(result).toEqual(mockMovedCard);
      expect(services.authService.canAccessCard).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessCard).toHaveBeenCalledWith(
        inputData.cardId,
      );
      expect(services.cardService.move).toHaveBeenCalledTimes(1);
      expect(services.cardService.move).toHaveBeenCalledWith(inputData); // Service expects structured input
      expect(pusherMock.trigger).toHaveBeenCalledTimes(1);
      expect(pusherMock.trigger).toHaveBeenCalledWith(
        pusherChannels.card.name,
        pusherChannels.card.events.moved.name,
        expect.objectContaining({
          input: inputData,
          returning: mockMovedCard,
          userId: mockUserId,
        }),
      );
    });

    // Add FORBIDDEN and service error tests for move
    it("should throw FORBIDDEN if user cannot access card for move", async () => {
      // Arrange
      const inputData: z.infer<typeof CardMoveSchema> = {
        cardId: 9,
        sourceColumnId: "s",
        destinationColumnId: "d",
        newOrder: 0,
      };
      const authError = new TRPCError({
        code: "FORBIDDEN",
        message: "Cannot access card",
      });
      vi.mocked(services.authService.canAccessCard).mockRejectedValue(
        authError,
      );

      // Act & Assert
      await expect(caller.card.move(inputData)).rejects.toThrow(authError);
      expect(services.authService.canAccessCard).toHaveBeenCalledTimes(1);
      expect(services.cardService.move).not.toHaveBeenCalled();
      expect(pusherMock.trigger).not.toHaveBeenCalled();
    });

    it("should handle errors from cardService.move and not trigger pusher", async () => {
      // Arrange
      const inputData: z.infer<typeof CardMoveSchema> = {
        cardId: 10,
        sourceColumnId: "s",
        destinationColumnId: "d",
        newOrder: 0,
      };
      const serviceError = new Error("DB move failed");
      vi.mocked(services.cardService.move).mockRejectedValue(serviceError);

      // Act & Assert
      await expect(caller.card.move(inputData)).rejects.toThrow(
        expect.objectContaining({ message: serviceError.message }),
      );
      expect(services.authService.canAccessCard).toHaveBeenCalledTimes(1);
      expect(services.cardService.move).toHaveBeenCalledTimes(1);
      expect(pusherMock.trigger).not.toHaveBeenCalled();
    });
  });

  describe("card.delete", () => {
    it("should delete card, trigger pusher, after verifying card access", async () => {
      // Arrange
      const inputData = { cardId: 11 };
      // Service returns base card structure
      const mockDeletedCard = createMockCardBase(
        inputData.cardId,
        "col-deleted",
      );
      vi.mocked(services.cardService.del).mockResolvedValue(mockDeletedCard);

      // Act
      const result = await caller.card.delete(inputData);

      // Assert
      expect(result).toEqual(mockDeletedCard);
      expect(services.authService.canAccessCard).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessCard).toHaveBeenCalledWith(
        inputData.cardId,
      );
      expect(services.cardService.del).toHaveBeenCalledTimes(1);
      expect(services.cardService.del).toHaveBeenCalledWith(inputData.cardId);
      expect(pusherMock.trigger).toHaveBeenCalledTimes(1);
      expect(pusherMock.trigger).toHaveBeenCalledWith(
        pusherChannels.card.name,
        pusherChannels.card.events.deleted.name,
        expect.objectContaining({
          input: mockDeletedCard,
          returning: mockDeletedCard,
          userId: mockUserId,
        }),
      );
    });

    // Add FORBIDDEN and service error tests for delete
    it("should throw FORBIDDEN if user cannot access card for delete", async () => {
      // Arrange
      const inputData = { cardId: 12 };
      const authError = new TRPCError({
        code: "FORBIDDEN",
        message: "Cannot access card",
      });
      vi.mocked(services.authService.canAccessCard).mockRejectedValue(
        authError,
      );

      // Act & Assert
      await expect(caller.card.delete(inputData)).rejects.toThrow(authError);
      expect(services.authService.canAccessCard).toHaveBeenCalledTimes(1);
      expect(services.cardService.del).not.toHaveBeenCalled();
      expect(pusherMock.trigger).not.toHaveBeenCalled();
    });

    it("should handle errors from cardService.del and not trigger pusher", async () => {
      // Arrange
      const inputData = { cardId: 13 };
      const serviceError = new Error("DB delete failed");
      vi.mocked(services.cardService.del).mockRejectedValue(serviceError);

      // Act & Assert
      await expect(caller.card.delete(inputData)).rejects.toThrow(
        expect.objectContaining({ message: serviceError.message }),
      );
      expect(services.authService.canAccessCard).toHaveBeenCalledTimes(1);
      expect(services.cardService.del).toHaveBeenCalledTimes(1);
      expect(pusherMock.trigger).not.toHaveBeenCalled();
    });
  });

  describe("card.duplicate", () => {
    it("should duplicate card after verifying card access", async () => {
      // Arrange
      const inputData = { cardId: 14 };
      // Service returns base card structure
      const mockDuplicatedCard = createMockCardBase(15, "col-dup", {
        title: "Card 14 (Copy)",
      });
      vi.mocked(services.cardService.duplicate).mockResolvedValue(
        mockDuplicatedCard,
      );

      // Act
      const result = await caller.card.duplicate(inputData);

      // Assert
      expect(result).toEqual(mockDuplicatedCard);
      expect(services.authService.canAccessCard).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessCard).toHaveBeenCalledWith(
        inputData.cardId,
      );
      expect(services.cardService.duplicate).toHaveBeenCalledTimes(1);
      expect(services.cardService.duplicate).toHaveBeenCalledWith(
        inputData.cardId,
      );
      expect(pusherMock.trigger).not.toHaveBeenCalled(); // No pusher trigger for duplicate
    });

    // Add FORBIDDEN and service error tests for duplicate
    it("should throw FORBIDDEN if user cannot access card for duplicate", async () => {
      // Arrange
      const inputData = { cardId: 15 };
      const authError = new TRPCError({
        code: "FORBIDDEN",
        message: "Cannot access card",
      });
      vi.mocked(services.authService.canAccessCard).mockRejectedValue(
        authError,
      );

      // Act & Assert
      await expect(caller.card.duplicate(inputData)).rejects.toThrow(authError);
      expect(services.authService.canAccessCard).toHaveBeenCalledTimes(1);
      expect(services.cardService.duplicate).not.toHaveBeenCalled();
    });

    it("should handle errors from cardService.duplicate", async () => {
      // Arrange
      const inputData = { cardId: 16 };
      const serviceError = new Error("DB duplicate failed");
      vi.mocked(services.cardService.duplicate).mockRejectedValue(serviceError);

      // Act & Assert
      await expect(caller.card.duplicate(inputData)).rejects.toThrow(
        expect.objectContaining({ message: serviceError.message }),
      );
      expect(services.authService.canAccessCard).toHaveBeenCalledTimes(1);
      expect(services.cardService.duplicate).toHaveBeenCalledTimes(1);
    });
  });

  describe("card.list", () => {
    it("should list cards after verifying column access", async () => {
      // Arrange
      const columnId = "col-listable";
      // Service 'list' likely returns with relations
      const mockCards = [
        createMockCardWithRelations(17, columnId),
        createMockCardWithRelations(18, columnId),
      ];
      vi.mocked(services.cardService.list).mockResolvedValue(mockCards);

      // Act
      const result = await caller.card.list(columnId);

      // Assert
      expect(result).toEqual(mockCards);
      expect(services.authService.canAccessColumn).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessColumn).toHaveBeenCalledWith(
        columnId,
      );
      expect(services.cardService.list).toHaveBeenCalledTimes(1);
      expect(services.cardService.list).toHaveBeenCalledWith(columnId);
    });

    // Add FORBIDDEN and service error tests for list
    it("should throw FORBIDDEN if user cannot access column for list", async () => {
      // Arrange
      const columnId = "col-list-forbidden";
      const authError = new TRPCError({
        code: "FORBIDDEN",
        message: "Cannot access column",
      });
      vi.mocked(services.authService.canAccessColumn).mockRejectedValue(
        authError,
      );

      // Act & Assert
      await expect(caller.card.list(columnId)).rejects.toThrow(authError);
      expect(services.authService.canAccessColumn).toHaveBeenCalledTimes(1);
      expect(services.cardService.list).not.toHaveBeenCalled();
    });

    it("should handle errors from cardService.list", async () => {
      // Arrange
      const columnId = "col-list-err";
      const serviceError = new Error("DB list failed");
      vi.mocked(services.cardService.list).mockRejectedValue(serviceError);

      // Act & Assert
      await expect(caller.card.list(columnId)).rejects.toThrow(
        expect.objectContaining({ message: serviceError.message }),
      );
      expect(services.authService.canAccessColumn).toHaveBeenCalledTimes(1);
      expect(services.cardService.list).toHaveBeenCalledTimes(1);
    });
  });

  describe("card.generate", () => {
    it("should generate cards after verifying board access", async () => {
      // Arrange
      const inputData = { boardId: "board-gen", prompt: "Gen cards" };
      // Service returns array of generated data, not full cards
      const mockGeneratedCards: MockGeneratedCardData[] = [
        {
          description: "Desc 1",
          title: "Gen Card 1",
          priority: "medium",
          labels: ["gen"],
        },
        {
          description: "Desc 2",
          title: "Gen Card 2",
          priority: "high",
          labels: [],
        },
      ];
      vi.mocked(services.cardService.generate).mockResolvedValue(
        mockGeneratedCards as any,
      ); // Cast needed if type mismatch

      // Act
      const result = await caller.card.generate(inputData);

      // Assert
      expect(result).toEqual(mockGeneratedCards);
      expect(services.authService.canAccessBoard).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessBoard).toHaveBeenCalledWith(
        inputData.boardId,
      );
      expect(services.cardService.generate).toHaveBeenCalledTimes(1);
      expect(services.cardService.generate).toHaveBeenCalledWith(
        inputData.boardId,
        inputData.prompt,
        undefined,
        "Standard",
      ); // Default values
    });

    // Add FORBIDDEN and service error tests for generate
    it("should throw FORBIDDEN if user cannot access board for generate", async () => {
      // Arrange
      const inputData = { boardId: "board-gen-forbidden", prompt: "Gen cards" };
      const authError = new TRPCError({
        code: "FORBIDDEN",
        message: "Cannot access board",
      });
      vi.mocked(services.authService.canAccessBoard).mockRejectedValue(
        authError,
      );

      // Act & Assert
      await expect(caller.card.generate(inputData)).rejects.toThrow(authError);
      expect(services.authService.canAccessBoard).toHaveBeenCalledTimes(1);
      expect(services.cardService.generate).not.toHaveBeenCalled();
    });

    it("should handle errors from cardService.generate", async () => {
      // Arrange
      const inputData = { boardId: "board-gen-err", prompt: "Gen cards" };
      const serviceError = new Error("Generation failed");
      vi.mocked(services.cardService.generate).mockRejectedValue(serviceError);

      // Act & Assert
      await expect(caller.card.generate(inputData)).rejects.toThrow(
        expect.objectContaining({ message: serviceError.message }),
      );
      expect(services.authService.canAccessBoard).toHaveBeenCalledTimes(1);
      expect(services.cardService.generate).toHaveBeenCalledTimes(1);
    });
  });

  describe("card.generateSingle", () => {
    it("should generate single card after verifying board access", async () => {
      // Arrange
      const inputData = { boardId: "board-gen-s", prompt: "Gen single" };
      // Service returns single generated data object
      const mockGeneratedCard: MockGeneratedCardData = {
        description: "Desc S",
        title: "Gen Card S",
        priority: "low",
        labels: ["single"],
      };
      vi.mocked(services.cardService.generateSingle).mockResolvedValue(
        mockGeneratedCard as any,
      ); // Cast needed if type mismatch

      // Act
      const result = await caller.card.generateSingle(inputData);

      // Assert
      expect(result).toEqual(mockGeneratedCard);
      expect(services.authService.canAccessBoard).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessBoard).toHaveBeenCalledWith(
        inputData.boardId,
      );
      expect(services.cardService.generateSingle).toHaveBeenCalledTimes(1);
      expect(services.cardService.generateSingle).toHaveBeenCalledWith(
        inputData.boardId,
        inputData.prompt,
        undefined,
        "Standard",
      );
    });

    // Add FORBIDDEN and service error tests for generateSingle
    it("should throw FORBIDDEN if user cannot access board for generateSingle", async () => {
      const inputData = { boardId: "board-gen-s-forbid", prompt: "Gen single" };
      const authError = new TRPCError({
        code: "FORBIDDEN",
        message: "Cannot access board",
      });
      vi.mocked(services.authService.canAccessBoard).mockRejectedValue(
        authError,
      );
      await expect(caller.card.generateSingle(inputData)).rejects.toThrow(
        authError,
      );
      expect(services.authService.canAccessBoard).toHaveBeenCalledTimes(1);
      expect(services.cardService.generateSingle).not.toHaveBeenCalled();
    });

    it("should handle errors from cardService.generateSingle", async () => {
      const inputData = { boardId: "board-gen-s-err", prompt: "Gen single" };
      const serviceError = new Error("Single generation failed");
      vi.mocked(services.cardService.generateSingle).mockRejectedValue(
        serviceError,
      );
      await expect(caller.card.generateSingle(inputData)).rejects.toThrow(
        expect.objectContaining({ message: serviceError.message }),
      );
      expect(services.authService.canAccessBoard).toHaveBeenCalledTimes(1);
      expect(services.cardService.generateSingle).toHaveBeenCalledTimes(1);
    });
  });

  describe("card.countByBoardId", () => {
    it("should count cards by board ID after verifying board access", async () => {
      // Arrange
      const boardId = "board-count";
      const mockCount = 25;
      vi.mocked(services.cardService.countByBoardId).mockResolvedValue(
        mockCount,
      );

      // Act
      const result = await caller.card.countByBoardId(boardId);

      // Assert
      expect(result).toEqual(mockCount);
      expect(services.authService.canAccessBoard).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessBoard).toHaveBeenCalledWith(boardId);
      expect(services.cardService.countByBoardId).toHaveBeenCalledTimes(1);
      expect(services.cardService.countByBoardId).toHaveBeenCalledWith(boardId);
    });

    // Add FORBIDDEN and service error tests for countByBoardId
    it("should throw FORBIDDEN if user cannot access board for countByBoardId", async () => {
      const boardId = "board-count-forbid";
      const authError = new TRPCError({
        code: "FORBIDDEN",
        message: "Cannot access board",
      });
      vi.mocked(services.authService.canAccessBoard).mockRejectedValue(
        authError,
      );
      await expect(caller.card.countByBoardId(boardId)).rejects.toThrow(
        authError,
      );
      expect(services.authService.canAccessBoard).toHaveBeenCalledTimes(1);
      expect(services.cardService.countByBoardId).not.toHaveBeenCalled();
    });

    it("should handle errors from cardService.countByBoardId", async () => {
      const boardId = "board-count-err";
      const serviceError = new Error("Count failed");
      vi.mocked(services.cardService.countByBoardId).mockRejectedValue(
        serviceError,
      );
      await expect(caller.card.countByBoardId(boardId)).rejects.toThrow(
        expect.objectContaining({ message: serviceError.message }),
      );
      expect(services.authService.canAccessBoard).toHaveBeenCalledTimes(1);
      expect(services.cardService.countByBoardId).toHaveBeenCalledTimes(1);
    });
  });

  describe("card.countCompletedByBoardId", () => {
    it("should count completed cards by board ID after verifying board access", async () => {
      // Arrange
      const boardId = "board-count-comp";
      const mockCount = 10;
      vi.mocked(services.cardService.countCompletedByBoardId).mockResolvedValue(
        mockCount,
      );

      // Act
      const result = await caller.card.countCompletedByBoardId(boardId);

      // Assert
      expect(result).toEqual(mockCount);
      expect(services.authService.canAccessBoard).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessBoard).toHaveBeenCalledWith(boardId);
      expect(
        services.cardService.countCompletedByBoardId,
      ).toHaveBeenCalledTimes(1);
      expect(services.cardService.countCompletedByBoardId).toHaveBeenCalledWith(
        boardId,
      );
    });

    // Add FORBIDDEN and service error tests for countCompletedByBoardId
    it("should throw FORBIDDEN if user cannot access board for countCompletedByBoardId", async () => {
      const boardId = "board-count-comp-forbid";
      const authError = new TRPCError({
        code: "FORBIDDEN",
        message: "Cannot access board",
      });
      vi.mocked(services.authService.canAccessBoard).mockRejectedValue(
        authError,
      );
      await expect(
        caller.card.countCompletedByBoardId(boardId),
      ).rejects.toThrow(authError);
      expect(services.authService.canAccessBoard).toHaveBeenCalledTimes(1);
      expect(
        services.cardService.countCompletedByBoardId,
      ).not.toHaveBeenCalled();
    });

    it("should handle errors from cardService.countCompletedByBoardId", async () => {
      const boardId = "board-count-comp-err";
      const serviceError = new Error("Count completed failed");
      vi.mocked(services.cardService.countCompletedByBoardId).mockRejectedValue(
        serviceError,
      );
      await expect(
        caller.card.countCompletedByBoardId(boardId),
      ).rejects.toThrow(
        expect.objectContaining({ message: serviceError.message }),
      );
      expect(services.authService.canAccessBoard).toHaveBeenCalledTimes(1);
      expect(
        services.cardService.countCompletedByBoardId,
      ).toHaveBeenCalledTimes(1);
    });
  });

  describe("card.countByProjectId", () => {
    it("should count cards by project ID after verifying project access", async () => {
      // Arrange
      const projectId = "proj-count";
      const mockCount = 50;
      vi.mocked(services.cardService.countByProjectId).mockResolvedValue(
        mockCount,
      );

      // Act
      const result = await caller.card.countByProjectId(projectId);

      // Assert
      expect(result).toEqual(mockCount);
      expect(services.authService.canAccessProject).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessProject).toHaveBeenCalledWith(
        projectId,
      );
      expect(services.cardService.countByProjectId).toHaveBeenCalledTimes(1);
      expect(services.cardService.countByProjectId).toHaveBeenCalledWith(
        projectId,
      );
    });

    // Add FORBIDDEN and service error tests for countByProjectId
    it("should throw FORBIDDEN if user cannot access project for countByProjectId", async () => {
      const projectId = "proj-count-forbid";
      const authError = new TRPCError({
        code: "FORBIDDEN",
        message: "Cannot access project",
      });
      vi.mocked(services.authService.canAccessProject).mockRejectedValue(
        authError,
      );
      await expect(caller.card.countByProjectId(projectId)).rejects.toThrow(
        authError,
      );
      expect(services.authService.canAccessProject).toHaveBeenCalledTimes(1);
      expect(services.cardService.countByProjectId).not.toHaveBeenCalled();
    });

    it("should handle errors from cardService.countByProjectId", async () => {
      const projectId = "proj-count-err";
      const serviceError = new Error("Project count failed");
      vi.mocked(services.cardService.countByProjectId).mockRejectedValue(
        serviceError,
      );
      await expect(caller.card.countByProjectId(projectId)).rejects.toThrow(
        expect.objectContaining({ message: serviceError.message }),
      );
      expect(services.authService.canAccessProject).toHaveBeenCalledTimes(1);
      expect(services.cardService.countByProjectId).toHaveBeenCalledTimes(1);
    });
  });

  describe("card.assignToCurrentUser", () => {
    it("should assign card to current user, trigger pusher, after verifying card access", async () => {
      // Arrange
      const inputData = { cardId: 22 };
      // Use base helper, assuming service returns base structure
      const mockAssignedCard = createMockCardBase(
        inputData.cardId,
        "col-assign",
        { assignedToId: `pu-${mockUserId}` },
      );
      vi.mocked(services.cardService.assignToCurrentUser).mockResolvedValue(
        mockAssignedCard,
      );

      // Act
      const result = await caller.card.assignToCurrentUser(inputData);

      // Assert
      expect(result).toEqual(mockAssignedCard);
      expect(services.authService.canAccessCard).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessCard).toHaveBeenCalledWith(
        inputData.cardId,
      );
      expect(services.cardService.assignToCurrentUser).toHaveBeenCalledTimes(1);
      expect(services.cardService.assignToCurrentUser).toHaveBeenCalledWith(
        inputData.cardId,
      );
      expect(pusherMock.trigger).toHaveBeenCalledTimes(1);
      expect(pusherMock.trigger).toHaveBeenCalledWith(
        pusherChannels.card.name,
        pusherChannels.card.events.assignedToCurrentUser.name,
        expect.objectContaining({
          input: inputData,
          returning: mockAssignedCard,
          userId: mockUserId,
        }),
      );
    });

    // Add FORBIDDEN and service error tests for assignToCurrentUser
    it("should throw FORBIDDEN if user cannot access card for assignToCurrentUser", async () => {
      const inputData = { cardId: 23 };
      const authError = new TRPCError({
        code: "FORBIDDEN",
        message: "Cannot access card",
      });
      vi.mocked(services.authService.canAccessCard).mockRejectedValue(
        authError,
      );
      await expect(caller.card.assignToCurrentUser(inputData)).rejects.toThrow(
        authError,
      );
      expect(services.authService.canAccessCard).toHaveBeenCalledTimes(1);
      expect(services.cardService.assignToCurrentUser).not.toHaveBeenCalled();
      expect(pusherMock.trigger).not.toHaveBeenCalled();
    });

    it("should handle errors from cardService.assignToCurrentUser", async () => {
      const inputData = { cardId: 24 };
      const serviceError = new Error("Assign failed");
      vi.mocked(services.cardService.assignToCurrentUser).mockRejectedValue(
        serviceError,
      );
      await expect(caller.card.assignToCurrentUser(inputData)).rejects.toThrow(
        expect.objectContaining({ message: serviceError.message }),
      );
      expect(services.authService.canAccessCard).toHaveBeenCalledTimes(1);
      expect(services.cardService.assignToCurrentUser).toHaveBeenCalledTimes(1);
      expect(pusherMock.trigger).not.toHaveBeenCalled();
    });
  });
});
