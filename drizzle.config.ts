import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

const env = dotenv.config({
  path: ".env.local",
});

export default defineConfig({
  schema: [
    "./src/lib/schema.ts",
    "./src/lib/schema/*.ts",
    "./src/lib/schema/*/*.ts",
  ],
  dialect: "postgresql",
  out: "./drizzle",
  strict: true,
  dbCredentials: {
    url: env.parsed?.POSTGRES_URL ?? "",
  },
  tablesFilter: [
    "printer_*",
    "user_pairing",
    "verification_*",
    "daily_wordle_words",
    "wordle_user_*",
  ],
  verbose: true,
});
