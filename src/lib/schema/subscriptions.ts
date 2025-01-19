import { sql } from "drizzle-orm"
import { pgTable, varchar, timestamp, serial, pgEnum, integer, json } from "drizzle-orm/pg-core"
import { printers, users } from "../schema"
import { createInsertSchema } from "drizzle-zod"
import { z } from "zod"

// subscriptions
export type TempUnit = "Celsius" | "Fahrenheit"
const tempUnitValues = ["Celsius", "Fahrenheit"] as const
export const TempUnitType = pgEnum("temp_unit", tempUnitValues)
export const StatusType = pgEnum("status", ["active", "paused"])

export const SettingInputType = z.enum(["string", "number", "boolean", "select"])
export type SettingInputType = z.infer<typeof SettingInputType>

export const printerBroadcasters = pgTable("printer_broadcasters", {
  id: varchar("id", { length: 10 }).primaryKey(),
  creatorId: varchar("creator_id", { length: 256 })
    .notNull()
    .references(() => users.id, { onDelete: "set null" }),
  name: varchar("name", { length: 20 }).notNull(),
  settings: json("settings").notNull(),
  createdAt: timestamp("created_at", { mode: "string" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

export const printerBroadcastSubscriptions = pgTable("printer_broadcast_subscriptions", {
  id: varchar("id", { length: 10 }).primaryKey(),
  printerId: varchar("printer_id", { length: 10 })
    .notNull()
    .references(() => printers.id, { onDelete: "cascade" }),
  templateId: varchar("template_id", { length: 10 })
    .notNull()
    .references(() => printerBroadcasters.id, { onDelete: "cascade" }),
  settingsValues: json("settings_values").notNull(),
  status: StatusType("status").notNull().default("active"),
  createdAt: timestamp("created_at", { mode: "string" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

export type printerSubscription = typeof printerBroadcastSubscriptions.$inferInsert
export const InsertPrinterSubscriptions = createInsertSchema(printerBroadcastSubscriptions)

// export const printerWeatherSubscriptionOptions = pgTable("printer_weather_subscription_options", {
//   id: serial("id").primaryKey(),
//   subscriptionId: integer("subscription_id")
//     .notNull()
//     .references(() => printerBroadcastSubscriptions.id),
//   location: varchar("location").notNull(),
//   tempUnit: TempUnitType("temp_unit").notNull().default("Celsius"),
//   createdAt: timestamp("created_at", { mode: "string" })
//     .default(sql`CURRENT_TIMESTAMP AT TIME ZONE 'UTC'`)
//     .notNull(),
//   updatedAt: timestamp("updated_at", { mode: "string" })
//     .default(sql`CURRENT_TIMESTAMP AT TIME ZONE 'UTC'`)
//     .notNull(),
// })
