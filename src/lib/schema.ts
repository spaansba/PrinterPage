import { sql } from "drizzle-orm"
import { pgTable, varchar, timestamp, serial, integer } from "drizzle-orm/pg-core"
import { createInsertSchema } from "drizzle-zod"

export const printerUserPairing = pgTable("user_pairing", {
  id: serial("id").primaryKey(),
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

export const printerSubscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  printerId: varchar("printer_id", { length: 10 })
    .notNull()
    .references(() => printers.id),
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

export const verificationCodes = pgTable("verification_codes", {
  id: serial("id").primaryKey(),
  printerId: varchar("printer_id", { length: 10 })
    .notNull()
    .references(() => printers.id),
  code: varchar("code", { length: 6 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at")
    .default(sql`NOW() + INTERVAL '5 minutes'`)
    .notNull(),
})

export type newPrinterUserPairing = typeof printerUserPairing.$inferInsert
export const InsertPrinterUserPairing = createInsertSchema(printerUserPairing)

export type newUserAssociatedPrinter = typeof usersAssociatedPrinters.$inferInsert
export const InsertUsersAssociatedPrinters = createInsertSchema(usersAssociatedPrinters)

export type newVerificationCode = typeof verificationCodes.$inferInsert
export const InsertVerificationCode = createInsertSchema(verificationCodes)
