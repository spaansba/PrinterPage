CREATE TABLE IF NOT EXISTS "printer_users_printer_association" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(256) NOT NULL,
	"printer_id" varchar(10),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp
);
--> statement-breakpoint
DROP INDEX IF EXISTS "name_idx";--> statement-breakpoint
ALTER TABLE "printer_printers" ALTER COLUMN "id" SET DATA TYPE varchar(10);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "printer_users_printer_association" ADD CONSTRAINT "printer_users_printer_association_printer_id_printer_printers_id_fk" FOREIGN KEY ("printer_id") REFERENCES "public"."printer_printers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "printer_idx" ON "printer_users_printer_association" USING btree ("printer_id");