export async function GET() {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

  console.log("Environment Check:", {
    hasWebhookSecret: !!webhookSecret,
    hasPublishableKey: !!publishableKey,
    nodeEnv: process.env.NODE_ENV,
    // Log partial keys for verification (safely)
    webhookSecretPrefix: webhookSecret?.substring(0, 4),
    publishableKeyPrefix: publishableKey?.substring(0, 4),
  })

  return new Response("Environment check completed - check logs")
}
