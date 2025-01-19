ALTER TABLE "printer_broadcasters" ALTER COLUMN "name" SET DATA TYPE varchar(200);--> statement-breakpoint
ALTER TABLE "printer_broadcasters" ADD COLUMN "description" varchar(20) DEFAULT '' NOT NULL;