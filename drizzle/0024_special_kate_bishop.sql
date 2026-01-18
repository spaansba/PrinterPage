CREATE TYPE "public"."wordle_game_status" AS ENUM('playing', 'won', 'lost');--> statement-breakpoint
CREATE TABLE "daily_wordle_words" (
	"id" varchar(10) PRIMARY KEY NOT NULL,
	"word" varchar(5) NOT NULL,
	"date" date NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "daily_wordle_words_date_unique" UNIQUE("date")
);
--> statement-breakpoint
CREATE TABLE "wordle_user_games" (
	"id" varchar(10) PRIMARY KEY NOT NULL,
	"user_id" varchar(256) NOT NULL,
	"wordle_id" varchar(10) NOT NULL,
	"guesses" json DEFAULT '[]'::json NOT NULL,
	"status" "wordle_game_status" DEFAULT 'playing' NOT NULL,
	"printer_id" varchar(10) NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "wordle_user_stats" (
	"user_id" varchar(256) PRIMARY KEY NOT NULL,
	"games_played" integer DEFAULT 0 NOT NULL,
	"games_won" integer DEFAULT 0 NOT NULL,
	"current_streak" integer DEFAULT 0 NOT NULL,
	"max_streak" integer DEFAULT 0 NOT NULL,
	"guess_distribution" json DEFAULT '{"1":0,"2":0,"3":0,"4":0,"5":0,"6":0}'::json NOT NULL,
	"last_played_date" date,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE "printer_broadcasters" DROP CONSTRAINT "printer_broadcasters_creator_id_printer_users_id_fk";
--> statement-breakpoint
ALTER TABLE "user_pairing" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "user_pairing" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "printer_printers" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "printer_printers" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "printer_users" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "printer_users" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "printer_users_printer_association" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "printer_users_printer_association" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "verification_attempts" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "verification_attempts" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "verification_codes" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "verification_codes" ALTER COLUMN "expires_at" SET DEFAULT CURRENT_TIMESTAMP + INTERVAL '5 minutes';--> statement-breakpoint
ALTER TABLE "printer_broadcasters" ALTER COLUMN "creator_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "wordle_user_games" ADD CONSTRAINT "wordle_user_games_user_id_printer_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."printer_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wordle_user_games" ADD CONSTRAINT "wordle_user_games_wordle_id_daily_wordle_words_id_fk" FOREIGN KEY ("wordle_id") REFERENCES "public"."daily_wordle_words"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wordle_user_games" ADD CONSTRAINT "wordle_user_games_printer_id_printer_printers_id_fk" FOREIGN KEY ("printer_id") REFERENCES "public"."printer_printers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wordle_user_stats" ADD CONSTRAINT "wordle_user_stats_user_id_printer_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."printer_users"("id") ON DELETE cascade ON UPDATE no action;