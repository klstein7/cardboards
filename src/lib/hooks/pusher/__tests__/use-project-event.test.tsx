import React from "react";
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { useProjectEvent } from "../use-project-event";
import { pusherChannels } from "~/pusher/channels";

// Mock the useEvent hook
vi.mock("../use-event", () => ({
  useEvent: vi.fn(),
}));

// Import after mocking
import { useEvent } from "../use-event";

describe("useProjectEvent", () => {
  const mockCallback = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it.each([
    ["created", pusherChannels.project.events.created.name],
    ["updated", pusherChannels.project.events.updated.name],
    ["deleted", pusherChannels.project.events.deleted.name],
  ])(
    "should subscribe to %s project event with correct channel and event name",
    (eventType, eventName) => {
      // Act
      renderHook(() =>
        useProjectEvent(
          eventType as "created" | "updated" | "deleted",
          mockCallback,
        ),
      );

      // Assert
      expect(useEvent).toHaveBeenCalledWith(
        pusherChannels.project.name,
        eventName,
        mockCallback,
      );
    },
  );

  it("should pass the callback to useEvent", () => {
    // Arrange
    const eventType = "created";
    const callback = vi.fn();

    // Act
    renderHook(() => useProjectEvent(eventType, callback));

    // Assert
    expect(useEvent).toHaveBeenCalledWith(
      pusherChannels.project.name,
      pusherChannels.project.events[eventType].name,
      callback,
    );
  });

  it("should use correct generic type parameter", () => {
    // Arrange
    interface TestPayload {
      id: string;
      name: string;
    }
    const eventType = "updated";
    const callback = (data: TestPayload) => {
      /* mock implementation */
    };

    // Act
    renderHook(() => useProjectEvent<TestPayload>(eventType, callback));

    // Assert
    expect(useEvent).toHaveBeenCalledWith(
      pusherChannels.project.name,
      pusherChannels.project.events[eventType].name,
      callback,
    );
  });
});
