// app/api/webhook/clerk/route.ts
import { WebhookEvent } from "@clerk/nextjs/server"
import { headers } from "next/headers"
import { Webhook } from "svix"
import { createNewUser } from "@/lib/queries"

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    return new Response("Webhook secret not found", { status: 500 })
  }

  // Get the headers
  const headerPayload = headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

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

  try {
    if (evt.type === "user.created") {
      const { id, first_name, last_name, username, email_addresses } = evt.data

      // Get the primary email if available
      const primaryEmail = email_addresses?.[0]?.email_address

      // Construct user name in order of preference:
      // 1. username if exists
      // 2. first_name + last_name if either exists
      // 3. email prefix if email exists
      // 4. fallback to "Anonymous User"
      let userName = username
      if (!userName) {
        if (first_name || last_name) {
          userName = [first_name, last_name].filter(Boolean).join(" ")
        } else if (primaryEmail) {
          userName = primaryEmail.split("@")[0]
        } else {
          userName = "Anonymous User"
        }
      }

      console.log("Creating user with:", {
        clerkId: id,
        userName: userName,
      })

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
  } catch (error) {
    console.error("Error processing webhook:", error)

    // Log detailed error information
    if (error instanceof Error) {
      console.error({
        message: error.message,
        stack: error.stack,
        eventType: evt.type,
        userData: evt.data,
      })
    }

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
