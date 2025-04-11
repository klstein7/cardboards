import { auth } from "@clerk/nextjs/server";
import { describe, beforeEach, it, expect, vi } from "vitest";
import { eq } from "drizzle-orm";

import { mockDb, mockTx } from "../../../../test/mocks";
import {
  boards,
  cards,
  columns,
  projects,
  projectUsers,
} from "../../db/schema";
import { ProjectService } from "../project.service";

// Mock Clerk auth
vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

describe("ProjectService", () => {
  let projectService: ProjectService;
  let mockHistoryService: any;
  let mockNotificationService: any;
  let mockProjectUserService: any;
  let mockUserService: any;

  beforeEach(() => {
    // Create mock services
    mockHistoryService = {
      recordProjectAction: vi.fn().mockResolvedValue(undefined),
    };

    mockNotificationService = {
      createMany: vi.fn().mockResolvedValue(undefined),
    };

    mockProjectUserService = {
      create: vi.fn().mockResolvedValue({ id: "pu-1" }),
    };

    mockUserService = {
      syncCurrentUser: vi.fn().mockResolvedValue(undefined),
    };

    // Create a new instance of ProjectService before each test
    projectService = new ProjectService(
      mockDb,
      mockHistoryService,
      mockNotificationService,
      mockProjectUserService,
      mockUserService,
    );

    // Reset all mocks
    vi.resetAllMocks();

    // Default auth mock
    vi.mocked(auth).mockReturnValue({
      userId: "user-123",
    } as any);
  });

  describe("create", () => {
    it("should create a new project successfully", async () => {
      // Setup
      const projectData = {
        name: "Test Project",
        description: "Project description",
      };

      const createdProject = {
        id: "project-123",
        ...projectData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock database operations
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([createdProject]),
        }),
      } as any);

      // Execute
      const result = await projectService.create(projectData);

      // Assert
      expect(result).toEqual(createdProject);
      expect(mockUserService.syncCurrentUser).toHaveBeenCalled();
      expect(mockDb.insert).toHaveBeenCalledWith(projects);
      expect(mockProjectUserService.create).toHaveBeenCalledWith(
        {
          projectId: createdProject.id,
          userId: "user-123",
          role: "admin",
        },
        expect.anything(),
      );
      expect(mockHistoryService.recordProjectAction).toHaveBeenCalledWith(
        createdProject.id,
        "create",
        undefined,
        expect.anything(),
      );
    });

    it("should throw an error if project creation fails", async () => {
      // Setup
      const projectData = {
        name: "Test Project",
        description: "Project description",
      };

      // Mock database operations to return empty array (creation failed)
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      } as any);

      // Assert
      await expect(projectService.create(projectData)).rejects.toThrow(
        "Failed to create project",
      );
    });

    it("should use transaction when provided", async () => {
      // Setup
      const projectData = {
        name: "Test Project",
        description: "Project description",
      };

      const createdProject = {
        id: "project-123",
        ...projectData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock transaction operations
      mockTx.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([createdProject]),
        }),
      } as any);

      // Execute
      const result = await projectService.create(projectData, mockTx);

      // Assert
      expect(result).toEqual(createdProject);
      expect(mockUserService.syncCurrentUser).toHaveBeenCalledWith(mockTx);
      expect(mockTx.insert).toHaveBeenCalledWith(projects);
      expect(mockProjectUserService.create).toHaveBeenCalledWith(
        expect.any(Object),
        mockTx,
      );
      expect(mockHistoryService.recordProjectAction).toHaveBeenCalledWith(
        createdProject.id,
        "create",
        undefined,
        mockTx,
      );

      // Ensure DB wasn't used directly
      expect(mockDb.insert).not.toHaveBeenCalled();
    });
  });

  describe("update", () => {
    it("should update a project successfully", async () => {
      // Setup
      const projectId = "project-123";
      const existingProject = {
        id: projectId,
        name: "Old Name",
        description: "Old description",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updateData = {
        name: "New Name",
        description: "New description",
      };

      const updatedProject = {
        ...existingProject,
        ...updateData,
        updatedAt: expect.any(Date),
      };

      // Mock query operations
      mockDb.query = {
        projects: {
          findFirst: vi.fn().mockResolvedValue(existingProject),
        },
      } as any;

      // Mock update operation
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updatedProject]),
          }),
        }),
      } as any);

      // Mock select operation for member notifications
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ userId: "user-456" }]),
        }),
      } as any);

      // Execute
      const result = await projectService.update(projectId, updateData);

      // Assert
      expect(result).toEqual(updatedProject);
      expect(mockDb.query.projects.findFirst).toHaveBeenCalled();
      expect(mockDb.update).toHaveBeenCalledWith(projects);
      expect(mockHistoryService.recordProjectAction).toHaveBeenCalledWith(
        projectId,
        "update",
        expect.any(String),
        expect.anything(),
      );
      expect(mockNotificationService.createMany).toHaveBeenCalled();
    });

    it("should throw an error if project not found", async () => {
      // Setup
      const projectId = "non-existent-id";
      const updateData = { name: "New Name" };

      // Mock query operations to return null (not found)
      mockDb.query = {
        projects: {
          findFirst: vi.fn().mockResolvedValue(null),
        },
      } as any;

      // Assert
      await expect(
        projectService.update(projectId, updateData),
      ).rejects.toThrow("Project not found");
    });

    it("should not send notifications if name wasn't changed", async () => {
      // Setup
      const projectId = "project-123";
      const existingProject = {
        id: projectId,
        name: "Project Name",
        description: "Old description",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updateData = {
        name: "Project Name", // Keep the same name
        description: "New description", // Name unchanged
      };

      const updatedProject = {
        ...existingProject,
        ...updateData,
        updatedAt: expect.any(Date),
      };

      // Mock query operations
      mockDb.query = {
        projects: {
          findFirst: vi.fn().mockResolvedValue(existingProject),
        },
      } as any;

      // Mock update operation
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updatedProject]),
          }),
        }),
      } as any);

      // Execute
      await projectService.update(projectId, updateData);

      // Assert
      expect(mockNotificationService.createMany).not.toHaveBeenCalled();
    });
  });

  describe("list", () => {
    it("should list all projects for the current user", async () => {
      // Setup
      const userId = "user-123";
      const projects = [
        {
          id: "project-1",
          name: "Project 1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "project-2",
          name: "Project 2",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const projectUserRecords = [
        { projectId: "project-1", userId, isFavorite: true },
        { projectId: "project-2", userId, isFavorite: false },
      ];

      // Mock query operations
      mockDb.query = {
        projects: {
          findMany: vi.fn().mockResolvedValue(
            projects.map((p) => ({
              ...p,
              boards: [],
              projectUsers: [],
            })),
          ),
        },
      } as any;

      // Mock select operation
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(projectUserRecords),
        }),
      } as any);

      // Execute
      const result = await projectService.list();

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]?.isFavorite).toBe(true);
      expect(result[1]?.isFavorite).toBe(false);
      expect(mockDb.query.projects.findMany).toHaveBeenCalled();
    });

    it("should throw if user not authenticated", async () => {
      // Setup - mock auth to return no userId
      vi.mocked(auth).mockReturnValue({
        userId: null,
      } as any);

      // Assert
      await expect(projectService.list()).rejects.toThrow(
        "Unauthorized: User not authenticated",
      );
    });
  });

  describe("get", () => {
    it("should get a project by ID", async () => {
      // Setup
      const projectId = "project-123";
      const project = {
        id: projectId,
        name: "Test Project",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock query operations
      mockDb.query = {
        projects: {
          findFirst: vi.fn().mockResolvedValue(project),
        },
      } as any;

      // Execute
      const result = await projectService.get(projectId);

      // Assert
      expect(result).toEqual(project);
      expect(mockDb.query.projects.findFirst).toHaveBeenCalled();
    });

    it("should throw if project not found", async () => {
      // Setup
      const projectId = "non-existent-id";

      // Mock query operations to return null (not found)
      mockDb.query = {
        projects: {
          findFirst: vi.fn().mockResolvedValue(null),
        },
      } as any;

      // Assert
      await expect(projectService.get(projectId)).rejects.toThrow(
        "Project not found",
      );
    });
  });

  describe("del", () => {
    it("should delete a project and notify members", async () => {
      // Setup
      const projectId = "project-123";
      const project = {
        id: projectId,
        name: "Test Project",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const members = [{ userId: "user-123" }, { userId: "user-456" }];

      // Mock query operations
      mockDb.query = {
        projects: {
          findFirst: vi.fn().mockResolvedValue(project),
        },
      } as any;

      // Mock select operation for members
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(members),
        }),
      } as any);

      // Mock delete operation
      mockDb.delete.mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      } as any);

      // Execute
      await projectService.del(projectId);

      // Assert
      expect(mockDb.query.projects.findFirst).toHaveBeenCalled();
      expect(mockDb.select).toHaveBeenCalledWith({
        userId: projectUsers.userId,
      });
      expect(mockNotificationService.createMany).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            userId: "user-123",
            projectId,
            type: "project_update",
          }),
          expect.objectContaining({
            userId: "user-456",
            projectId,
            type: "project_update",
          }),
        ]),
        expect.anything(),
      );
      expect(mockDb.delete).toHaveBeenCalledWith(projects);
    });

    it("should throw if project not found", async () => {
      // Setup
      const projectId = "non-existent-id";

      // Mock query operations to return null (not found)
      mockDb.query = {
        projects: {
          findFirst: vi.fn().mockResolvedValue(null),
        },
      } as any;

      // Assert
      await expect(projectService.del(projectId)).rejects.toThrow(
        "Project not found",
      );
    });
  });

  describe("getProjectIdByCardId", () => {
    it("should get project ID by card ID", async () => {
      // Setup
      const cardId = 123;
      const projectId = "project-123";

      // Mock select operation
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([{ projectId }]),
            }),
          }),
        }),
      } as any);

      // Execute
      const result = await projectService.getProjectIdByCardId(cardId);

      // Assert
      expect(result).toEqual(projectId);
      expect(mockDb.select).toHaveBeenCalledWith({
        projectId: boards.projectId,
      });
      // Check joins structure but difficult to verify exact params in this test structure
    });

    it("should throw if project not found for card", async () => {
      // Setup
      const cardId = 123;

      // Mock select operation to return empty array (not found)
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      } as any);

      // Assert
      await expect(projectService.getProjectIdByCardId(cardId)).rejects.toThrow(
        "Project not found for card",
      );
    });
  });
});
