import type { WebhookEvent } from "@clerk/nextjs/server"
import { headers } from "next/headers"
import { Webhook } from "svix"

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET
  if (!WEBHOOK_SECRET) {
    throw new Error("Webhook secret not found in clerk or in .env.local")
  }

  // 2. Get Headers
  const headerPayload = headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error -- no svix headers", { status: 400 })
  }
  console.log("headerPayload", headerPayload)
  // 3. Get the body
  let evt: WebhookEvent
  try {
    const payload = await req.json()
    const body = JSON.stringify(payload)
    const wh = new Webhook(WEBHOOK_SECRET)
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
    console.log("payloas", payload)
    console.log("body", body)
  } catch (err) {
    console.error("Error verifying webhook:", err)
    return new Response("Error verifying webhook", {
      status: 400,
    })
  }

  // 4. Handle the event
  try {
    const eventType = evt.type
    console.log("eventType", eventType)
    if (eventType === "user.updated") {
      const { id, first_name } = evt.data
      if (!id) {
        return new Response("Error -- missing user ID", { status: 400 })
      }

      //   await db.insert(users).values({
      //     id: id,
      //     userName: first_name || id,
      //     messagesSend: 0,
      //   })

      return new Response(JSON.stringify({ successs: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Return 200 for other event types we're not handling
    return new Response(JSON.stringify({ successs: true, message: "Event received" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return new Response(JSON.stringify({ successs: false, error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
