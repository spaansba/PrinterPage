ALTER TABLE "printer_users" RENAME COLUMN "user_name" TO "username";--> statement-breakpoint
ALTER TABLE "printer_users_printer_association" RENAME COLUMN "messages_send_to_associated_printer" TO "toasts_send_to_associated_printer";--> statement-breakpoint
ALTER TABLE "printer_users" ALTER COLUMN "toasts_send" SET NOT NULL;