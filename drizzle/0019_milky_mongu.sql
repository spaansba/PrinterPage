ALTER TABLE "printer_broadcast_subscriptions" RENAME COLUMN "template_id" TO "broadcast_id";--> statement-breakpoint
ALTER TABLE "printer_broadcast_subscriptions" DROP CONSTRAINT "printer_broadcast_subscriptions_template_id_printer_broadcasters_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "printer_broadcast_subscriptions" ADD CONSTRAINT "printer_broadcast_subscriptions_broadcast_id_printer_broadcasters_id_fk" FOREIGN KEY ("broadcast_id") REFERENCES "public"."printer_broadcasters"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
