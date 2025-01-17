CREATE TYPE "public"."subscription_type" AS ENUM('weather', 'news');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "printer_weather_subscription_options" (
	"subscription_id" integer NOT NULL,
	"location" varchar NOT NULL,
	"created_at" timestamp DEFAULT (NOW() AT TIME ZONE 'UTC') NOT NULL,
	"updated_at" timestamp DEFAULT (NOW() AT TIME ZONE 'UTC') NOT NULL
);
--> statement-breakpoint
ALTER TABLE "subscriptions" RENAME TO "printer_subscriptions";--> statement-breakpoint
ALTER TABLE "printer_subscriptions" DROP CONSTRAINT "subscriptions_printer_id_printer_printers_id_fk";
--> statement-breakpoint
ALTER TABLE "printer_subscriptions" ADD COLUMN "type" "subscription_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "printer_subscriptions" ADD COLUMN "send_time" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "printer_subscriptions" ADD COLUMN "active" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "printer_subscriptions" ADD COLUMN "created_at" timestamp DEFAULT (NOW() AT TIME ZONE 'UTC') NOT NULL;--> statement-breakpoint
ALTER TABLE "printer_subscriptions" ADD COLUMN "updated_at" timestamp DEFAULT (NOW() AT TIME ZONE 'UTC') NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "printer_weather_subscription_options" ADD CONSTRAINT "printer_weather_subscription_options_subscription_id_printer_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."printer_subscriptions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "printer_subscriptions" ADD CONSTRAINT "printer_subscriptions_printer_id_printer_printers_id_fk" FOREIGN KEY ("printer_id") REFERENCES "public"."printer_printers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
