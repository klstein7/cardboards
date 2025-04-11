import "server-only";
import { beforeEach, vi } from "vitest";

// Mock the clerk/nextjs auth module
vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn().mockReturnValue({
    userId: "mock-user-id",
  }),
}));

// Mock out server-only
vi.mock("server-only", () => ({}));

// Global beforeEach for all tests
beforeEach(() => {
  vi.clearAllMocks();
});
