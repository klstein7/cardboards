import { auth } from "@clerk/nextjs/server";
import { describe, beforeEach, it, expect, vi } from "vitest";
import { and, desc, eq } from "drizzle-orm";

import { mockDb, mockTx } from "../../../../test/mocks";
import {
  boards,
  cardComments,
  cards,
  columns,
  projects,
  projectUsers,
  users,
} from "../../db/schema";
import { CardCommentService } from "../card-comment.service";

// Mock Clerk auth
vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

describe("CardCommentService", () => {
  let cardCommentService: CardCommentService;
  let mockHistoryService: any;
  let mockNotificationService: any;
  let mockProjectService: any;

  beforeEach(() => {
    // Create mock services
    mockHistoryService = {
      create: vi.fn().mockResolvedValue({
        id: "history-123",
      }),
    };

    mockNotificationService = {
      create: vi.fn().mockResolvedValue({
        id: "notification-123",
      }),
    };

    mockProjectService = {
      getById: vi.fn().mockResolvedValue({
        id: "project-123",
        name: "Test Project",
      }),
      getProjectIdByCardId: vi.fn().mockResolvedValue("project-123"),
    };

    // Create a new instance of CardCommentService before each test
    cardCommentService = new CardCommentService(
      mockDb,
      mockHistoryService,
      mockNotificationService,
      mockProjectService,
    );

    // Reset all mocks
    vi.resetAllMocks();

    // Default auth mock
    vi.mocked(auth).mockReturnValue({
      userId: "user-123",
    } as any);
  });

  describe("get", () => {
    it("should get a comment by ID", async () => {
      // Setup
      const commentId = "comment-123";
      const comment = {
        id: commentId,
        cardId: 456,
        projectUserId: "project-user-123",
        content: "Test comment",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock select operation
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([comment]),
        }),
      } as any);

      // Execute
      const result = await cardCommentService.get(commentId);

      // Assert
      expect(result).toEqual(comment);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.select().from).toHaveBeenCalledWith(cardComments);
      expect(mockDb.select().from(cardComments).where).toHaveBeenCalledWith(
        eq(cardComments.id, commentId),
      );
    });

    it("should throw if comment not found", async () => {
      // Setup
      const commentId = "nonexistent-comment";

      // Mock select operation to return empty array
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      } as any);

      // Assert
      await expect(cardCommentService.get(commentId)).rejects.toThrow(
        "Card comment not found",
      );
    });

    it("should use transaction when provided", async () => {
      // Setup
      const commentId = "comment-123";
      const comment = {
        id: commentId,
        cardId: 456,
        projectUserId: "project-user-123",
        content: "Test comment",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock transaction select operation
      mockTx.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([comment]),
        }),
      } as any);

      // Execute
      const result = await cardCommentService.get(commentId, mockTx);

      // Assert
      expect(result).toEqual(comment);
      expect(mockTx.select).toHaveBeenCalled();
      expect(mockTx.select().from).toHaveBeenCalledWith(cardComments);
      expect(mockTx.select().from(cardComments).where).toHaveBeenCalledWith(
        eq(cardComments.id, commentId),
      );
      // Ensure DB wasn't used directly
      expect(mockDb.select).not.toHaveBeenCalled();
    });
  });

  describe("create", () => {
    it("should create a new card comment", async () => {
      // Setup
      const commentData = {
        cardId: 456,
        content: "Test comment",
      };

      const createdComment = {
        id: "comment-123",
        ...commentData,
        projectUserId: "project-user-123",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock card details select
      mockDb.select.mockImplementation((fields) => {
        // For card details query
        if (fields && fields.title) {
          return {
            from: vi.fn().mockReturnValue({
              innerJoin: vi.fn().mockReturnThis(),
              where: vi.fn().mockResolvedValue([
                {
                  title: "Test Card",
                  assignedToId: "project-user-456", // Different user
                  card: { id: 456, title: "Test Card" },
                  projectId: "project-123",
                  columnName: "To Do",
                },
              ]),
            }),
          } as any;
        }
        // For project user query
        else if (fields && fields.projectUserId) {
          return {
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([
                {
                  projectUserId: "project-user-123",
                },
              ]),
            }),
          } as any;
        }
        // For commenter name query
        else if (fields && fields.userName) {
          return {
            from: vi.fn().mockReturnValue({
              innerJoin: vi.fn().mockReturnThis(),
              where: vi.fn().mockResolvedValue([
                {
                  userName: "Test User",
                },
              ]),
            }),
          } as any;
        }
        // For assigned user ID query
        else if (fields && fields.userId) {
          return {
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([
                {
                  userId: "user-456",
                },
              ]),
            }),
          } as any;
        }

        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([]),
          }),
        } as any;
      });

      // Mock insert operation
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([createdComment]),
      } as any);

      // Execute
      const result = await cardCommentService.create(commentData);

      // Assert
      expect(result).toEqual(createdComment);
      expect(mockDb.insert).toHaveBeenCalledWith(cardComments);
      expect(mockDb.insert(cardComments).values).toHaveBeenCalledWith({
        ...commentData,
        projectUserId: "project-user-123",
      });

      // Verify history was created
      expect(mockHistoryService.create).toHaveBeenCalledWith(
        {
          entityType: "card_comment",
          entityId: createdComment.id,
          action: "create",
          projectId: "project-123",
        },
        expect.anything(),
      );

      // Verify notification was created for assigned user
      expect(mockNotificationService.create).toHaveBeenCalledWith(
        {
          userId: "user-456",
          projectId: "project-123",
          entityType: "card_comment",
          entityId: createdComment.id,
          type: "comment",
          title: 'New comment on "Test Card"',
          content:
            'Test User commented on a card assigned to you: "Test Card" in column "To Do"',
        },
        expect.anything(),
      );
    });

    it("should throw if user is not authenticated", async () => {
      // Setup
      const commentData = {
        cardId: 456,
        content: "Test comment",
      };

      // Mock auth to return no user
      vi.mocked(auth).mockReturnValue({
        userId: null,
      } as any);

      // Assert
      await expect(cardCommentService.create(commentData)).rejects.toThrow(
        "User is not authenticated",
      );
    });

    it("should throw if card is not found", async () => {
      // Setup
      const commentData = {
        cardId: 999,
        content: "Test comment",
      };

      // Mock card details select to return no card
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnThis(),
          where: vi.fn().mockResolvedValue([]),
        }),
      } as any);

      // Assert
      await expect(cardCommentService.create(commentData)).rejects.toThrow(
        "Card not found",
      );
    });

    it("should throw if user is not a member of the project", async () => {
      // Setup
      const commentData = {
        cardId: 456,
        content: "Test comment",
      };

      // Mock card details
      mockDb.select.mockImplementation((fields) => {
        // For card details query
        if (fields && fields.title) {
          return {
            from: vi.fn().mockReturnValue({
              innerJoin: vi.fn().mockReturnThis(),
              where: vi.fn().mockResolvedValue([
                {
                  title: "Test Card",
                  projectId: "project-123",
                },
              ]),
            }),
          } as any;
        }
        // For project user query - user not found
        else {
          return {
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([]),
            }),
          } as any;
        }
      });

      // Assert
      await expect(cardCommentService.create(commentData)).rejects.toThrow(
        "User is not a member of the project",
      );
    });
  });

  describe("list", () => {
    it("should list all comments for a card", async () => {
      // Setup
      const cardId = 456;
      const commentsList = [
        {
          id: "comment-1",
          cardId,
          content: "First comment",
          projectUser: {
            user: { id: "user-123", name: "User One" },
          },
        },
        {
          id: "comment-2",
          cardId,
          content: "Second comment",
          projectUser: {
            user: { id: "user-456", name: "User Two" },
          },
        },
      ];

      // Mock query operations
      mockDb.query = {
        cardComments: {
          findMany: vi.fn().mockResolvedValue(commentsList),
        },
      } as any;

      // Execute
      const result = await cardCommentService.list(cardId);

      // Assert
      expect(result).toEqual(commentsList);
      expect(mockDb.query.cardComments.findMany).toHaveBeenCalledWith({
        where: eq(cardComments.cardId, cardId),
        orderBy: desc(cardComments.createdAt),
        with: {
          projectUser: {
            with: {
              user: true,
            },
          },
        },
      });
    });

    it("should use transaction when provided", async () => {
      // Setup
      const cardId = 456;
      const commentsList = [
        {
          id: "comment-1",
          cardId,
          content: "First comment",
          projectUser: {
            user: { id: "user-123", name: "User One" },
          },
        },
      ];

      // Mock transaction query operations
      mockTx.query = {
        cardComments: {
          findMany: vi.fn().mockResolvedValue(commentsList),
        },
      } as any;

      // Execute
      const result = await cardCommentService.list(cardId, mockTx);

      // Assert
      expect(result).toEqual(commentsList);
      expect(mockTx.query.cardComments.findMany).toHaveBeenCalled();
      // Ensure DB wasn't used directly
      expect(mockDb.query.cardComments?.findMany).not.toHaveBeenCalled();
    });
  });

  describe("remove", () => {
    it("should delete a comment", async () => {
      // Setup
      const commentId = "comment-123";
      const comment = {
        id: commentId,
        cardId: 456,
        projectUserId: "project-user-123",
        content: "Test comment",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock get method
      vi.spyOn(cardCommentService, "get").mockResolvedValue(comment);

      // Mock select for project user check
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi
          .fn()
          .mockResolvedValue([{ id: "project-user-123", role: "admin" }]),
      } as any);

      // Mock delete operation
      mockDb.delete.mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([comment]),
        }),
      } as any);

      // Execute
      const result = await cardCommentService.remove(commentId);

      // Assert
      expect(result).toEqual(comment);
      expect(cardCommentService.get).toHaveBeenCalledWith(
        commentId,
        expect.anything(),
      );
      expect(mockDb.delete).toHaveBeenCalledWith(cardComments);
      expect(mockDb.delete(cardComments).where).toHaveBeenCalledWith(
        eq(cardComments.id, commentId),
      );
    });

    it("should throw if comment not found during delete", async () => {
      // Setup
      const commentId = "nonexistent-comment";

      // Mock get method to throw error
      vi.spyOn(cardCommentService, "get").mockRejectedValue(
        new Error("Card comment not found"),
      );

      // Assert
      await expect(cardCommentService.remove(commentId)).rejects.toThrow(
        "Card comment not found",
      );
    });
  });

  describe("update", () => {
    it("should update a comment", async () => {
      // Setup
      const commentId = "comment-123";
      const updateData = {
        content: "Updated comment",
      };

      const updatedComment = {
        id: commentId,
        cardId: 456,
        projectUserId: "project-user-123",
        content: "Updated comment",
        updatedAt: new Date(),
      };

      // Mock get method to return the comment
      vi.spyOn(cardCommentService, "get").mockResolvedValue({
        id: commentId,
        cardId: 456,
        projectUserId: "project-user-123",
        content: "Original comment",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Mock select for project user check
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi
          .fn()
          .mockResolvedValue([{ id: "project-user-123", role: "admin" }]),
      } as any);

      // Mock update operation
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updatedComment]),
          }),
        }),
      } as any);

      // Execute
      const result = await cardCommentService.update(commentId, updateData);

      // Assert
      expect(result).toEqual(updatedComment);
      expect(mockDb.update).toHaveBeenCalledWith(cardComments);
      expect(mockDb.update(cardComments).set).toHaveBeenCalledWith({
        ...updateData,
        updatedAt: expect.any(Date),
      });
    });

    it("should throw if comment update fails", async () => {
      // Setup
      const commentId = "nonexistent-comment";
      const updateData = {
        content: "Updated comment",
      };

      // Mock get method to return the comment
      vi.spyOn(cardCommentService, "get").mockResolvedValue({
        id: commentId,
        cardId: 456,
        projectUserId: "project-user-123",
        content: "Original comment",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Mock select for project user check
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi
          .fn()
          .mockResolvedValue([{ id: "project-user-123", role: "admin" }]),
      } as any);

      // Mock update operation to return empty array
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as any);

      // Assert
      await expect(
        cardCommentService.update(commentId, updateData),
      ).rejects.toThrow("Failed to update card comment");
    });
  });
});
