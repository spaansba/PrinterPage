CREATE TABLE IF NOT EXISTS "printer_pairing" (
	"id" varchar(256) PRIMARY KEY NOT NULL,
	"printer_id" varchar(10) NOT NULL,
	"user_id" varchar(256) NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp
);
--> statement-breakpoint
DROP INDEX IF EXISTS "printer_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "user_idx";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "printer_pairing" ADD CONSTRAINT "printer_pairing_printer_id_printer_printers_id_fk" FOREIGN KEY ("printer_id") REFERENCES "public"."printer_printers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "printer_pairing" ADD CONSTRAINT "printer_pairing_user_id_printer_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."printer_users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
