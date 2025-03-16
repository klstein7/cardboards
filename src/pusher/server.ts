import Pusher from "pusher";

import { env } from "~/env";

import { pusherChannels } from "./channels";

export const pusher = new Pusher({
  appId: env.NEXT_PUBLIC_PUSHER_APP_ID,
  key: env.NEXT_PUBLIC_PUSHER_KEY,
  secret: env.PUSHER_SECRET,
  cluster: env.NEXT_PUBLIC_PUSHER_CLUSTER,
  useTLS: true,
});

// Helper functions for triggering events

/**
 * Trigger a board event
 */
export function triggerBoardEvent<T = unknown>(
  eventType: "created" | "updated" | "deleted",
  data: T,
) {
  const channel = pusherChannels.board.name;
  const event = pusherChannels.board.events[eventType].name;

  return pusher.trigger(channel, event, data);
}

/**
 * Trigger a column event
 */
export function triggerColumnEvent<T = unknown>(
  eventType: "created" | "updated" | "deleted",
  data: T,
) {
  const channel = pusherChannels.column.name;
  const event = pusherChannels.column.events[eventType].name;

  return pusher.trigger(channel, event, data);
}

/**
 * Trigger a card event
 */
export function triggerCardEvent<T = unknown>(
  eventType: "created" | "updated" | "deleted" | "moved",
  data: T,
) {
  const channel = pusherChannels.card.name;
  const event = pusherChannels.card.events[eventType].name;

  return pusher.trigger(channel, event, data);
}

/**
 * Generic function to trigger any event
 */
export function triggerEvent<T = unknown>(
  channel: string,
  event: string,
  data: T,
) {
  return pusher.trigger(channel, event, data);
}
