import React from "react";
import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { useCopyToClipboard } from "../use-copy-to-clipboard";

describe("useCopyToClipboard", () => {
  const originalNavigator = { ...global.navigator };
  const mockClipboard = {
    writeText: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    vi.resetAllMocks();

    // Mock the clipboard API
    Object.defineProperty(global.navigator, "clipboard", {
      value: mockClipboard,
      configurable: true,
    });

    // Ensure console.warn doesn't pollute the test output
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore the original navigator object
    Object.defineProperty(global, "navigator", {
      value: originalNavigator,
      configurable: true,
    });
  });

  it("should initialize with null copiedText", () => {
    // Act
    const { result } = renderHook(() => useCopyToClipboard());

    // Assert
    expect(result.current.copiedText).toBeNull();
    expect(typeof result.current.copy).toBe("function");
  });

  it("should copy text to clipboard and update copiedText state", async () => {
    // Arrange
    const textToCopy = "Test text to copy";

    // Act
    const { result } = renderHook(() => useCopyToClipboard());

    // Copy text
    await act(async () => {
      const success = await result.current.copy(textToCopy);
      expect(success).toBe(true);
    });

    // Assert
    expect(mockClipboard.writeText).toHaveBeenCalledWith(textToCopy);
    expect(result.current.copiedText).toBe(textToCopy);
  });

  it("should handle errors when copying fails", async () => {
    // Arrange
    const textToCopy = "Text that will fail to copy";
    const mockError = new Error("Clipboard write failed");

    // Mock clipboard failure
    mockClipboard.writeText.mockRejectedValueOnce(mockError);

    // Act
    const { result } = renderHook(() => useCopyToClipboard());

    // Attempt to copy text
    await act(async () => {
      const success = await result.current.copy(textToCopy);
      expect(success).toBe(false);
    });

    // Assert
    expect(mockClipboard.writeText).toHaveBeenCalledWith(textToCopy);
    expect(result.current.copiedText).toBeNull();
    expect(console.warn).toHaveBeenCalledWith("Copy failed", mockError);
  });

  it("should handle case when navigator.clipboard is not available", async () => {
    // Arrange
    const textToCopy = "Test text to copy";

    // Remove clipboard API
    Object.defineProperty(global.navigator, "clipboard", {
      value: undefined,
      configurable: true,
    });

    // Act
    const { result } = renderHook(() => useCopyToClipboard());

    // Attempt to copy text
    await act(async () => {
      const success = await result.current.copy(textToCopy);
      expect(success).toBe(false);
    });

    // Assert
    expect(result.current.copiedText).toBeNull();
    expect(console.warn).toHaveBeenCalledWith("Clipboard not supported");
  });
});
