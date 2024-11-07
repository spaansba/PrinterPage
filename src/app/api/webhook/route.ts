import { headers } from "next/headers"
import { createNewUser } from "@/lib/queries"

export async function POST(req: Request) {
  try {
    const payload = await req.json()

    // Return detailed info in response during testing
    if (payload.type === "user.created") {
      const { id, username, first_name, last_name } = payload.data
      const displayName =
        username || (first_name || last_name ? `${first_name || ""} ${last_name || ""}`.trim() : id)

      const result = await createNewUser(id, displayName)

      // Return debug info
      return new Response(
        JSON.stringify({
          received: payload,
          userCreated: {
            id,
            displayName,
            result,
          },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    return new Response(
      JSON.stringify({
        received: payload,
        message: "Not a user.created event",
      })
    )
  } catch (error: any) {
    // Return error details during testing
    return new Response(
      JSON.stringify({
        error: error.message,
        stack: error.stack,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  }
}
