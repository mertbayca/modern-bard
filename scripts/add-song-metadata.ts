import { sql } from "../lib/db";

async function addSongMetadata() {
  try {
    console.log("Adding metadata columns to songs table...");

    await sql`
      ALTER TABLE songs
      ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
      ADD COLUMN IF NOT EXISTS artist TEXT,
      ADD COLUMN IF NOT EXISTS album TEXT,
      ADD COLUMN IF NOT EXISTS genre TEXT,
      ADD COLUMN IF NOT EXISTS description TEXT
    `;

    console.log("✓ Metadata columns added successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

addSongMetadata();
