import { loadEnvConfig } from "@next/env";

// Load environment variables first
loadEnvConfig(process.cwd());

async function main() {
  const { db } = await import("@/lib");
  const { sql } = await import("drizzle-orm");

  console.log("Creating wordle_game_status enum...");
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE wordle_game_status AS ENUM('playing', 'won', 'lost');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  console.log("Creating daily_wordle_words table...");
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS daily_wordle_words (
      id varchar(10) PRIMARY KEY NOT NULL,
      word varchar(5) NOT NULL,
      date date NOT NULL,
      created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
      CONSTRAINT daily_wordle_words_date_unique UNIQUE(date)
    );
  `);

  console.log("Creating wordle_user_games table...");
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS wordle_user_games (
      id varchar(10) PRIMARY KEY NOT NULL,
      user_id varchar(256) NOT NULL,
      wordle_id varchar(10) NOT NULL,
      guesses json DEFAULT '[]'::json NOT NULL,
      status wordle_game_status DEFAULT 'playing' NOT NULL,
      printer_id varchar(10) NOT NULL,
      created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
      completed_at timestamp
    );
  `);

  console.log("Creating wordle_user_stats table...");
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS wordle_user_stats (
      user_id varchar(256) PRIMARY KEY NOT NULL,
      games_played integer DEFAULT 0 NOT NULL,
      games_won integer DEFAULT 0 NOT NULL,
      current_streak integer DEFAULT 0 NOT NULL,
      max_streak integer DEFAULT 0 NOT NULL,
      guess_distribution json DEFAULT '{"1":0,"2":0,"3":0,"4":0,"5":0,"6":0}'::json NOT NULL,
      last_played_date date,
      updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `);

  console.log("Adding foreign keys...");

  // Add foreign keys only if they don't exist
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE wordle_user_games
        ADD CONSTRAINT wordle_user_games_user_id_printer_users_id_fk
        FOREIGN KEY (user_id) REFERENCES printer_users(id) ON DELETE cascade;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE wordle_user_games
        ADD CONSTRAINT wordle_user_games_wordle_id_daily_wordle_words_id_fk
        FOREIGN KEY (wordle_id) REFERENCES daily_wordle_words(id) ON DELETE cascade;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE wordle_user_games
        ADD CONSTRAINT wordle_user_games_printer_id_printer_printers_id_fk
        FOREIGN KEY (printer_id) REFERENCES printer_printers(id) ON DELETE cascade;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE wordle_user_stats
        ADD CONSTRAINT wordle_user_stats_user_id_printer_users_id_fk
        FOREIGN KEY (user_id) REFERENCES printer_users(id) ON DELETE cascade;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  console.log("Done! Wordle tables created successfully.");
}

main().catch(console.error);
