ALTER TABLE "printer_users_printer_association" RENAME COLUMN "printer_id" TO "associated_printer_id";--> statement-breakpoint
ALTER TABLE "printer_users_printer_association" DROP CONSTRAINT "printer_users_printer_association_printer_id_printer_printers_id_fk";
--> statement-breakpoint
DROP INDEX IF EXISTS "printer_idx";--> statement-breakpoint
ALTER TABLE "printer_users_printer_association" ADD COLUMN "messages_send_to_associated_printer" integer DEFAULT 0;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "printer_users_printer_association" ADD CONSTRAINT "printer_users_printer_association_associated_printer_id_printer_printers_id_fk" FOREIGN KEY ("associated_printer_id") REFERENCES "public"."printer_printers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "printer_idx" ON "printer_users_printer_association" USING btree ("associated_printer_id");