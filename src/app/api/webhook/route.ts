import { headers } from "next/headers"
import { WebhookEvent } from "@clerk/nextjs/server"
import { Webhook } from "svix"
import { createNewUser } from "@/lib/queries" // adjust this import path as needed

export async function POST(req: Request) {
  try {
    const headersList = headers()
    const svixId = headersList.get("svix-id")
    const svixTimestamp = headersList.get("svix-timestamp")
    const svixSignature = headersList.get("svix-signature")

    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response("Missing svix headers", { status: 400 })
    }

    const payload = await req.json()
    const body = JSON.stringify(payload)

    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET
    if (!webhookSecret) {
      return new Response("Missing webhook secret", { status: 500 })
    }

    const wh = new Webhook(webhookSecret)
    let evt: WebhookEvent

    try {
      evt = wh.verify(body, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as WebhookEvent
    } catch (err) {
      console.error("Error verifying webhook:", err)
      return new Response("Invalid webhook signature", { status: 400 })
    }

    // Handle the webhook
    if (evt.type === "user.created") {
      const { id, first_name, last_name, username } = evt.data

      // Use username or combine first/last name, falling back to id if neither exists
      const displayName =
        username || (first_name || last_name ? `${first_name || ""} ${last_name || ""}`.trim() : id)

      try {
        const result = await createNewUser(id, displayName)
        console.log("User created successfully:", result)
      } catch (error) {
        if (error instanceof Error && error.message === "User already exists") {
          // This is fine, just log it
          console.log("User already exists:", id)
          return new Response("User already exists", { status: 200 })
        }
        // For other errors, we should probably still return 200 to Clerk
        // but log the error for our monitoring
        console.error("Error creating user:", error)
      }
    }

    return new Response("Webhook processed", { status: 200 })
  } catch (error) {
    console.error("Webhook processing error:", error)
    return new Response("Internal server error", { status: 500 })
  }
}

export async function GET() {
  return new Response("Webhook endpoint is alive", { status: 200 })
}

export async function HEAD() {
  return new Response(null, { status: 200 })
}
