import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sendWeatherReport } from "@/lib/queries/subscriptions/weather";
import { sendDadJoke } from "@/lib/queries/subscriptions/dadJokes";
import { sendBabyCountdown } from "@/lib/queries/subscriptions/babyCountdown";
import { registerFonts } from "@/lib/registerFonts";

export async function POST(request: Request) {
  try {
    // Require authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { subscriptionType, printerId, settings } = await request.json();

    if (!subscriptionType || !printerId) {
      return NextResponse.json(
        { error: "subscriptionType and printerId are required" },
        { status: 400 }
      );
    }

    registerFonts();

    let result: { success: boolean; error?: string };

    switch (subscriptionType) {
      case "Weather":
        result = await sendWeatherReport({
          printerId,
          settingsValues: settings || { Location: "Amsterdam", Temperature: "Celsius" },
        } as Parameters<typeof sendWeatherReport>[0]);
        break;
      case "Dad Jokes":
        result = await sendDadJoke(printerId);
        break;
      case "Baby Countdown":
        result = await sendBabyCountdown(printerId);
        break;
      default:
        return NextResponse.json(
          { error: `Unknown subscription type: ${subscriptionType}` },
          { status: 400 }
        );
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error testing subscription:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
