import { drizzle } from "drizzle-orm/vercel-postgres"
import { sql } from "@vercel/postgres"
import * as schema from "./schema"

export const db = drizzle(sql, {
  schema,
  logger: {
    logQuery(query, params) {
      console.log("SQL Query:", query)
      console.log("Params:", params)
      console.log("")
    },
  },
})
