import { describe, it, expect, vi, beforeEach } from "vitest";
import { auth } from "@clerk/nextjs/server";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

// Mock react's cache function for the test environment
vi.mock("react", async (importOriginal) => {
  const actualReact = await importOriginal<typeof import("react")>();
  return {
    ...actualReact,
    cache: vi.fn((fn) => fn),
  };
});

import { type AppRouter, appRouter } from "~/server/api/routers";
import { createCallerFactory } from "~/trpc/init";
import { services } from "~/server/services/container";

// Mock Clerk auth
vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

// Mock the specific service used by the project router
vi.mock("~/server/services/container", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("~/server/services/container")>();
  return {
    ...original,
    services: {
      ...original.services,
      projectService: {
        create: vi.fn(),
        list: vi.fn(),
        get: vi.fn(),
        update: vi.fn(),
        del: vi.fn(),
      },
      authService: {
        canAccessProject: vi.fn().mockResolvedValue({} as any),
        requireProjectAdmin: vi.fn().mockResolvedValue({} as any),
      },
    },
  };
});

// Mock pusher
vi.mock("~/pusher/server", () => ({
  pusher: {
    trigger: vi.fn().mockResolvedValue(undefined),
  },
}));

describe("Project Router", () => {
  const mockUserId = "user-test-123";
  let caller: ReturnType<typeof appRouter.createCaller>;

  type RouterInput = inferRouterInputs<AppRouter>;
  type RouterOutput = inferRouterOutputs<AppRouter>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockReturnValue({ userId: mockUserId } as any);
    const ctx = { userId: mockUserId };
    caller = appRouter.createCaller(ctx);
  });

  describe("project.list", () => {
    it("should call projectService.list and return the result", async () => {
      // Arrange
      const mockProjects: RouterOutput["project"]["list"] = [
        {
          id: "proj-1",
          name: "Project 1",
          createdAt: new Date(),
          updatedAt: new Date(),
          isFavorite: false,
          boards: [],
          projectUsers: [],
        },
        {
          id: "proj-2",
          name: "Project 2",
          createdAt: new Date(),
          updatedAt: new Date(),
          isFavorite: true,
          boards: [],
          projectUsers: [],
        },
      ];
      vi.mocked(services.projectService.list).mockResolvedValue(mockProjects);

      // Act
      const result = await caller.project.list();

      // Assert
      expect(result).toEqual(mockProjects);
      expect(services.projectService.list).toHaveBeenCalledTimes(1);
      expect(services.projectService.list).toHaveBeenCalledWith();
    });

    it("should handle errors from projectService.list", async () => {
      // Arrange
      const errorMessage = "Database error";
      vi.mocked(services.projectService.list).mockRejectedValue(
        new Error(errorMessage),
      );

      // Act & Assert
      await expect(caller.project.list()).rejects.toThrow(errorMessage);
      expect(services.projectService.list).toHaveBeenCalledTimes(1);
    });
  });

  describe("project.create", () => {
    it("should call projectService.create, trigger pusher, and return the new project", async () => {
      // Arrange
      const inputData: RouterInput["project"]["create"] = {
        name: "New Test Project",
      };
      const mockCreatedProject: RouterOutput["project"]["create"] = {
        id: "proj-new-123",
        name: inputData.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(services.projectService.create).mockResolvedValue(
        mockCreatedProject,
      );
      const { pusher } = await import("~/pusher/server");
      const pusherMock = vi.mocked(pusher);

      // Act
      const result = await caller.project.create(inputData);

      // Assert
      expect(result).toEqual(mockCreatedProject);
      expect(services.projectService.create).toHaveBeenCalledTimes(1);
      expect(services.projectService.create).toHaveBeenCalledWith(inputData);

      expect(pusherMock.trigger).toHaveBeenCalledTimes(1);
      expect(pusherMock.trigger).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({
          input: mockCreatedProject,
          returning: mockCreatedProject,
          userId: mockUserId,
        }),
      );
    });

    it("should handle errors from projectService.create", async () => {
      // Arrange
      const inputData: RouterInput["project"]["create"] = {
        name: "Error Project",
      };
      const errorMessage = "Failed to create project in service";
      vi.mocked(services.projectService.create).mockRejectedValue(
        new Error(errorMessage),
      );
      const { pusher } = await import("~/pusher/server");
      const pusherMock = vi.mocked(pusher);

      // Act & Assert
      await expect(caller.project.create(inputData)).rejects.toThrow(
        errorMessage,
      );
      expect(services.projectService.create).toHaveBeenCalledTimes(1);
      expect(services.projectService.create).toHaveBeenCalledWith(inputData);
      expect(pusherMock.trigger).not.toHaveBeenCalled();
    });
  });

  describe("project.get", () => {
    it("should check access, call projectService.get, and return the project", async () => {
      // Arrange
      const projectId = "proj-get-123";
      const mockProject: RouterOutput["project"]["get"] = {
        id: projectId,
        name: "Get Test Project",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(services.projectService.get).mockResolvedValue(mockProject);

      // Act
      const result = await caller.project.get(projectId);

      // Assert
      expect(result).toEqual(mockProject);
      expect(services.authService.canAccessProject).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessProject).toHaveBeenCalledWith(
        projectId,
      );
      expect(services.projectService.get).toHaveBeenCalledTimes(1);
      expect(services.projectService.get).toHaveBeenCalledWith(projectId);
    });

    it("should throw if authService.canAccessProject fails", async () => {
      // Arrange
      const projectId = "proj-get-unauth";
      const authErrorMessage = "Access Denied";
      vi.mocked(services.authService.canAccessProject).mockRejectedValue(
        new Error(authErrorMessage),
      );

      // Act & Assert
      await expect(caller.project.get(projectId)).rejects.toThrow(
        expect.objectContaining({ message: authErrorMessage }),
      );
      expect(services.authService.canAccessProject).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessProject).toHaveBeenCalledWith(
        projectId,
      );
      expect(services.projectService.get).not.toHaveBeenCalled();
    });

    it("should handle errors from projectService.get", async () => {
      // Arrange
      const projectId = "proj-get-error";
      const serviceErrorMessage = "Project not found in service";
      vi.mocked(services.projectService.get).mockRejectedValue(
        new Error(serviceErrorMessage),
      );
      vi.mocked(services.authService.canAccessProject).mockResolvedValue({
        id: "pu-mock-1",
        projectId,
        userId: mockUserId,
        role: "member",
        isFavorite: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      // Act & Assert
      await expect(caller.project.get(projectId)).rejects.toThrow(
        expect.objectContaining({ message: serviceErrorMessage }),
      );
      expect(services.authService.canAccessProject).toHaveBeenCalledTimes(1);
      expect(services.authService.canAccessProject).toHaveBeenCalledWith(
        projectId,
      );
      expect(services.projectService.get).toHaveBeenCalledTimes(1);
      expect(services.projectService.get).toHaveBeenCalledWith(projectId);
    });
  });

  describe("project.update", () => {
    it("should require admin, call projectService.update, trigger pusher, and return the updated project", async () => {
      // Arrange
      const projectId = "proj-update-123";
      const inputData: RouterInput["project"]["update"] = {
        projectId,
        data: {
          name: "Updated Project Name",
        },
      };
      const mockUpdatedProject: RouterOutput["project"]["update"] = {
        id: projectId,
        name: inputData.data.name ?? "Default Name",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(services.projectService.update).mockResolvedValue(
        mockUpdatedProject,
      );
      const { pusher } = await import("~/pusher/server");
      const pusherMock = vi.mocked(pusher);

      // Act
      const result = await caller.project.update(inputData);

      // Assert
      expect(result).toEqual(mockUpdatedProject);
      expect(services.authService.requireProjectAdmin).toHaveBeenCalledTimes(1);
      expect(services.authService.requireProjectAdmin).toHaveBeenCalledWith(
        projectId,
      );
      expect(services.projectService.update).toHaveBeenCalledTimes(1);
      expect(services.projectService.update).toHaveBeenCalledWith(
        projectId,
        inputData.data,
      );

      expect(pusherMock.trigger).toHaveBeenCalledTimes(1);
      expect(pusherMock.trigger).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({
          input: {
            projectId: inputData.projectId,
            data: inputData.data,
          },
          returning: mockUpdatedProject,
          userId: mockUserId,
        }),
      );
    });

    it("should throw if authService.requireProjectAdmin fails", async () => {
      // Arrange
      const projectId = "proj-update-unauth";
      const inputData: RouterInput["project"]["update"] = {
        projectId,
        data: { name: "Update Attempt" },
      };
      const authErrorMessage = "Admin Required";
      vi.mocked(services.authService.requireProjectAdmin).mockRejectedValue(
        new Error(authErrorMessage),
      );
      const { pusher } = await import("~/pusher/server");
      const pusherMock = vi.mocked(pusher);

      // Act & Assert
      await expect(caller.project.update(inputData)).rejects.toThrow(
        expect.objectContaining({ message: authErrorMessage }),
      );
      expect(services.authService.requireProjectAdmin).toHaveBeenCalledTimes(1);
      expect(services.authService.requireProjectAdmin).toHaveBeenCalledWith(
        projectId,
      );
      expect(services.projectService.update).not.toHaveBeenCalled();
      expect(pusherMock.trigger).not.toHaveBeenCalled();
    });

    it("should handle errors from projectService.update", async () => {
      // Arrange
      const projectId = "proj-update-error";
      const inputData: RouterInput["project"]["update"] = {
        projectId,
        data: { name: "Error Update" },
      };
      const serviceErrorMessage = "Failed to update project in service";
      vi.mocked(services.projectService.update).mockRejectedValue(
        new Error(serviceErrorMessage),
      );
      vi.mocked(services.authService.requireProjectAdmin).mockResolvedValue({
        id: "pu-mock-2",
        projectId,
        userId: mockUserId,
        role: "admin",
        isFavorite: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
      const { pusher } = await import("~/pusher/server");
      const pusherMock = vi.mocked(pusher);

      // Act & Assert
      await expect(caller.project.update(inputData)).rejects.toThrow(
        expect.objectContaining({ message: serviceErrorMessage }),
      );
      expect(services.authService.requireProjectAdmin).toHaveBeenCalledTimes(1);
      expect(services.projectService.update).toHaveBeenCalledTimes(1);
      expect(services.projectService.update).toHaveBeenCalledWith(
        projectId,
        inputData.data,
      );
      expect(pusherMock.trigger).not.toHaveBeenCalled();
    });
  });

  describe("project.delete", () => {
    it("should require admin, call projectService.del, trigger pusher, and return the result", async () => {
      // Arrange
      const projectId = "proj-delete-123";
      const mockDeletedProjectPlaceholder = { id: projectId };
      vi.mocked(services.authService.requireProjectAdmin).mockResolvedValue({
        id: "pu-mock-3",
        projectId,
        userId: mockUserId,
        role: "admin",
        isFavorite: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
      vi.mocked(services.projectService.del).mockResolvedValue(
        mockDeletedProjectPlaceholder as any,
      );

      const { pusher } = await import("~/pusher/server");
      const pusherMock = vi.mocked(pusher);

      // Act
      const result = await caller.project.delete(projectId);

      // Assert
      expect(result).toEqual(mockDeletedProjectPlaceholder);
      expect(services.authService.requireProjectAdmin).toHaveBeenCalledTimes(1);
      expect(services.authService.requireProjectAdmin).toHaveBeenCalledWith(
        projectId,
      );
      expect(services.projectService.del).toHaveBeenCalledTimes(1);
      expect(services.projectService.del).toHaveBeenCalledWith(projectId);
      expect(pusherMock.trigger).toHaveBeenCalledTimes(1);
      expect(pusherMock.trigger).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({
          input: projectId,
          returning: mockDeletedProjectPlaceholder,
          userId: mockUserId,
        }),
      );
    });

    it("should throw if authService.requireProjectAdmin fails", async () => {
      // Arrange
      const projectId = "proj-delete-unauth";
      const authErrorMessage = "Admin Required";
      vi.mocked(services.authService.requireProjectAdmin).mockRejectedValue(
        new Error(authErrorMessage),
      );
      const { pusher } = await import("~/pusher/server");
      const pusherMock = vi.mocked(pusher);

      // Act & Assert
      await expect(caller.project.delete(projectId)).rejects.toThrow(
        expect.objectContaining({ message: authErrorMessage }),
      );
      expect(services.authService.requireProjectAdmin).toHaveBeenCalledTimes(1);
      expect(services.authService.requireProjectAdmin).toHaveBeenCalledWith(
        projectId,
      );
      expect(services.projectService.del).not.toHaveBeenCalled();
      expect(pusherMock.trigger).not.toHaveBeenCalled();
    });

    it("should handle errors from projectService.del", async () => {
      // Arrange
      const projectId = "proj-delete-error";
      const serviceErrorMessage = "Failed to delete project in service";
      vi.mocked(services.projectService.del).mockRejectedValue(
        new Error(serviceErrorMessage),
      );
      vi.mocked(services.authService.requireProjectAdmin).mockResolvedValue({
        id: "pu-mock-4",
        projectId,
        userId: mockUserId,
        role: "admin",
        isFavorite: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
      const { pusher } = await import("~/pusher/server");
      const pusherMock = vi.mocked(pusher);

      // Act & Assert
      await expect(caller.project.delete(projectId)).rejects.toThrow(
        expect.objectContaining({ message: serviceErrorMessage }),
      );
      expect(services.authService.requireProjectAdmin).toHaveBeenCalledTimes(1);
      expect(services.projectService.del).toHaveBeenCalledTimes(1);
      expect(services.projectService.del).toHaveBeenCalledWith(projectId);
      expect(pusherMock.trigger).not.toHaveBeenCalled();
    });
  });
});
