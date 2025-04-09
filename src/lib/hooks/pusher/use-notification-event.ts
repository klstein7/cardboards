import { pusherChannels } from "~/pusher/channels";

import { useEvent } from "./use-event";

/**
 * Hook to subscribe to notification events
 */
export function useNotificationEvent<T = unknown>(
  eventType:
    | "created"
    | "updated"
    | "deleted"
    | "markedAsRead"
    | "allMarkedAsRead",
  callback: (data: T) => void,
) {
  const channel = pusherChannels.notification.name;
  const event = pusherChannels.notification.events[eventType].name;

  useEvent<T>(channel, event, callback);
}
