CREATE TABLE IF NOT EXISTS "verification_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"printer_id" varchar(10) NOT NULL,
	"code" varchar(6) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp DEFAULT NOW() + INTERVAL '5 minutes' NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "verification_codes" ADD CONSTRAINT "verification_codes_printer_id_printer_printers_id_fk" FOREIGN KEY ("printer_id") REFERENCES "public"."printer_printers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
