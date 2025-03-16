import { pusherChannels } from "~/pusher/channels";

import { useEvent } from "./use-event";

/**
 * Hook to subscribe to board events
 */
export function useBoardEvent<T = unknown>(
  eventType: "created" | "updated" | "deleted",
  callback: (data: T) => void,
) {
  const channel = pusherChannels.board.name;
  const event = pusherChannels.board.events[eventType].name;

  useEvent<T>(channel, event, callback);
}
