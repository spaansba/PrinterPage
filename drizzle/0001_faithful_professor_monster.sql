CREATE TABLE IF NOT EXISTS "printer_printers" (
	"id" varchar(256) PRIMARY KEY NOT NULL,
	"name" varchar(256),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp
);
