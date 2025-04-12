import React from "react";
import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { useRealtimeData } from "../use-realtime-data";

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

describe("useRealtimeData", () => {
  const initialData = { count: 0 };
  const testChannel = "test-channel";
  const testEvent = "test-event";

  beforeEach(() => {
    vi.resetAllMocks();
    (pusherClient.subscribe as ReturnType<typeof vi.fn>).mockReturnValue(
      mockChannel,
    );
  });

  it("should initialize with the initial data", () => {
    // Act
    const { result } = renderHook(() =>
      useRealtimeData(initialData, testChannel, testEvent),
    );

    // Assert
    expect(result.current).toEqual(initialData);
  });

  it("should subscribe to the channel and bind to the event on mount", () => {
    // Act
    renderHook(() => useRealtimeData(initialData, testChannel, testEvent));

    // Assert
    expect(pusherClient.subscribe).toHaveBeenCalledWith(testChannel);
    expect(mockChannel.bind).toHaveBeenCalledWith(
      testEvent,
      expect.any(Function),
    );
  });

  it("should update data when event is triggered", () => {
    // Arrange
    let bindCallback: (data: typeof initialData) => void = () => {};
    (mockChannel.bind as ReturnType<typeof vi.fn>).mockImplementation(
      (event, callback) => {
        bindCallback = callback;
      },
    );

    // Act
    const { result } = renderHook(() =>
      useRealtimeData(initialData, testChannel, testEvent),
    );

    // Initial state check
    expect(result.current).toEqual(initialData);

    // Simulate Pusher event
    const newData = { count: 5 };
    act(() => {
      bindCallback(newData);
    });

    // Assert
    expect(result.current).toEqual(newData);
  });

  it("should unsubscribe and unbind on unmount", () => {
    // Act
    const { unmount } = renderHook(() =>
      useRealtimeData(initialData, testChannel, testEvent),
    );

    // Unmount to trigger cleanup
    unmount();

    // Assert
    expect(mockChannel.unbind).toHaveBeenCalledWith(testEvent);
    expect(pusherClient.unsubscribe).toHaveBeenCalledWith(testChannel);
  });

  it("should re-subscribe if the channel changes", () => {
    // Act
    const { rerender } = renderHook(
      ({ channel, event, initialData }) =>
        useRealtimeData(initialData, channel, event),
      {
        initialProps: {
          channel: testChannel,
          event: testEvent,
          initialData,
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
      initialData,
    });

    // Assert - should be called again with new channel
    expect(pusherClient.subscribe).toHaveBeenCalledTimes(2);
    expect(pusherClient.subscribe).toHaveBeenCalledWith("new-channel");
  });
});
