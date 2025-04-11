import {
  type UserJSON,
  type UserWebhookEvent,
  type WebhookEvent,
} from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { Webhook } from "svix";

import { env } from "~/env";
import { services } from "~/server/services/container";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = env.WEBHOOK_SECRET;

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  const payload = (await req.json()) as UserWebhookEvent;
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  const data = evt.data as UserJSON;
  const eventType = evt.type;
  console.log(`Webhook with and ID of ${data.id} and type of ${eventType}`);

  if (eventType === "user.deleted") {
    return;
  }

  const primaryEmailId = data.primary_email_address_id;
  const primaryEmail = data.email_addresses.find(
    (email) => email.id === primaryEmailId,
  );

  if (!primaryEmail) {
    return new Response("Error occured -- no primary email", {
      status: 400,
    });
  }

  await services.userService.sync({
    id: data.id,
    email: primaryEmail.email_address,
    name: data.first_name ?? "",
    imageUrl: data.image_url ?? "",
  });

  return new Response(undefined, { status: 200 });
}
