import { sql } from "drizzle-orm"
import { foreignKey, index, pgTableCreator, serial, timestamp, varchar } from "drizzle-orm/pg-core"
import { createInsertSchema } from "drizzle-zod"
export const createTable = pgTableCreator((name) => `printer_${name}`)

export const posts = createTable("post", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt"),
})

export type NewPost = typeof posts.$inferInsert

export const printers = createTable("printers", {
  id: varchar("id", { length: 10 }).primaryKey(),
  name: varchar("name", { length: 256 }),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt"),
})

export const usersAssociatedPrinters = createTable(
  "users_printer_association",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id", { length: 256 }).notNull(),
    printerId: varchar("printer_id", { length: 10 }).notNull(),
    name: varchar("name", { length: 50 }).notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt", { mode: "string" }),
  },
  (table) => {
    return {
      printerIdx: index("printer_idx").on(table.printerId),
      printerFk: foreignKey({
        columns: [table.printerId],
        foreignColumns: [printers.id],
      }),
    }
  }
)

export type newUserAssociatedPrinter = typeof usersAssociatedPrinters.$inferInsert
export const InsertUsersAssociatedPrinters = createInsertSchema(usersAssociatedPrinters)
