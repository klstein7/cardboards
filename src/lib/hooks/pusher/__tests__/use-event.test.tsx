import React from "react";
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { useEvent } from "../use-event";

// Mock the pusherClient
vi.mock("~/pusher/client", () => ({
  pusherClient: {
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
  },
}));

// Mock channel object returned by pusherClient.subscribe
const mockChannel = {
  bind: vi.fn(),
  unbind: vi.fn(),
};

// Import after mocking
import { pusherClient } from "~/pusher/client";

describe("useEvent", () => {
  const mockCallback = vi.fn();
  const testChannel = "test-channel";
  const testEvent = "test-event";

  beforeEach(() => {
    vi.resetAllMocks();
    (pusherClient.subscribe as ReturnType<typeof vi.fn>).mockReturnValue(
      mockChannel,
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should subscribe to the channel and bind to the event on mount", () => {
    // Act
    renderHook(() => useEvent(testChannel, testEvent, mockCallback));

    // Assert
    expect(pusherClient.subscribe).toHaveBeenCalledWith(testChannel);
    expect(mockChannel.bind).toHaveBeenCalledWith(testEvent, mockCallback);
  });

  it("should unsubscribe and unbind on unmount", () => {
    // Act
    const { unmount } = renderHook(() =>
      useEvent(testChannel, testEvent, mockCallback),
    );

    // Unmount to trigger cleanup
    unmount();

    // Assert
    expect(mockChannel.unbind).toHaveBeenCalledWith(testEvent, mockCallback);
    expect(pusherClient.unsubscribe).toHaveBeenCalledWith(testChannel);
  });

  it("should not re-subscribe if the channel and event remain the same", () => {
    // Act
    const { rerender } = renderHook(
      ({ channel, event, callback }) => useEvent(channel, event, callback),
      {
        initialProps: {
          channel: testChannel,
          event: testEvent,
          callback: mockCallback,
        },
      },
    );

    // Initial subscription
    expect(pusherClient.subscribe).toHaveBeenCalledTimes(1);

    // Rerender with same props
    rerender({
      channel: testChannel,
      event: testEvent,
      callback: mockCallback,
    });

    // Assert - should still only be called once
    expect(pusherClient.subscribe).toHaveBeenCalledTimes(1);
  });

  it("should re-subscribe if the channel changes", () => {
    // Act
    const { rerender } = renderHook(
      ({ channel, event, callback }) => useEvent(channel, event, callback),
      {
        initialProps: {
          channel: testChannel,
          event: testEvent,
          callback: mockCallback,
        },
      },
    );

    // Initial subscription
    expect(pusherClient.subscribe).toHaveBeenCalledTimes(1);
    expect(pusherClient.subscribe).toHaveBeenCalledWith(testChannel);

    // Rerender with different channel
    rerender({
      channel: "new-channel",
      event: testEvent,
      callback: mockCallback,
    });

    // Assert - should be called again with new channel
    expect(pusherClient.subscribe).toHaveBeenCalledTimes(2);
    expect(pusherClient.subscribe).toHaveBeenCalledWith("new-channel");
    expect(pusherClient.unsubscribe).toHaveBeenCalledWith(testChannel);
  });

  it("should re-bind if the event changes", () => {
    // Act
    const { rerender } = renderHook(
      ({ channel, event, callback }) => useEvent(channel, event, callback),
      {
        initialProps: {
          channel: testChannel,
          event: testEvent,
          callback: mockCallback,
        },
      },
    );

    // Initial binding
    expect(mockChannel.bind).toHaveBeenCalledTimes(1);
    expect(mockChannel.bind).toHaveBeenCalledWith(testEvent, mockCallback);

    // Rerender with different event
    const newEvent = "new-event";
    rerender({
      channel: testChannel,
      event: newEvent,
      callback: mockCallback,
    });

    // Assert - should unbind old event and bind new event
    expect(mockChannel.unbind).toHaveBeenCalledWith(testEvent, mockCallback);
    expect(mockChannel.bind).toHaveBeenCalledWith(newEvent, mockCallback);
  });
});
