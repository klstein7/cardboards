import { pusherChannels } from "~/pusher/channels";

import { useEvent } from "./use-event";

/**
 * Hook to subscribe to project events
 */
export function useProjectEvent<T = unknown>(
  eventType: "created" | "updated" | "deleted",
  callback: (data: T) => void,
) {
  const channel = pusherChannels.project.name;
  const event = pusherChannels.project.events[eventType].name;

  useEvent<T>(channel, event, callback);
}
