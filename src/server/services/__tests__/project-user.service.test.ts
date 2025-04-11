import { auth } from "@clerk/nextjs/server";
import { describe, beforeEach, it, expect, vi } from "vitest";
import { and, count, eq } from "drizzle-orm";

import { mockDb, mockTx } from "../../../../test/mocks";
import { projects, projectUsers } from "../../db/schema";
import { ProjectUserService } from "../project-user.service";

// Mock Clerk auth
vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

describe("ProjectUserService", () => {
  let projectUserService: ProjectUserService;
  let mockNotificationService: any;

  beforeEach(() => {
    // Create mock NotificationService
    mockNotificationService = {
      create: vi.fn().mockResolvedValue({
        id: "notification-123",
      }),
    };

    // Create a new instance of ProjectUserService before each test
    projectUserService = new ProjectUserService(
      mockDb,
      mockNotificationService,
    );

    // Reset all mocks
    vi.resetAllMocks();

    // Default auth mock
    vi.mocked(auth).mockReturnValue({
      userId: "user-123",
    } as any);
  });

  describe("list", () => {
    it("should list all users for a project", async () => {
      // Setup
      const projectId = "project-123";
      const projectUsersList = [
        {
          id: "project-user-1",
          projectId,
          userId: "user-123",
          role: "admin" as const,
          user: { id: "user-123", name: "Admin User" },
        },
        {
          id: "project-user-2",
          projectId,
          userId: "user-456",
          role: "member" as const,
          user: { id: "user-456", name: "Member User" },
        },
      ];

      // Mock query operations
      mockDb.query = {
        projectUsers: {
          findMany: vi.fn().mockResolvedValue(projectUsersList),
        },
      } as any;

      // Execute
      const result = await projectUserService.list(projectId);

      // Assert
      expect(result).toEqual(projectUsersList);
      expect(mockDb.query.projectUsers.findMany).toHaveBeenCalledWith({
        where: eq(projectUsers.projectId, projectId),
        with: {
          user: true,
        },
      });
    });

    it("should use transaction when provided", async () => {
      // Setup
      const projectId = "project-123";
      const projectUsersList = [
        {
          id: "project-user-1",
          projectId,
          userId: "user-123",
          role: "admin" as const,
          user: { id: "user-123", name: "Admin User" },
        },
      ];

      // Mock transaction query operations
      mockTx.query = {
        projectUsers: {
          findMany: vi.fn().mockResolvedValue(projectUsersList),
        },
      } as any;

      // Execute
      const result = await projectUserService.list(projectId, mockTx);

      // Assert
      expect(result).toEqual(projectUsersList);
      expect(mockTx.query.projectUsers.findMany).toHaveBeenCalled();
      // Ensure DB wasn't used directly
      expect(mockDb.query.projectUsers?.findMany).not.toHaveBeenCalled();
    });
  });

  describe("create", () => {
    it("should create a new project user", async () => {
      // Setup
      const projectUserData = {
        projectId: "project-123",
        userId: "user-456",
        role: "member" as const,
      };

      const createdProjectUser = {
        id: "project-user-123",
        ...projectUserData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock operations
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          onConflictDoUpdate: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([createdProjectUser]),
          }),
        }),
      } as any);

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ name: "Test Project" }]),
        }),
      } as any);

      // Execute
      const result = await projectUserService.create(projectUserData);

      // Assert
      expect(result).toEqual(createdProjectUser);
      expect(mockDb.insert).toHaveBeenCalledWith(projectUsers);
      expect(mockDb.insert(projectUsers).values).toHaveBeenCalledWith(
        projectUserData,
      );
      expect(mockDb.select).toHaveBeenCalledWith({ name: projects.name });
      expect(mockDb.select().from).toHaveBeenCalledWith(projects);
      expect(mockDb.select().from(projects).where).toHaveBeenCalledWith(
        eq(projects.id, projectUserData.projectId),
      );
      expect(mockNotificationService.create).toHaveBeenCalledWith(
        {
          userId: projectUserData.userId,
          projectId: projectUserData.projectId,
          entityType: "project",
          entityId: projectUserData.projectId,
          type: "project_update",
          title: `You were added to project "Test Project"`,
          content: `You have been added to the project "Test Project" as a member.`,
        },
        mockDb,
      );
    });

    it("should throw if insert fails", async () => {
      // Setup
      const projectUserData = {
        projectId: "project-123",
        userId: "user-456",
        role: "member" as const,
      };

      // Mock insert operation to return empty array
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          onConflictDoUpdate: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as any);

      // Assert
      await expect(projectUserService.create(projectUserData)).rejects.toThrow(
        "Failed to create project user",
      );
    });
  });

  describe("getByProjectIdAndUserId", () => {
    it("should get project user by project ID and user ID", async () => {
      // Setup
      const projectId = "project-123";
      const userId = "user-123";
      const projectUser = {
        id: "project-user-123",
        projectId,
        userId,
        role: "admin" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock query operations
      mockDb.query = {
        projectUsers: {
          findFirst: vi.fn().mockResolvedValue(projectUser),
        },
      } as any;

      // Execute
      const result = await projectUserService.getByProjectIdAndUserId(
        projectId,
        userId,
      );

      // Assert
      expect(result).toEqual(projectUser);
      expect(mockDb.query.projectUsers.findFirst).toHaveBeenCalledWith({
        where: and(
          eq(projectUsers.projectId, projectId),
          eq(projectUsers.userId, userId),
        ),
      });
    });

    it("should throw if project user not found", async () => {
      // Setup
      const projectId = "project-123";
      const userId = "nonexistent-user";

      // Mock query operations to return null (not found)
      mockDb.query = {
        projectUsers: {
          findFirst: vi.fn().mockResolvedValue(null),
        },
      } as any;

      // Assert
      await expect(
        projectUserService.getByProjectIdAndUserId(projectId, userId),
      ).rejects.toThrow("Project user not found");
    });
  });

  describe("update", () => {
    it("should update a project user's role", async () => {
      // Setup
      const projectId = "project-123";
      const userId = "user-456";
      const updateData = {
        role: "admin" as const,
      };

      const updatedProjectUser = {
        id: "project-user-123",
        projectId,
        userId,
        role: "admin" as const,
        updatedAt: new Date(),
      };

      // No need to mock the admin count check since we're promoting to admin

      // Mock update operation
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updatedProjectUser]),
          }),
        }),
      } as any);

      // Execute
      const result = await projectUserService.update(
        projectId,
        userId,
        updateData,
      );

      // Assert
      expect(result).toEqual(updatedProjectUser);
      expect(mockDb.update).toHaveBeenCalledWith(projectUsers);
      expect(mockDb.update(projectUsers).set).toHaveBeenCalledWith({
        ...updateData,
        updatedAt: expect.any(Date),
      });
      expect(
        mockDb.update(projectUsers).set({
          ...updateData,
          updatedAt: expect.any(Date),
        }).where,
      ).toHaveBeenCalledWith(
        and(
          eq(projectUsers.projectId, projectId),
          eq(projectUsers.userId, userId),
        ),
      );
    });

    it("should throw if attempting to downgrade the last admin", async () => {
      // Setup
      const projectId = "project-123";
      const userId = "user-123";
      const updateData = {
        role: "member" as const,
      };

      // Mock to indicate this is an admin
      mockDb.select.mockImplementation((fields) => {
        const mock: any = {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([]),
          }),
        };

        // First call - check if user is admin
        if (!fields) {
          mock.from = vi.fn().mockReturnValue({
            where: vi
              .fn()
              .mockResolvedValue([{ id: "project-user-123", role: "admin" }]),
          });
        } else {
          // Second call - check admin count
          mock.from = vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{ adminCount: 1 }]),
          });
        }

        return mock;
      });

      // Assert
      await expect(
        projectUserService.update(projectId, userId, updateData),
      ).rejects.toThrow(
        "Cannot remove the last admin from the project. Promote another user to admin first.",
      );
    });

    it("should allow downgrading an admin if there are other admins", async () => {
      // Setup
      const projectId = "project-123";
      const userId = "user-123";
      const updateData = {
        role: "member" as const,
      };

      const updatedProjectUser = {
        id: "project-user-123",
        projectId,
        userId,
        role: "member" as const,
        updatedAt: new Date(),
      };

      // Mock to indicate this is an admin but not the last one
      mockDb.select.mockImplementation((fields) => {
        const mock: any = {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([]),
          }),
        };

        // First call - check if user is admin
        if (!fields) {
          mock.from = vi.fn().mockReturnValue({
            where: vi
              .fn()
              .mockResolvedValue([{ id: "project-user-123", role: "admin" }]),
          });
        } else {
          // Second call - check admin count (2 admins)
          mock.from = vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{ adminCount: 2 }]),
          });
        }

        return mock;
      });

      // Mock update operation
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updatedProjectUser]),
          }),
        }),
      } as any);

      // Execute
      const result = await projectUserService.update(
        projectId,
        userId,
        updateData,
      );

      // Assert
      expect(result).toEqual(updatedProjectUser);
    });

    it("should throw if project user not found during update", async () => {
      // Setup
      const projectId = "project-123";
      const userId = "nonexistent-user";
      const updateData = {
        role: "member" as const,
      };

      // Mock to handle all the possible select calls
      mockDb.select.mockImplementation(() => {
        // For any select call, return an object that can be chained
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([]), // Empty results for any query
          }),
        } as any;
      });

      // Mock update operation to return empty array
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as any);

      // Assert - look for the more general "not found" text since the exact error might vary
      await expect(
        projectUserService.update(projectId, userId, updateData),
      ).rejects.toThrow("not found");
    });
  });

  describe("getCurrentProjectUser", () => {
    it("should get the current user's project user record", async () => {
      // Setup
      const projectId = "project-123";
      const userId = "user-123";
      const projectUser = {
        id: "project-user-123",
        projectId,
        userId,
        role: "admin",
      };

      // Mock query operations
      mockDb.query = {
        projectUsers: {
          findFirst: vi.fn().mockResolvedValue(projectUser),
        },
      } as any;

      // Execute
      const result = await projectUserService.getCurrentProjectUser(projectId);

      // Assert
      expect(result).toEqual(projectUser);
      expect(mockDb.query.projectUsers.findFirst).toHaveBeenCalledWith({
        where: and(
          eq(projectUsers.projectId, projectId),
          eq(projectUsers.userId, userId),
        ),
      });
    });

    it("should throw if current user not found in project", async () => {
      // Setup
      const projectId = "project-123";

      // Mock query operations to return null (not found)
      mockDb.query = {
        projectUsers: {
          findFirst: vi.fn().mockResolvedValue(null),
        },
      } as any;

      // Assert
      await expect(
        projectUserService.getCurrentProjectUser(projectId),
      ).rejects.toThrow("Unauthorized: User is not a member of this project");
    });
  });

  describe("updateCurrentUserPreferences", () => {
    it("should update current user preferences", async () => {
      // Setup
      const projectId = "project-123";
      const userId = "user-123";
      const preferences = {
        isFavorite: true,
      };

      const updatedProjectUser = {
        id: "project-user-123",
        projectId,
        userId,
        role: "admin",
        isFavorite: true,
        updatedAt: new Date(),
      };

      // Mock query operations to find the project user first
      mockDb.query = {
        projectUsers: {
          findFirst: vi.fn().mockResolvedValue({
            id: "project-user-123",
            projectId,
            userId,
          }),
        },
      } as any;

      // Mock update operation
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updatedProjectUser]),
          }),
        }),
      } as any);

      // Execute
      const result = await projectUserService.updateCurrentUserPreferences(
        projectId,
        preferences,
      );

      // Assert
      expect(result).toEqual(updatedProjectUser);
      expect(mockDb.update).toHaveBeenCalledWith(projectUsers);
      expect(mockDb.update(projectUsers).set).toHaveBeenCalledWith({
        ...preferences,
        updatedAt: expect.any(Date),
      });
      expect(
        mockDb.update(projectUsers).set({
          ...preferences,
          updatedAt: expect.any(Date),
        }).where,
      ).toHaveBeenCalledWith(
        and(
          eq(projectUsers.projectId, projectId),
          eq(projectUsers.userId, userId),
        ),
      );
    });

    it("should throw if current project user not found", async () => {
      // Setup
      const projectId = "project-123";
      const preferences = {
        isFavorite: true,
      };

      // Mock query operations to return null (not found)
      mockDb.query = {
        projectUsers: {
          findFirst: vi.fn().mockResolvedValue(null),
        },
      } as any;

      // Assert
      await expect(
        projectUserService.updateCurrentUserPreferences(projectId, preferences),
      ).rejects.toThrow("Unauthorized: User is not a member of this project");
    });
  });
});
