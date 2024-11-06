import { defineConfig } from "drizzle-kit"
import * as dotenv from "dotenv"

const env = dotenv.config({
  path: ".env.local",
})

export default defineConfig({
  schema: "./src/lib/schema.ts",
  dialect: "postgresql",
  out: "./drizzle",
  strict: true,
  dbCredentials: {
    url: env.parsed?.POSTGRES_URL ?? "",
  },
  tablesFilter: "printer_",
})
