import { sql } from "drizzle-orm"
import {
  foreignKey,
  index,
  integer,
  pgTableCreator,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core"
import { createInsertSchema } from "drizzle-zod"
export const createTable = pgTableCreator((name) => `printer_${name}`)

export const users = createTable("users", {
  id: varchar("id", { length: 256 }).primaryKey(),
  userName: varchar("user_name", { length: 256 }),
  messagesSend: integer("messages_send").default(0),
  createdAt: timestamp("created_at", { mode: "string" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt", { mode: "string" }),
})

export const printers = createTable("printers", {
  id: varchar("id", { length: 10 }).primaryKey(),
  name: varchar("name", { length: 256 }),
  createdAt: timestamp("created_at", { mode: "string" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt", { mode: "string" }),
})

export const usersAssociatedPrinters = createTable(
  "users_printer_association",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id", { length: 256 }).notNull(),
    associatedPrinterId: varchar("associated_printer_id", { length: 10 }).notNull(),
    messagesSendToAssociatedPrinter: integer("messages_send_to_associated_printer").default(0),
    name: varchar("name", { length: 50 }).notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt", { mode: "string" }),
    lastSendMessage: timestamp("last_send_message", { mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => {
    return {
      printerIdx: index("printer_idx").on(table.associatedPrinterId),
      userIdx: index("user_idx").on(table.userId),
      printerFk: foreignKey({
        columns: [table.associatedPrinterId],
        foreignColumns: [printers.id],
      }),
      userFk: foreignKey({
        columns: [table.userId],
        foreignColumns: [users.id],
      }),
    }
  }
)

export type newUserAssociatedPrinter = typeof usersAssociatedPrinters.$inferInsert
export const InsertUsersAssociatedPrinters = createInsertSchema(usersAssociatedPrinters)
