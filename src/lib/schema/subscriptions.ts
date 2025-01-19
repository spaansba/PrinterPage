import { sql } from "drizzle-orm"
import {
  pgTable,
  varchar,
  timestamp,
  serial,
  pgEnum,
  boolean,
  integer,
  time,
} from "drizzle-orm/pg-core"
import { printers } from "../schema"
import { createInsertSchema } from "drizzle-zod"

// subscriptions
export const SubscriptionType = pgEnum("subscription_type", ["weather", "news"])
export type TempUnit = "Celsius" | "Fahrenheit"
const tempUnitValues = ["Celsius", "Fahrenheit"] as const
export const TempUnitType = pgEnum("temp_unit", tempUnitValues)

export const printerSubscriptions = pgTable("printer_subscriptions", {
  id: serial("id").primaryKey(),
  printerId: varchar("printer_id", { length: 10 })
    .notNull()
    .references(() => printers.id),
  type: SubscriptionType("type").notNull(),
  sendTime: time("send_time").notNull(),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at", { mode: "string" })
    .default(sql`(NOW() AT TIME ZONE 'UTC')`)
    .notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" })
    .default(sql`(NOW() AT TIME ZONE 'UTC')`)
    .notNull(),
})

export type printerSubscription = typeof printerSubscriptions.$inferInsert
export const InsertPrinterSubscriptions = createInsertSchema(printerSubscriptions)

export const printerWeatherSubscriptionOptions = pgTable("printer_weather_subscription_options", {
  id: serial("id").primaryKey(),
  subscriptionId: integer("subscription_id")
    .notNull()
    .references(() => printerSubscriptions.id),
  location: varchar("location").notNull(),
  tempUnit: TempUnitType("temp_unit").notNull().default("Celsius"),
  createdAt: timestamp("created_at", { mode: "string" })
    .default(sql`(NOW() AT TIME ZONE 'UTC')`)
    .notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" })
    .default(sql`(NOW() AT TIME ZONE 'UTC')`)
    .notNull(),
})
