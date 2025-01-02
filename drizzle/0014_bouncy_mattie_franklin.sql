ALTER TABLE "user_pairing" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "printer_printers" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "printer_users" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "printer_users_printer_association" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "verification_attempts" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "verification_codes" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP AT TIME ZONE 'UTC';