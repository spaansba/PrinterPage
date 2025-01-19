DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_type') THEN
        CREATE TYPE "public"."subscription_type" AS ENUM('weather', 'news');
    END IF;
END $$;
--> statement-breakpoint
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'temp_unit') THEN
        CREATE TYPE "public"."temp_unit" AS ENUM('Celsius', 'Fahrenheit');
    END IF;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "printer_subscriptions" (
    "id" serial PRIMARY KEY NOT NULL,
    "printer_id" varchar(10) NOT NULL,
    "type" "subscription_type" NOT NULL,
    "send_time" time NOT NULL,
    "active" boolean DEFAULT true,
    "created_at" timestamp DEFAULT (NOW() AT TIME ZONE 'UTC') NOT NULL,
    "updated_at" timestamp DEFAULT (NOW() AT TIME ZONE 'UTC') NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "printer_weather_subscription_options" (
    "id" serial PRIMARY KEY NOT NULL,
    "subscription_id" integer NOT NULL,
    "location" varchar NOT NULL,
    "temp_unit" "temp_unit" DEFAULT 'Celsius' NOT NULL,
    "created_at" timestamp DEFAULT (NOW() AT TIME ZONE 'UTC') NOT NULL,
    "updated_at" timestamp DEFAULT (NOW() AT TIME ZONE 'UTC') NOT NULL
);
--> statement-breakpoint
ALTER TABLE "printer_printers" ADD COLUMN IF NOT EXISTS "toasts_received" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "printer_subscriptions" ADD CONSTRAINT "printer_subscriptions_printer_id_printer_printers_id_fk" FOREIGN KEY ("printer_id") REFERENCES "public"."printer_printers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "printer_weather_subscription_options" ADD CONSTRAINT "printer_weather_subscription_options_subscription_id_printer_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."printer_subscriptions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;