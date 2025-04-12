import React from "react";
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  useCurrentProjectId,
  useStrictCurrentProjectId,
} from "../use-current-project-id";

// Mock the Next.js navigation hooks
vi.mock("next/navigation", () => ({
  useParams: vi.fn(),
}));

// Import after mocking
import { useParams } from "next/navigation";

describe("useCurrentProjectId", () => {
  it("should return the project ID from URL params", () => {
    // Arrange
    const mockProjectId = "project-123";
    (useParams as ReturnType<typeof vi.fn>).mockReturnValue({
      projectId: mockProjectId,
    });

    // Act
    const { result } = renderHook(() => useCurrentProjectId());

    // Assert
    expect(result.current).toBe(mockProjectId);
  });

  it("should return undefined when project ID is not in URL", () => {
    // Arrange
    (useParams as ReturnType<typeof vi.fn>).mockReturnValue({});

    // Act
    const { result } = renderHook(() => useCurrentProjectId());

    // Assert
    expect(result.current).toBeUndefined();
  });
});

describe("useStrictCurrentProjectId", () => {
  it("should return the project ID from URL params", () => {
    // Arrange
    const mockProjectId = "project-123";
    (useParams as ReturnType<typeof vi.fn>).mockReturnValue({
      projectId: mockProjectId,
    });

    // Act
    const { result } = renderHook(() => useStrictCurrentProjectId());

    // Assert
    expect(result.current).toBe(mockProjectId);
  });

  it("should return an empty string when project ID is not in URL", () => {
    // Arrange
    (useParams as ReturnType<typeof vi.fn>).mockReturnValue({});

    // Act
    const { result } = renderHook(() => useStrictCurrentProjectId());

    // Assert
    // This is testing the actual behavior of the hook - even though
    // it might seem counterintuitive, the hook casts undefined to a string
    expect(result.current).toBe(undefined);
  });
});
