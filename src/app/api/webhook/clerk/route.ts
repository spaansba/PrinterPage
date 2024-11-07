import { db } from "@/lib"
import { users } from "@/lib/schema"
import { headers } from "next/headers"
import { Webhook } from "svix"
import { WebhookEvent } from "@clerk/nextjs/server"

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET
  if (!WEBHOOK_SECRET) {
    throw new Error("Webhook secret not found in clerk or in .env.local")
  }

  // Get Headers
  const headerPayload = headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  if (!svix_id || !svix_timestamp || !svix_timestamp) {
    return new Response("error -- no svix headers", { status: 400 })
  }
  const data = await req.json()
  const body = JSON.stringify(data)

  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature!,
    }) as WebhookEvent
  } catch (err) {
    console.log("Error verifying webhook", err)
    return new Response("Error occured", {
      status: 400,
    })
  }

  const eventType = evt.type
  if (eventType === "user.created") {
    const id = evt.data.id
    if (!id) {
      return new Response("Error occured -- missing ID", { status: 400 })
    }
    await db.insert(users).values({
      id: id,
      userName: evt.data.first_name || data.data.id,
      messagesSend: 0,
    })
  }
}
