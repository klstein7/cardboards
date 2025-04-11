import { describe, beforeEach, it, expect, vi } from "vitest";
import { eq } from "drizzle-orm";

import { mockDb, mockTx } from "../../../../test/mocks";
import { invitations } from "../../db/schema";
import { InvitationService } from "../invitation.service";

describe("InvitationService", () => {
  let invitationService: InvitationService;
  let mockProjectUserService: any;
  let mockUserService: any;

  beforeEach(() => {
    // Reset mocks before initializing them in each test
    vi.resetAllMocks();

    // Create mock services
    mockProjectUserService = {
      getCurrentProjectUser: vi.fn().mockResolvedValue({
        id: "project-user-123",
        userId: "user-123",
        projectId: "project-123",
        role: "admin",
      }),
      create: vi.fn().mockImplementation(() =>
        Promise.resolve({
          id: "project-user-new",
          userId: "user-456",
          projectId: "project-123",
          role: "member",
        }),
      ),
    };

    mockUserService = {
      syncCurrentUser: vi.fn().mockResolvedValue({
        id: "user-456",
        email: "test@example.com",
      }),
    };

    // Create a new instance of InvitationService before each test
    invitationService = new InvitationService(
      mockDb,
      mockProjectUserService,
      mockUserService,
    );
  });

  describe("create", () => {
    it("should create a new invitation", async () => {
      // Setup
      const projectId = "project-123";

      const invitation = {
        id: "invitation-123",
        projectId,
        invitedById: "project-user-123",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock the getCurrentProjectUser call specifically for this test
      mockProjectUserService.getCurrentProjectUser.mockResolvedValue({
        id: "project-user-123",
        userId: "user-123",
        projectId: "project-123",
        role: "admin",
      });

      // Mock insert operation
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([invitation]),
        }),
      } as any);

      // Execute
      const result = await invitationService.create(projectId);

      // Assert
      expect(result).toEqual(invitation);
      expect(mockProjectUserService.getCurrentProjectUser).toHaveBeenCalledWith(
        projectId,
        mockDb,
      );
      expect(mockDb.insert).toHaveBeenCalledWith(invitations);
      expect(mockDb.insert(invitations).values).toHaveBeenCalledWith({
        projectId,
        invitedById: "project-user-123",
      });
    });

    it("should throw if insert fails", async () => {
      // Setup
      const projectId = "project-123";

      // Mock the getCurrentProjectUser call
      mockProjectUserService.getCurrentProjectUser.mockResolvedValue({
        id: "project-user-123",
        userId: "user-123",
        projectId: "project-123",
        role: "admin",
      });

      // Mock insert operation to return empty array
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      } as any);

      // Assert
      await expect(invitationService.create(projectId)).rejects.toThrow(
        "Failed to create invitation",
      );
    });

    it("should use transaction when provided", async () => {
      // Setup
      const projectId = "project-123";

      const invitation = {
        id: "invitation-123",
        projectId,
        invitedById: "project-user-123",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock the getCurrentProjectUser call
      mockProjectUserService.getCurrentProjectUser.mockResolvedValue({
        id: "project-user-123",
        userId: "user-123",
        projectId: "project-123",
        role: "admin",
      });

      // Mock transaction insert operation
      mockTx.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([invitation]),
        }),
      } as any);

      // Execute
      const result = await invitationService.create(projectId, mockTx);

      // Assert
      expect(result).toEqual(invitation);
      expect(mockProjectUserService.getCurrentProjectUser).toHaveBeenCalledWith(
        projectId,
        mockTx,
      );
      expect(mockTx.insert).toHaveBeenCalledWith(invitations);
      // Ensure DB wasn't used directly
      expect(mockDb.insert).not.toHaveBeenCalled();
    });
  });

  describe("get", () => {
    it("should get an invitation by ID", async () => {
      // Setup
      const invitationId = "invitation-123";
      const invitation = {
        id: invitationId,
        projectId: "project-123",
        invitedById: "project-user-123",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock query operations
      mockDb.query = {
        invitations: {
          findFirst: vi.fn().mockResolvedValue(invitation),
        },
      } as any;

      // Execute
      const result = await invitationService.get(invitationId);

      // Assert
      expect(result).toEqual(invitation);
      expect(mockDb.query.invitations.findFirst).toHaveBeenCalledWith({
        where: eq(invitations.id, invitationId),
      });
    });

    it("should throw if invitation not found", async () => {
      // Setup
      const invitationId = "nonexistent-invitation";

      // Mock query operations to return null (not found)
      mockDb.query = {
        invitations: {
          findFirst: vi.fn().mockResolvedValue(null),
        },
      } as any;

      // Assert
      await expect(invitationService.get(invitationId)).rejects.toThrow(
        "Invitation not found",
      );
    });
  });

  describe("accept", () => {
    it("should accept an invitation", async () => {
      // Setup
      const invitationId = "invitation-123";
      const userId = "user-456";

      const invitation = {
        id: invitationId,
        projectId: "project-123",
        invitedById: "project-user-123",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Valid expiration date
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const projectUser = {
        id: "project-user-new",
        userId,
        projectId: "project-123",
        role: "member",
      };

      // Mock the create method to return projectUser
      mockProjectUserService.create.mockResolvedValue(projectUser);

      // Create a spy on the get method
      const getSpy = vi.spyOn(invitationService, "get");
      getSpy.mockResolvedValue(invitation);

      // Execute
      const result = await invitationService.accept(invitationId, userId);

      // Assert
      expect(result).toEqual(projectUser);
      expect(getSpy).toHaveBeenCalledWith(invitationId, mockDb);
      expect(mockUserService.syncCurrentUser).toHaveBeenCalledWith(mockDb);
      expect(mockProjectUserService.create).toHaveBeenCalledWith(
        {
          projectId: invitation.projectId,
          userId,
          role: "member",
        },
        mockDb,
      );
    });

    it("should throw if invitation is expired", async () => {
      // Setup
      const invitationId = "invitation-123";
      const userId = "user-456";

      const expiredInvitation = {
        id: invitationId,
        projectId: "project-123",
        invitedById: "project-user-123",
        expiresAt: new Date(Date.now() - 1000), // Already expired
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Create a spy on the get method
      const getSpy = vi.spyOn(invitationService, "get");
      getSpy.mockResolvedValue(expiredInvitation);

      // Assert
      await expect(
        invitationService.accept(invitationId, userId),
      ).rejects.toThrow("Invitation expired");
      // The sync and create methods should not be called for expired invitations
      expect(mockUserService.syncCurrentUser).not.toHaveBeenCalled();
      expect(mockProjectUserService.create).not.toHaveBeenCalled();
    });

    it("should use transaction when provided", async () => {
      // Setup
      const invitationId = "invitation-123";
      const userId = "user-456";

      const invitation = {
        id: invitationId,
        projectId: "project-123",
        invitedById: "project-user-123",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const projectUser = {
        id: "project-user-new",
        userId,
        projectId: "project-123",
        role: "member",
      };

      // Mock the create method to return projectUser
      mockProjectUserService.create.mockResolvedValue(projectUser);

      // Create a spy on the get method
      const getSpy = vi.spyOn(invitationService, "get");
      getSpy.mockResolvedValue(invitation);

      // Execute
      const result = await invitationService.accept(
        invitationId,
        userId,
        mockTx,
      );

      // Assert
      expect(result).toEqual(projectUser);
      expect(getSpy).toHaveBeenCalledWith(invitationId, mockTx);
      expect(mockUserService.syncCurrentUser).toHaveBeenCalledWith(mockTx);
      expect(mockProjectUserService.create).toHaveBeenCalledWith(
        {
          projectId: invitation.projectId,
          userId,
          role: "member",
        },
        mockTx,
      );
    });
  });
});
