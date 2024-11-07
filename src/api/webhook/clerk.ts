import { WebhookEvent } from "@clerk/nextjs/server"
import { headers } from "next/headers"
import { Webhook } from "svix"
import { createNewUser } from "@/lib/queries"

export async function POST(req: Request) {
  console.log("running")
  // Get the webhook signing secret from your environment variables
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    return new Response("Webhook secret not found", { status: 500 })
  }

  // Get the headers
  const headerPayload = headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  // Verify the webhook
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error("Error verifying webhook:", err)
    return new Response("Error verifying webhook", { status: 400 })
  }

  // Handle the webhook event
  try {
    switch (evt.type) {
      case "user.created": {
        const { id, username, first_name, last_name } = evt.data

        // Construct the user's name
        const userName =
          username || [first_name, last_name].filter(Boolean).join(" ") || "Anonymous User"

        // Create the user in your database
        const result = await createNewUser(id, userName)

        return new Response(
          JSON.stringify({
            success: true,
            message: "User created successfully",
            user: result.user,
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
      }

      // Handle other webhook events if needed
      // case 'user.updated':
      // case 'user.deleted':

      default:
        // Return 200 for unhandled events to acknowledge receipt
        return new Response(
          JSON.stringify({
            success: true,
            message: `Webhook received: ${evt.type}`,
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
    }
  } catch (error) {
    console.error("Error processing webhook:", error)
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error processing webhook",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
  }
}
