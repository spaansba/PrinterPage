CREATE TYPE "public"."status" AS ENUM('active', 'paused');--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "printer_broadcast_subscriptions" (
    "id" varchar(10) PRIMARY KEY NOT NULL,
    "printer_id" varchar(10) NOT NULL,
    "template_id" varchar(10) NOT NULL,
    "settings_values" json NOT NULL,
    "status" "status" DEFAULT 'active' NOT NULL,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "printer_broadcasters" (
    "id" varchar(10) PRIMARY KEY NOT NULL,
    "creator_id" varchar(256) NOT NULL,
    "name" varchar(20) NOT NULL,
    "settings" json NOT NULL,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "printer_broadcast_subscriptions" ADD CONSTRAINT "printer_broadcast_subscriptions_printer_id_printer_printers_id_fk" FOREIGN KEY ("printer_id") REFERENCES "public"."printer_printers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "printer_broadcast_subscriptions" ADD CONSTRAINT "printer_broadcast_subscriptions_template_id_printer_broadcasters_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."printer_broadcasters"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "printer_broadcasters" ADD CONSTRAINT "printer_broadcasters_creator_id_printer_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."printer_users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DROP TABLE IF EXISTS "printer_weather_subscription_options";--> statement-breakpoint
DROP TABLE IF EXISTS "printer_subscriptions";--> statement-breakpoint
