import { loadEnvConfig } from "@next/env";

// Load environment variables first
loadEnvConfig(process.cwd());

async function main() {
  // Dynamic imports after env is loaded
  const { db } = await import("@/lib");
  const { printerBroadcasters, printerBroadcastSubscriptions } =
    await import("@/lib/schema/subscriptions");
  const { sql } = await import("drizzle-orm");
  const { printers } = await import("@/lib/schema");

  console.log("Dropping foreign key constraint if exists...");
  await db.execute(
    sql`ALTER TABLE printer_broadcasters DROP CONSTRAINT IF EXISTS printer_broadcasters_creator_id_printer_users_id_fk`,
  );

  console.log("Making creator_id nullable...");
  await db.execute(
    sql`ALTER TABLE printer_broadcasters ALTER COLUMN creator_id DROP NOT NULL`,
  );

  console.log("Inserting Baby Countdown broadcaster...");
  await db
    .insert(printerBroadcasters)
    .values({
      id: "3",
      name: "Baby Countdown",
      description: "Days until June 14th",
      settings: {},
    })
    .onConflictDoNothing();

  // Get all existing printers
  console.log("Fetching all printers...");
  const allPrinters = await db.select({ id: printers.id }).from(printers);

  console.log(
    `Found ${allPrinters.length} printers, creating subscriptions...`,
  );

  // Create subscription entries for each printer
  for (const printer of allPrinters) {
    const subId = `baby${printer.id.slice(0, 6)}`;
    await db
      .insert(printerBroadcastSubscriptions)
      .values({
        id: subId,
        printerId: printer.id,
        broadcastId: "3",
        sendTime: "08:00",
        settingsValues: {},
        status: "paused",
      })
      .onConflictDoNothing();
    console.log(`  - Created subscription for printer ${printer.id}`);
  }

  console.log("Done!");
}

main().catch(console.error);
