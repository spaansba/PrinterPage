CREATE TABLE IF NOT EXISTS "printer_users" (
	"id" varchar(10) PRIMARY KEY NOT NULL,
	"user_id" varchar(256) NOT NULL,
	"user_name" varchar(256),
	"messages_send" integer DEFAULT 0,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp,
	CONSTRAINT "printer_users_user_id_unique" UNIQUE("user_id")
);
