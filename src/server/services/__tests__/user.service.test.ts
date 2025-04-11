import { currentUser } from "@clerk/nextjs/server";
import { describe, beforeEach, it, expect, vi } from "vitest";

import { mockDb, mockTx } from "../../../../test/mocks";
import { users } from "../../db/schema";
import { UserService } from "../user.service";

// Mock Clerk currentUser
vi.mock("@clerk/nextjs/server", () => ({
  currentUser: vi.fn(),
}));

describe("UserService", () => {
  let userService: UserService;

  beforeEach(() => {
    // Create a new instance of UserService before each test
    userService = new UserService(mockDb);

    // Reset all mocks
    vi.resetAllMocks();
  });

  describe("sync", () => {
    it("should successfully sync a user record", async () => {
      // Setup
      const userData = {
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
        imageUrl: "https://example.com/image.jpg",
      };

      const returnedUser = { ...userData, createdAt: new Date() };

      // Mock the insert operation
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          onConflictDoUpdate: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([returnedUser]),
          }),
        }),
      } as any);

      // Execute
      const result = await userService.sync(userData);

      // Assert
      expect(result).toEqual(returnedUser);
      expect(mockDb.insert).toHaveBeenCalledWith(users);
      expect(mockDb.insert(users).values).toHaveBeenCalledWith(userData);
    });

    it("should throw an error if sync fails", async () => {
      // Setup
      const userData = {
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
        imageUrl: "https://example.com/image.jpg",
      };

      // Mock the insert operation to return empty array
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          onConflictDoUpdate: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as any);

      // Assert
      await expect(userService.sync(userData)).rejects.toThrow(
        "Failed to sync user",
      );
    });

    it("should use transaction when provided", async () => {
      // Setup
      const userData = {
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
        imageUrl: "https://example.com/image.jpg",
      };

      const returnedUser = { ...userData, createdAt: new Date() };

      // Mock the transaction insert operation
      mockTx.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          onConflictDoUpdate: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([returnedUser]),
          }),
        }),
      } as any);

      // Execute
      const result = await userService.sync(userData, mockTx);

      // Assert
      expect(result).toEqual(returnedUser);
      expect(mockTx.insert).toHaveBeenCalledWith(users);
      expect(mockTx.insert(users).values).toHaveBeenCalledWith(userData);
      // Ensure DB wasn't used directly
      expect(mockDb.insert).not.toHaveBeenCalled();
    });
  });

  describe("syncCurrentUser", () => {
    it("should throw if no current user found", async () => {
      // Mock currentUser to return null
      vi.mocked(currentUser).mockResolvedValue(null);

      // Assert
      await expect(userService.syncCurrentUser()).rejects.toThrow(
        "No current user found",
      );
    });

    it("should throw if no primary email address found", async () => {
      // Mock currentUser to return a user without primary email
      vi.mocked(currentUser).mockResolvedValue({
        id: "user-123",
        emailAddresses: [],
        primaryEmailAddressId: "email-123",
        fullName: "Test User",
        imageUrl: "https://example.com/image.jpg",
      } as any);

      // Assert
      await expect(userService.syncCurrentUser()).rejects.toThrow(
        "No primary email address found",
      );
    });

    it("should successfully sync the current user", async () => {
      // Setup
      const userId = "user-123";
      const emailId = "email-123";
      const email = "test@example.com";
      const name = "Test User";
      const imageUrl = "https://example.com/image.jpg";

      // Mock currentUser to return valid user data
      vi.mocked(currentUser).mockResolvedValue({
        id: userId,
        emailAddresses: [{ id: emailId, emailAddress: email }],
        primaryEmailAddressId: emailId,
        fullName: name,
        imageUrl: imageUrl,
      } as any);

      // Create a spy on the sync method
      const syncSpy = vi.spyOn(userService, "sync");
      syncSpy.mockResolvedValue({ id: userId } as any);

      // Execute
      await userService.syncCurrentUser();

      // Assert
      expect(syncSpy).toHaveBeenCalledWith(
        {
          id: userId,
          email: email,
          name: name,
          imageUrl: imageUrl,
        },
        expect.anything(),
      );
    });

    it("should use transaction when provided", async () => {
      // Setup
      const userId = "user-123";
      const emailId = "email-123";

      // Mock currentUser to return valid user data
      vi.mocked(currentUser).mockResolvedValue({
        id: userId,
        emailAddresses: [{ id: emailId, emailAddress: "test@example.com" }],
        primaryEmailAddressId: emailId,
        fullName: "Test User",
        imageUrl: "https://example.com/image.jpg",
      } as any);

      // Create a spy on the sync method
      const syncSpy = vi.spyOn(userService, "sync");
      syncSpy.mockResolvedValue({ id: userId } as any);

      // Execute
      await userService.syncCurrentUser(mockTx);

      // Assert
      expect(syncSpy).toHaveBeenCalledWith(expect.any(Object), mockTx);
    });
  });
});
