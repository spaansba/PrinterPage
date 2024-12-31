CREATE TABLE IF NOT EXISTS "verification_attempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(256) NOT NULL,
	"count_last_hour" integer DEFAULT 0,
	"expires_at" timestamp DEFAULT NOW() + INTERVAL '60 minutes' NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "verification_attempts" ADD CONSTRAINT "verification_attempts_user_id_printer_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."printer_users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
