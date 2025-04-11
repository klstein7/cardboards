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

// Mock Clerk auth
vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

import { type AppRouter, appRouter } from "~/server/api/routers";
import { services } from "~/server/services/container";
import {
  type CardCommentCreateSchema,
  type CardCommentUpdateSchema,
} from "~/server/zod"; // Import necessary schemas

// Mock the specific services used by the cardComment router
vi.mock("~/server/services/container", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("~/server/services/container")>();
  return {
    ...original,
    services: {
      ...original.services,
      cardCommentService: {
        create: vi.fn(),
        list: vi.fn(),
        get: vi.fn(),
        remove: vi.fn(),
        update: vi.fn(),
      },
      // Ensure all needed authService methods are mocked
      authService: {
        ...original.services.authService, // Spread existing mocks if applicable
        canAccessCard: vi.fn(),
        // Mock other methods if they are potentially called via spread
        requireProjectAdmin: vi.fn(),
        canAccessProject: vi.fn(),
        requireBoardAdmin: vi.fn(),
        canAccessBoard: vi.fn(),
      },
    },
  };
});

describe("Card Comment Router", () => {
  const mockUserId = "user-test-comment-123";
  let caller: ReturnType<typeof appRouter.createCaller>;

  type RouterInput = inferRouterInputs<AppRouter>;
  type RouterOutput = inferRouterOutputs<AppRouter>;

  // Helper to create mock comment output (base structure)
  const createMockComment = (
    id: string,
    cardId: number,
    // Use a more specific base type if possible, e.g., from schema
    overrides: Partial<
      Omit<RouterOutput["cardComment"]["list"][number], "projectUser">
    > = {},
  ): Omit<RouterOutput["cardComment"]["list"][number], "projectUser"> => ({
    id,
    cardId,
    // Assuming create/get/update/delete return projectUserId, not nested user
    projectUserId: `pu-${mockUserId}`, // Add mock projectUserId
    content: `Comment content ${id}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    // Removed 'user' field as it's not in the base return type
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    // Setup authenticated user context
    vi.mocked(auth).mockReturnValue({ userId: mockUserId } as any);
    const ctx = { userId: mockUserId };
    caller = appRouter.createCaller(ctx);

    // Default successful auth mock
    vi.mocked(services.authService.canAccessCard).mockResolvedValue(
      {} as any, // Assume success resolves with card data or similar
    );
  });

  // --- Test Suites for each procedure ---

  // 1. Create
  describe("cardComment.create", () => {
    it("should create a comment after verifying card access", async () => {
      // Arrange
      const inputData: z.infer<typeof CardCommentCreateSchema> = {
        cardId: 101,
        content: "This is a new comment.",
      };
      // Use the corrected helper for the base comment structure
      const mockCreatedComment = createMockComment(
        "comment-1",
        inputData.cardId,
        {
          content: inputData.content,
          // projectUserId will be set by the service mock if needed, or use helper default
        },
      );
      vi.mocked(services.cardCommentService.create).mockResolvedValue(
        mockCreatedComment,
      );

      // Act
      const result = await caller.cardComment.create(inputData);

      // Assert
      expect(result).toEqual(mockCreatedComment);
      expect(services.authService.canAccessCard).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessCard).toHaveBeenCalledWith(
        inputData.cardId,
      );
      expect(services.cardCommentService.create).toHaveBeenCalledTimes(1);
      expect(services.cardCommentService.create).toHaveBeenCalledWith(
        inputData,
      );
    });

    it("should throw FORBIDDEN if user cannot access the card", async () => {
      // Arrange
      const inputData: z.infer<typeof CardCommentCreateSchema> = {
        cardId: 102,
        content: "This comment should fail.",
      };
      const authError = new TRPCError({
        code: "FORBIDDEN",
        message: "Cannot access card",
      });
      vi.mocked(services.authService.canAccessCard).mockRejectedValue(
        authError,
      );

      // Act & Assert
      await expect(caller.cardComment.create(inputData)).rejects.toThrow(
        authError,
      );
      expect(services.authService.canAccessCard).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessCard).toHaveBeenCalledWith(
        inputData.cardId,
      );
      expect(services.cardCommentService.create).not.toHaveBeenCalled();
    });

    it("should handle errors from cardCommentService.create", async () => {
      // Arrange
      const inputData: z.infer<typeof CardCommentCreateSchema> = {
        cardId: 103,
        content: "This comment triggers a service error.",
      };
      const serviceError = new Error("Database create error");
      vi.mocked(services.cardCommentService.create).mockRejectedValue(
        serviceError,
      );

      // Act & Assert
      await expect(caller.cardComment.create(inputData)).rejects.toThrow(
        expect.objectContaining({ message: serviceError.message }),
      );
      expect(services.authService.canAccessCard).toHaveBeenCalledTimes(1); // Auth check happens first
      expect(services.cardCommentService.create).toHaveBeenCalledTimes(1);
      expect(services.cardCommentService.create).toHaveBeenCalledWith(
        inputData,
      );
    });
  });

  // 2. List
  describe("cardComment.list", () => {
    it("should list comments for a card after verifying card access", async () => {
      // Arrange
      const cardId = 201;
      // Explicitly create mock data matching the list return type (with projectUser.user)
      const mockComments: RouterOutput["cardComment"]["list"] = [
        {
          ...createMockComment("comment-list-1", cardId),
          projectUser: {
            id: `pu-${mockUserId}`,
            userId: mockUserId,
            role: "member",
            projectId: "proj-mock",
            isFavorite: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            user: {
              id: mockUserId,
              name: "Mock User 1",
              image: null,
              email: "",
            } as any,
          },
        },
        {
          ...createMockComment("comment-list-2", cardId, {
            content: "Another comment",
          }),
          projectUser: {
            id: `pu-${mockUserId}-other`,
            userId: "other-user-id",
            role: "member",
            projectId: "proj-mock",
            isFavorite: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            user: {
              id: "other-user-id",
              name: "Mock User 2",
              image: null,
              email: "",
            } as any,
          },
        },
      ];
      vi.mocked(services.cardCommentService.list).mockResolvedValue(
        mockComments,
      );

      // Act
      const result = await caller.cardComment.list(cardId);

      // Assert
      expect(result).toEqual(mockComments);
      expect(services.authService.canAccessCard).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessCard).toHaveBeenCalledWith(cardId);
      expect(services.cardCommentService.list).toHaveBeenCalledTimes(1);
      expect(services.cardCommentService.list).toHaveBeenCalledWith(cardId);
    });

    it("should throw FORBIDDEN if user cannot access the card for listing", async () => {
      // Arrange
      const cardId = 202;
      const authError = new TRPCError({
        code: "FORBIDDEN",
        message: "Cannot access card",
      });
      vi.mocked(services.authService.canAccessCard).mockRejectedValue(
        authError,
      );

      // Act & Assert
      await expect(caller.cardComment.list(cardId)).rejects.toThrow(authError);
      expect(services.authService.canAccessCard).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessCard).toHaveBeenCalledWith(cardId);
      expect(services.cardCommentService.list).not.toHaveBeenCalled();
    });

    it("should handle errors from cardCommentService.list", async () => {
      // Arrange
      const cardId = 203;
      const serviceError = new Error("Database list error");
      vi.mocked(services.cardCommentService.list).mockRejectedValue(
        serviceError,
      );

      // Act & Assert
      await expect(caller.cardComment.list(cardId)).rejects.toThrow(
        expect.objectContaining({ message: serviceError.message }),
      );
      expect(services.authService.canAccessCard).toHaveBeenCalledTimes(1); // Auth check happens first
      expect(services.cardCommentService.list).toHaveBeenCalledTimes(1);
      expect(services.cardCommentService.list).toHaveBeenCalledWith(cardId);
    });
  });

  // 3. Remove
  describe("cardComment.remove", () => {
    it("should remove a comment after getting it and verifying card access", async () => {
      // Arrange
      const commentId = "comment-to-remove-1";
      const cardId = 301;
      // Use base helper for the comment returned by 'get'
      const mockComment = createMockComment(commentId, cardId);
      // Adjust remove response if it returns the deleted comment object
      const mockRemoveResponse = mockComment; // Assuming remove returns the deleted object

      vi.mocked(services.cardCommentService.get).mockResolvedValue(mockComment);
      vi.mocked(services.cardCommentService.remove).mockResolvedValue(
        mockRemoveResponse as any,
      );

      // Act
      const result = await caller.cardComment.remove(commentId);

      // Assert
      expect(result).toEqual(mockRemoveResponse);
      // Step 1: Get the comment
      expect(services.cardCommentService.get).toHaveBeenCalledTimes(1);
      expect(services.cardCommentService.get).toHaveBeenCalledWith(commentId);
      // Step 2: Verify access to the card it belongs to
      expect(services.authService.canAccessCard).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessCard).toHaveBeenCalledWith(cardId);
      // Step 3: Remove the comment
      expect(services.cardCommentService.remove).toHaveBeenCalledTimes(1);
      expect(services.cardCommentService.remove).toHaveBeenCalledWith(
        commentId,
      );
    });

    it("should handle errors from cardCommentService.get before checking access", async () => {
      // Arrange
      const commentId = "comment-get-fail-remove";
      const serviceError = new Error("Comment not found");
      vi.mocked(services.cardCommentService.get).mockRejectedValue(
        serviceError,
      );

      // Act & Assert
      await expect(caller.cardComment.remove(commentId)).rejects.toThrow(
        expect.objectContaining({ message: serviceError.message }),
      );
      expect(services.cardCommentService.get).toHaveBeenCalledTimes(1);
      expect(services.cardCommentService.get).toHaveBeenCalledWith(commentId);
      // Access check and remove should not happen
      expect(services.authService.canAccessCard).not.toHaveBeenCalled();
      expect(services.cardCommentService.remove).not.toHaveBeenCalled();
    });

    it("should throw FORBIDDEN if user cannot access the comment's card", async () => {
      // Arrange
      const commentId = "comment-remove-forbidden";
      const cardId = 302;
      const mockComment = createMockComment(commentId, cardId);
      vi.mocked(services.cardCommentService.get).mockResolvedValue(mockComment);

      const authError = new TRPCError({
        code: "FORBIDDEN",
        message: "Cannot access card",
      });
      vi.mocked(services.authService.canAccessCard).mockRejectedValue(
        authError,
      );

      // Act & Assert
      await expect(caller.cardComment.remove(commentId)).rejects.toThrow(
        authError,
      );
      expect(services.cardCommentService.get).toHaveBeenCalledTimes(1);
      expect(services.cardCommentService.get).toHaveBeenCalledWith(commentId);
      expect(services.authService.canAccessCard).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessCard).toHaveBeenCalledWith(cardId);
      expect(services.cardCommentService.remove).not.toHaveBeenCalled();
    });

    it("should handle errors from cardCommentService.remove", async () => {
      // Arrange
      const commentId = "comment-remove-fail";
      const cardId = 303;
      const mockComment = createMockComment(commentId, cardId);
      vi.mocked(services.cardCommentService.get).mockResolvedValue(mockComment);

      const serviceError = new Error("Database remove error");
      vi.mocked(services.cardCommentService.remove).mockRejectedValue(
        serviceError,
      );

      // Act & Assert
      await expect(caller.cardComment.remove(commentId)).rejects.toThrow(
        expect.objectContaining({ message: serviceError.message }),
      );
      expect(services.cardCommentService.get).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessCard).toHaveBeenCalledTimes(1); // Get and Auth checks happen first
      expect(services.cardCommentService.remove).toHaveBeenCalledTimes(1);
      expect(services.cardCommentService.remove).toHaveBeenCalledWith(
        commentId,
      );
    });
  });

  // 4. Update
  describe("cardComment.update", () => {
    it("should update a comment after getting it and verifying card access", async () => {
      // Arrange
      const inputData: z.infer<typeof CardCommentUpdateSchema> = {
        cardCommentId: "comment-to-update-1",
        data: { content: "Updated comment text." },
      };
      const cardId = 401;
      // Use base helper for the comment returned by 'get'
      const mockExistingComment = createMockComment(
        inputData.cardCommentId,
        cardId,
      );
      // Use base helper structure for the updated comment returned by 'update'
      const mockUpdatedComment = {
        ...mockExistingComment,
        ...inputData.data,
        updatedAt: expect.any(Date), // Service likely updates this
      };

      vi.mocked(services.cardCommentService.get).mockResolvedValue(
        mockExistingComment,
      );
      vi.mocked(services.cardCommentService.update).mockResolvedValue(
        mockUpdatedComment as any,
      );

      // Act
      const result = await caller.cardComment.update(inputData);

      // Assert
      expect(result).toEqual(mockUpdatedComment);
      // Step 1: Get the comment
      expect(services.cardCommentService.get).toHaveBeenCalledTimes(1);
      expect(services.cardCommentService.get).toHaveBeenCalledWith(
        inputData.cardCommentId,
      );
      // Step 2: Verify access to the card it belongs to
      expect(services.authService.canAccessCard).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessCard).toHaveBeenCalledWith(cardId);
      // Step 3: Update the comment
      expect(services.cardCommentService.update).toHaveBeenCalledTimes(1);
      expect(services.cardCommentService.update).toHaveBeenCalledWith(
        inputData.cardCommentId,
        inputData.data,
      );
    });

    it("should handle errors from cardCommentService.get before checking access for update", async () => {
      // Arrange
      const inputData: z.infer<typeof CardCommentUpdateSchema> = {
        cardCommentId: "comment-get-fail-update",
        data: { content: "Update attempt" },
      };
      const serviceError = new Error("Comment not found for update");
      vi.mocked(services.cardCommentService.get).mockRejectedValue(
        serviceError,
      );

      // Act & Assert
      await expect(caller.cardComment.update(inputData)).rejects.toThrow(
        expect.objectContaining({ message: serviceError.message }),
      );
      expect(services.cardCommentService.get).toHaveBeenCalledTimes(1);
      expect(services.cardCommentService.get).toHaveBeenCalledWith(
        inputData.cardCommentId,
      );
      // Access check and update should not happen
      expect(services.authService.canAccessCard).not.toHaveBeenCalled();
      expect(services.cardCommentService.update).not.toHaveBeenCalled();
    });

    it("should throw FORBIDDEN if user cannot access the comment's card for update", async () => {
      // Arrange
      const inputData: z.infer<typeof CardCommentUpdateSchema> = {
        cardCommentId: "comment-update-forbidden",
        data: { content: "Forbidden update" },
      };
      const cardId = 402;
      const mockComment = createMockComment(inputData.cardCommentId, cardId);
      vi.mocked(services.cardCommentService.get).mockResolvedValue(mockComment);

      const authError = new TRPCError({
        code: "FORBIDDEN",
        message: "Cannot access card",
      });
      vi.mocked(services.authService.canAccessCard).mockRejectedValue(
        authError,
      );

      // Act & Assert
      await expect(caller.cardComment.update(inputData)).rejects.toThrow(
        authError,
      );
      expect(services.cardCommentService.get).toHaveBeenCalledTimes(1);
      expect(services.cardCommentService.get).toHaveBeenCalledWith(
        inputData.cardCommentId,
      );
      expect(services.authService.canAccessCard).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessCard).toHaveBeenCalledWith(cardId);
      expect(services.cardCommentService.update).not.toHaveBeenCalled();
    });

    it("should handle errors from cardCommentService.update", async () => {
      // Arrange
      const inputData: z.infer<typeof CardCommentUpdateSchema> = {
        cardCommentId: "comment-update-fail",
        data: { content: "Error update" },
      };
      const cardId = 403;
      const mockComment = createMockComment(inputData.cardCommentId, cardId);
      vi.mocked(services.cardCommentService.get).mockResolvedValue(mockComment);

      const serviceError = new Error("Database update error");
      vi.mocked(services.cardCommentService.update).mockRejectedValue(
        serviceError,
      );

      // Act & Assert
      await expect(caller.cardComment.update(inputData)).rejects.toThrow(
        expect.objectContaining({ message: serviceError.message }),
      );
      expect(services.cardCommentService.get).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessCard).toHaveBeenCalledTimes(1); // Get and Auth checks happen first
      expect(services.cardCommentService.update).toHaveBeenCalledTimes(1);
      expect(services.cardCommentService.update).toHaveBeenCalledWith(
        inputData.cardCommentId,
        inputData.data,
      );
    });
  });
});
