import { sql } from "../lib/db";

async function addViewsColumn() {
  try {
    console.log("Adding views column to drafts table...");

    await sql`
      ALTER TABLE drafts
      ADD COLUMN IF NOT EXISTS views INTEGER NOT NULL DEFAULT 0
    `;

    console.log("✓ Views column added successfully");
    process.exit(0);
  } catch (error) {
    console.error("Failed to add views column:", error);
    process.exit(1);
  }
}

addViewsColumn();
