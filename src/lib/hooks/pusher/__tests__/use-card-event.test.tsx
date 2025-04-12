import React from "react";
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { useCardEvent } from "../use-card-event";
import { pusherChannels } from "~/pusher/channels";

// Mock the useEvent hook
vi.mock("../use-event", () => ({
  useEvent: vi.fn(),
}));

// Import after mocking
import { useEvent } from "../use-event";

describe("useCardEvent", () => {
  const mockCallback = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it.each([
    ["created", pusherChannels.card.events.created.name],
    ["updated", pusherChannels.card.events.updated.name],
    ["deleted", pusherChannels.card.events.deleted.name],
    ["moved", pusherChannels.card.events.moved.name],
    [
      "assignedToCurrentUser",
      pusherChannels.card.events.assignedToCurrentUser.name,
    ],
  ])(
    "should subscribe to %s card event with correct channel and event name",
    (eventType, eventName) => {
      // Act
      renderHook(() =>
        useCardEvent(
          eventType as
            | "created"
            | "updated"
            | "deleted"
            | "moved"
            | "assignedToCurrentUser",
          mockCallback,
        ),
      );

      // Assert
      expect(useEvent).toHaveBeenCalledWith(
        pusherChannels.card.name,
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
    renderHook(() => useCardEvent(eventType, callback));

    // Assert
    expect(useEvent).toHaveBeenCalledWith(
      pusherChannels.card.name,
      pusherChannels.card.events[eventType].name,
      callback,
    );
  });

  it("should use correct generic type parameter", () => {
    // Arrange
    interface TestPayload {
      id: string;
      title: string;
    }
    const eventType = "updated";
    const callback = (data: TestPayload) => {
      /* mock implementation */
    };

    // Act
    renderHook(() => useCardEvent<TestPayload>(eventType, callback));

    // Assert
    expect(useEvent).toHaveBeenCalledWith(
      pusherChannels.card.name,
      pusherChannels.card.events[eventType].name,
      callback,
    );
  });
});
