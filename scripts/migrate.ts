import { db } from "@/lib";
import { migrate } from "drizzle-orm/vercel-postgres/migrator";

async function main() {
  await migrate(db, { migrationsFolder: "./drizzle" });
}

main();
