import React from "react";
import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { useDebounce } from "../use-debounce";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("should return the initial value immediately", () => {
    // Arrange
    const initialValue = "test value";

    // Act
    const { result } = renderHook(() => useDebounce(initialValue));

    // Assert
    expect(result.current).toBe(initialValue);
  });

  it("should not update the debounced value before the delay has passed", () => {
    // Arrange
    const initialValue = "test value";
    const newValue = "updated value";

    // Act
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
      initialProps: { value: initialValue },
    });

    // Change the value
    rerender({ value: newValue });

    // Advance time, but not enough to trigger the update
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Assert - should still be the initial value
    expect(result.current).toBe(initialValue);
  });

  it("should update the debounced value after the delay has passed", () => {
    // Arrange
    const initialValue = "test value";
    const newValue = "updated value";
    const delay = 300; // Default delay

    // Act
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
      initialProps: { value: initialValue },
    });

    // Change the value
    rerender({ value: newValue });

    // Advance time past the delay
    act(() => {
      vi.advanceTimersByTime(delay + 50);
    });

    // Assert - should be updated to the new value
    expect(result.current).toBe(newValue);
  });

  it("should respect the custom delay parameter", () => {
    // Arrange
    const initialValue = "test value";
    const newValue = "updated value";
    const customDelay = 500;

    // Act
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: initialValue, delay: customDelay },
      },
    );

    // Change the value
    rerender({ value: newValue, delay: customDelay });

    // Advance time, but not enough to trigger update
    act(() => {
      vi.advanceTimersByTime(customDelay - 50);
    });

    // Assert - should still be the initial value
    expect(result.current).toBe(initialValue);

    // Advance time past the custom delay
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Assert - should be updated to the new value
    expect(result.current).toBe(newValue);
  });

  it("should cancel previous timeout when value changes rapidly", () => {
    // Arrange
    const initialValue = "initial";
    const intermediateValue = "intermediate";
    const finalValue = "final";
    const delay = 300;

    // Act
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, delay),
      {
        initialProps: { value: initialValue },
      },
    );

    // Change to intermediate value
    rerender({ value: intermediateValue });

    // Advance time a bit
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Change to final value before timeout for intermediate value completes
    rerender({ value: finalValue });

    // Complete the delay for the final value
    act(() => {
      vi.advanceTimersByTime(delay);
    });

    // Assert - should show the final value
    expect(result.current).toBe(finalValue);
    // Should skip the intermediate value entirely
    expect(result.current).not.toBe(intermediateValue);
  });
});
