import { db } from "@/lib"
import { users } from "@/lib/schema"

export async function POST(req: Request) {
  try {
    const data = await req.json()

    if (data.type === "user.created") {
      try {
        await db.insert(users).values({
          id: data.data.id,
          userName: data.data.username || data.data.id,
          messagesSend: 0,
        })
      } catch (error) {
        return new Response(
          JSON.stringify({
            message: "Database error",
            error,
            data,
          })
        )
      }
    }

    return new Response(
      JSON.stringify({
        message: "Webhook received",
        type: data.type,
        userData: data.data,
      })
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: "Request error",
        error,
      })
    )
  }
}
