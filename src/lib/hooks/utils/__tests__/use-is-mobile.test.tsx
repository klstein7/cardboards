import React from "react";
import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { useIsMobile } from "../use-is-mobile";

describe("useIsMobile", () => {
  // Save original window properties
  const originalInnerWidth = window.innerWidth;
  const originalAddEventListener = window.addEventListener;
  const originalRemoveEventListener = window.removeEventListener;

  // Mock resize event
  const resizeEvent = new Event("resize");

  beforeEach(() => {
    // Mock window.innerWidth
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024, // Desktop width by default
    });

    // Mock addEventListener and removeEventListener
    window.addEventListener = vi.fn();
    window.removeEventListener = vi.fn();
  });

  afterEach(() => {
    // Restore original window properties
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: originalInnerWidth,
    });
    window.addEventListener = originalAddEventListener;
    window.removeEventListener = originalRemoveEventListener;
  });

  it("should return false for desktop width by default", () => {
    // Arrange - window.innerWidth is 1024 (desktop)

    // Act
    const { result } = renderHook(() => useIsMobile());

    // Assert
    expect(result.current).toBe(false);
  });

  it("should return true for mobile width", () => {
    // Arrange - set window.innerWidth to mobile size
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 500, // Mobile width
    });

    // Act
    const { result } = renderHook(() => useIsMobile());

    // Assert
    expect(result.current).toBe(true);
  });

  it("should respect custom breakpoint", () => {
    // Arrange - set window.innerWidth to a size between mobile and desktop
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 800, // Between typical mobile and desktop
    });

    // Act
    const { result: resultDefault } = renderHook(() => useIsMobile()); // Default 768
    const { result: resultCustom } = renderHook(() => useIsMobile(1000)); // Custom 1000

    // Assert
    expect(resultDefault.current).toBe(false); // 800 > 768, so not mobile
    expect(resultCustom.current).toBe(true); // 800 < 1000, so mobile
  });

  it("should add and remove resize event listener", () => {
    // Act
    const { unmount } = renderHook(() => useIsMobile());

    // Assert - should add event listener
    expect(window.addEventListener).toHaveBeenCalledWith(
      "resize",
      expect.any(Function),
    );

    // Act - unmount to test cleanup
    unmount();

    // Assert - should remove event listener
    expect(window.removeEventListener).toHaveBeenCalledWith(
      "resize",
      expect.any(Function),
    );
  });

  it("should update isMobile state when window is resized", () => {
    // Mock the addEventListener to capture the resize handler
    let resizeHandler: Function;
    window.addEventListener = vi.fn((event, handler) => {
      if (event === "resize") {
        resizeHandler = handler as Function;
      }
    });

    // Act - render the hook with desktop width
    const { result } = renderHook(() => useIsMobile());

    // Initially desktop
    expect(result.current).toBe(false);

    // Change to mobile size
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 500, // Mobile width
    });

    // Trigger resize event
    act(() => {
      resizeHandler();
    });

    // Assert - should be mobile now
    expect(result.current).toBe(true);

    // Change back to desktop size
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 1024, // Desktop width
    });

    // Trigger resize event
    act(() => {
      resizeHandler();
    });

    // Assert - should be desktop again
    expect(result.current).toBe(false);
  });
});
