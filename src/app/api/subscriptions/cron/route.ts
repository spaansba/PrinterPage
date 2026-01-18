import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { sendWeatherReport } from "@/lib/queries/subscriptions/weather";
import {
  getSubscriptionsToRun,
  type GetSubscriptions,
} from "@/lib/queries/subscriptions/generalSubscription";
import { registerFonts } from "@/lib/registerFonts";
import { sendDadJoke } from "@/lib/queries/subscriptions/dadJokes";
import { sendBabyCountdown } from "@/lib/queries/subscriptions/babyCountdown";

export async function GET() {
  const headersList = await headers();
  const token = headersList.get("x-cron-token");
  const timeHeader = headersList.get("x-time-send");

  // Auth check first - fail fast
  if (token !== process.env.CRON_ORG_SECRET) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const dateSend = timeHeader
    ? new Date(Number(timeHeader) * 1000)
    : new Date();
  const timeSend = RoundToClosest10Minutes(dateSend);

  try {
    // Get array of the subscriptions
    const subscriptions: GetSubscriptions =
      await getSubscriptionsToRun(timeSend);

    if (!subscriptions.success) {
      return NextResponse.json(
        { status: subscriptions.message },
        { status: 406 },
      );
    }

    if (subscriptions.subscriptions.length === 0) {
      return NextResponse.json({ status: "no jobs" }, { status: 200 });
    }

    registerFonts();

    // Process all subscriptions in parallel
    const results = await Promise.allSettled(
      subscriptions.subscriptions.map((sub) => processSubscription(sub)),
    );

    // Collect errors from rejected promises and failed results
    const errors: Array<{ subscriptionId: string; error: string }> = [];
    results.forEach((result, index) => {
      const sub = subscriptions.subscriptions[index];
      if (result.status === "rejected") {
        errors.push({ subscriptionId: sub.id, error: String(result.reason) });
      } else if (!result.value.success) {
        errors.push({
          subscriptionId: sub.id,
          error: result.value.error || "Unknown error",
        });
      }
    });

    return NextResponse.json(
      {
        status: `Processed ${subscriptions.subscriptions.length} subscriptions`,
        successCount: subscriptions.subscriptions.length - errors.length,
        errorCount: errors.length,
        errors: errors.length > 0 ? errors : undefined,
      },
      { status: errors.length > 0 ? 207 : 200 },
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Subscription processing failed:", errorMessage);
    return NextResponse.json(
      {
        status: "error",
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}

// Process a single subscription
async function processSubscription(
  sub: GetSubscriptions["subscriptions"][number],
): Promise<{ success: boolean; error?: string }> {
  switch (sub.broadcastId) {
    case "1":
      return sendWeatherReport(sub);
    case "2":
      return sendDadJoke(sub.printerId);
    case "3":
      return sendBabyCountdown(sub.printerId);
    default:
      return {
        success: false,
        error: `Unknown broadcast ID: ${sub.broadcastId}`,
      };
  }
}

const RoundToClosest10Minutes = (time: Date) => {
  const coeff = 1000 * 60 * 10;
  const roundedDate = new Date(Math.round(time.getTime() / coeff) * coeff);
  const hours = roundedDate.getUTCHours().toString().padStart(2, "0");
  const minutes = roundedDate.getUTCMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};
