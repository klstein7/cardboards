import { pusherChannels } from "~/pusher/channels";

import { useEvent } from "./use-event";

/**
 * Hook to subscribe to project user events
 */
export function useProjectUserEvent<T = unknown>(
  eventType: "added" | "removed" | "updated",
  callback: (data: T) => void,
) {
  const channel = pusherChannels.projectUser.name;
  const event = pusherChannels.projectUser.events[eventType].name;

  useEvent<T>(channel, event, callback);
}
