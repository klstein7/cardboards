import { pusherChannels } from "~/pusher/channels";

import { useEvent } from "./use-event";

/**
 * Hook to subscribe to column events
 */
export function useColumnEvent<T = unknown>(
  eventType: "created" | "updated" | "deleted",
  callback: (data: T) => void,
) {
  const channel = pusherChannels.column.name;
  const event = pusherChannels.column.events[eventType].name;

  useEvent<T>(channel, event, callback);
}
