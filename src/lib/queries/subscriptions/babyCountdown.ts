import { babyCountdownCardBytes } from "@/app/_helpers/imageCreating/babyCountdownCard";
import { sendSubscription } from "./generalSubscription";

// Baby due date: June 14, 2026
const DUE_DATE = new Date("2026-06-14T00:00:00");

export const sendBabyCountdown = async (
  printerId: string,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const daysLeft = calculateDaysLeft();
    const content = await babyCountdownCardBytes(daysLeft);
    const send = await sendSubscription(content, printerId);

    if (!send.success) {
      return { success: false, error: send.error };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: errorMessage };
  }
};

function calculateDaysLeft(): number {
  const now = new Date();
  const diffTime = DUE_DATE.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}
