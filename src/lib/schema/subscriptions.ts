import { sql } from "drizzle-orm"
import { pgTable, varchar, timestamp, pgEnum, json, time } from "drizzle-orm/pg-core"
import { printers, users } from "../schema"
import { createInsertSchema } from "drizzle-zod"
import { z } from "zod"

export type TempUnit = "Celsius" | "Fahrenheit"
const tempUnitValues = ["Celsius", "Fahrenheit"] as const
export const TempUnitType = pgEnum("temp_unit", tempUnitValues)
export const StatusType = pgEnum("status", ["active", "paused"])
export type SubscriptionStatus = "active" | "paused"
export const SettingInputType = z.enum(["string", "number", "boolean", "select", "time"])
export type SettingInputType = z.infer<typeof SettingInputType>

export const printerBroadcasters = pgTable("printer_broadcasters", {
  id: varchar("id", { length: 10 }).primaryKey(),
  creatorId: varchar("creator_id", { length: 256 })
    .notNull()
    .references(() => users.id, { onDelete: "set null" }),
  name: varchar("name", { length: 200 }).notNull(),
  description: varchar("description", { length: 40 }).notNull().default(""),
  settings: json("settings").notNull().default("{}"),
  createdAt: timestamp("created_at", { mode: "string" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull()
    .$onUpdate(() => new Date().toISOString()),
})

export const printerBroadcastSubscriptions = pgTable("printer_broadcast_subscriptions", {
  id: varchar("id", { length: 10 }).primaryKey(),
  printerId: varchar("printer_id", { length: 10 })
    .notNull()
    .references(() => printers.id, { onDelete: "cascade" }),
  broadcastId: varchar("broadcast_id", { length: 10 })
    .notNull()
    .references(() => printerBroadcasters.id, { onDelete: "cascade" }),
  sendTime: time("send_time"),
  settingsValues: json("settings_values").notNull().default("{}"),
  status: StatusType("status").notNull().default("active"),
  createdAt: timestamp("created_at", { mode: "string" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull()
    .$onUpdate(() => new Date().toISOString()),
})

export type PrinterSubscription = typeof printerBroadcastSubscriptions.$inferInsert
export const InsertPrinterSubscriptions = createInsertSchema(printerBroadcastSubscriptions)
