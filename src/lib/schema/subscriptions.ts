import { sql } from "drizzle-orm"
import { pgTable, varchar, timestamp, serial, pgEnum, boolean, integer } from "drizzle-orm/pg-core"
import { printers } from "../schema"

// subscriptions
export const SubscriptionType = pgEnum("subscription_type", ["weather", "news"])

export const printerSubscriptions = pgTable("printer_subscriptions", {
  id: serial("id").primaryKey(),
  printerId: varchar("printer_id", { length: 10 })
    .notNull()
    .references(() => printers.id),
  type: SubscriptionType("type").notNull(),
  sendTime: timestamp("send_time", { mode: "string" }).notNull(),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at", { mode: "string" })
    .default(sql`(NOW() AT TIME ZONE 'UTC')`)
    .notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" })
    .default(sql`(NOW() AT TIME ZONE 'UTC')`)
    .notNull(),
})

export const printerWeatherSubscriptionOptions = pgTable("printer_weather_subscription_options", {
  subscriptionId: integer("subscription_id")
    .notNull()
    .references(() => printerSubscriptions.id),
  location: varchar("location").notNull(),
  createdAt: timestamp("created_at", { mode: "string" })
    .default(sql`(NOW() AT TIME ZONE 'UTC')`)
    .notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" })
    .default(sql`(NOW() AT TIME ZONE 'UTC')`)
    .notNull(),
})
