import React from "react";
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock the dependency directly
const mockUseCurrentProjectUser = vi.fn();
vi.mock("../use-current-project-user", () => ({
  useCurrentProjectUser: () => mockUseCurrentProjectUser(),
}));

// Import the hook after mocking
import { useIsAdmin } from "../use-is-admin";

describe("useIsAdmin", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should return true when user is an admin", () => {
    // Arrange
    mockUseCurrentProjectUser.mockReturnValue({
      data: {
        role: "admin",
      },
    });

    // Act
    const { result } = renderHook(() => useIsAdmin());

    // Assert
    expect(result.current).toBe(true);
  });

  it("should return false when user is not an admin", () => {
    // Arrange
    mockUseCurrentProjectUser.mockReturnValue({
      data: {
        role: "member",
      },
    });

    // Act
    const { result } = renderHook(() => useIsAdmin());

    // Assert
    expect(result.current).toBe(false);
  });

  it("should return false when data is null or undefined", () => {
    // Arrange
    mockUseCurrentProjectUser.mockReturnValue({
      data: null,
    });

    // Act
    const { result } = renderHook(() => useIsAdmin());

    // Assert
    expect(result.current).toBe(false);
  });
});
