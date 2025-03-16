import { pusherChannels } from "~/pusher/channels";

import { useEvent } from "./use-event";

/**
 * Hook to subscribe to card events
 */
export function useCardEvent<T = unknown>(
  eventType:
    | "created"
    | "updated"
    | "deleted"
    | "moved"
    | "assignedToCurrentUser",
  callback: (data: T) => void,
) {
  const channel = pusherChannels.card.name;
  const event = pusherChannels.card.events[eventType].name;

  useEvent<T>(channel, event, callback);
}
