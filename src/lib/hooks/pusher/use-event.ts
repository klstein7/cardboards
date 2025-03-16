import { useEffect } from "react";

import { pusherClient } from "~/pusher/client";

/**
 * Hook to subscribe to a specific channel and event
 */
export function useEvent<T = unknown>(
  channel: string,
  event: string,
  callback: (data: T) => void,
) {
  useEffect(() => {
    const pusherChannel = pusherClient.subscribe(channel);

    pusherChannel.bind(event, callback);

    return () => {
      pusherChannel.unbind(event, callback);
      pusherClient.unsubscribe(channel);
    };
  }, [channel, event, callback]);
}
