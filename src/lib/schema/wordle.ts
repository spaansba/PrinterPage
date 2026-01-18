import { sql } from "drizzle-orm";
import {
  pgTable,
  varchar,
  timestamp,
  pgEnum,
  json,
  integer,
  date,
} from "drizzle-orm/pg-core";
import { printers, users } from "../schema";
import { createInsertSchema } from "drizzle-zod";

// Game status enum
export const WordleGameStatus = pgEnum("wordle_game_status", [
  "playing",
  "won",
  "lost",
]);
export type WordleGameStatusType = "playing" | "won" | "lost";

// Daily wordle words table
export const dailyWordleWords = pgTable("daily_wordle_words", {
  id: varchar("id", { length: 10 }).primaryKey(),
  word: varchar("word", { length: 5 }).notNull(),
  date: date("date", { mode: "string" }).notNull().unique(),
  createdAt: timestamp("created_at", { mode: "string" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

// User's game state for each day
export const wordleUserGames = pgTable("wordle_user_games", {
  id: varchar("id", { length: 10 }).primaryKey(),
  userId: varchar("user_id", { length: 256 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  wordleId: varchar("wordle_id", { length: 10 })
    .notNull()
    .references(() => dailyWordleWords.id, { onDelete: "cascade" }),
  guesses: json("guesses").$type<string[]>().notNull().default([]),
  status: WordleGameStatus("status").notNull().default("playing"),
  printerId: varchar("printer_id", { length: 10 })
    .notNull()
    .references(() => printers.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: "string" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  completedAt: timestamp("completed_at", { mode: "string" }),
});

// Persistent user statistics
export const wordleUserStats = pgTable("wordle_user_stats", {
  userId: varchar("user_id", { length: 256 })
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  gamesPlayed: integer("games_played").notNull().default(0),
  gamesWon: integer("games_won").notNull().default(0),
  currentStreak: integer("current_streak").notNull().default(0),
  maxStreak: integer("max_streak").notNull().default(0),
  guessDistribution: json("guess_distribution")
    .$type<Record<string, number>>()
    .notNull()
    .default({ "1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0 }),
  lastPlayedDate: date("last_played_date", { mode: "string" }),
  updatedAt: timestamp("updated_at", { mode: "string" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull()
    .$onUpdate(() => new Date().toISOString()),
});

// Types
export type DailyWordleWord = typeof dailyWordleWords.$inferSelect;
export type NewDailyWordleWord = typeof dailyWordleWords.$inferInsert;
export const InsertDailyWordleWord = createInsertSchema(dailyWordleWords);

export type WordleUserGame = typeof wordleUserGames.$inferSelect;
export type NewWordleUserGame = typeof wordleUserGames.$inferInsert;
export const InsertWordleUserGame = createInsertSchema(wordleUserGames);

export type WordleUserStats = typeof wordleUserStats.$inferSelect;
export type NewWordleUserStats = typeof wordleUserStats.$inferInsert;
export const InsertWordleUserStats = createInsertSchema(wordleUserStats);
