DO $$ BEGIN
 ALTER TABLE "printer_users_printer_association" ADD CONSTRAINT "printer_users_printer_association_user_id_printer_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."printer_users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_idx" ON "printer_users_printer_association" USING btree ("user_id");