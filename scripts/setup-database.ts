import { sql } from "../lib/db";
import { readFileSync } from "fs";
import { join } from "path";

async function setupDatabase() {
  console.log("🚀 Setting up database...\n");

  try {
    // Read and execute schema
    const schemaPath = join(process.cwd(), "db", "schema.sql");
    const schema = readFileSync(schemaPath, "utf-8");

    console.log("📝 Creating tables...");
    await sql(schema);

    console.log("✅ Database setup complete!\n");
  } catch (error) {
    console.error("❌ Error setting up database:");
    console.error(error);
    process.exit(1);
  }
}

setupDatabase();
