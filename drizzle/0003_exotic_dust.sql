ALTER TABLE "printer_users" DROP CONSTRAINT "printer_users_user_id_unique";--> statement-breakpoint
ALTER TABLE "printer_users" ALTER COLUMN "id" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "printer_users" DROP COLUMN IF EXISTS "user_id";