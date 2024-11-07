import { headers } from "next/headers"

export async function POST(req: Request) {
  // Log headers
  const headersList = headers()
  console.log("Headers:", {
    "svix-id": headersList.get("svix-id"),
    "svix-timestamp": headersList.get("svix-timestamp"),
    "svix-signature": headersList.get("svix-signature"),
  })

  // Log body
  const body = await req.json()
  console.log("Webhook Body:", body)

  return new Response("Webhook received", {
    status: 200,
  })
}
