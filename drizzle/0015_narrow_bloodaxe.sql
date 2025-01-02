ALTER TABLE "user_pairing" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "printer_users" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "printer_users_printer_association" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "verification_attempts" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "printer_printers" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "verification_codes" ALTER COLUMN "expires_at" SET DEFAULT CURRENT_TIMESTAMP AT TIME ZONE 'UTC' + INTERVAL '5 minutes';