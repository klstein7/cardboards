import { useEffect, useState } from "react";

import { pusherClient } from "~/pusher/client";

/**
 * Hook to get real-time updates for data
 */
export function useRealtimeData<T>(
  initialData: T,
  channel: string,
  event: string,
) {
  const [data, setData] = useState<T>(initialData);

  useEffect(() => {
    const pusherChannel = pusherClient.subscribe(channel);

    pusherChannel.bind(event, (newData: T) => {
      setData(newData);
    });

    return () => {
      pusherChannel.unbind(event);
      pusherClient.unsubscribe(channel);
    };
  }, [channel, event]);

  return data;
}
