import { sql } from "drizzle-orm"
import { pgTable, varchar, timestamp, serial, integer } from "drizzle-orm/pg-core"
import { createInsertSchema } from "drizzle-zod"

export const pairing = pgTable("printer_pairing", {
  id: varchar("id", { length: 256 }).primaryKey(),
  printerId: varchar("printer_id", { length: 10 })
    .notNull()
    .references(() => printers.id),
  userId: varchar("user_id", { length: 256 })
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { mode: "string" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt", { mode: "string" }),
})

export const users = pgTable("printer_users", {
  id: varchar("id", { length: 256 }).primaryKey(),
  userName: varchar("user_name", { length: 256 }),
  messagesSend: integer("messages_send").default(0),
  createdAt: timestamp("created_at", { mode: "string" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt", { mode: "string" }),
})

export const printers = pgTable("printer_printers", {
  id: varchar("id", { length: 10 }).primaryKey(),
  name: varchar("name", { length: 256 }),
  createdAt: timestamp("created_at", { mode: "string" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt", { mode: "string" }),
})

export const usersAssociatedPrinters = pgTable("printer_users_printer_association", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 256 })
    .notNull()
    .references(() => users.id),
  associatedPrinterId: varchar("associated_printer_id", { length: 10 })
    .notNull()
    .references(() => printers.id),
  messagesSendToAssociatedPrinter: integer("messages_send_to_associated_printer").default(0),
  name: varchar("name", { length: 50 }).notNull(),
  createdAt: timestamp("created_at", { mode: "string" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt", { mode: "string" }),
  lastSendMessage: timestamp("last_send_message", { mode: "string" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

export type newUserAssociatedPrinter = typeof usersAssociatedPrinters.$inferInsert
export const InsertUsersAssociatedPrinters = createInsertSchema(usersAssociatedPrinters)
