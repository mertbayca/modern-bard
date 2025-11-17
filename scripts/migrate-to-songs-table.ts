import { sql } from "../lib/db";

async function migrateToSongsTable() {
  try {
    console.log("Creating songs table...");

    // Create songs table
    await sql`
      CREATE TABLE IF NOT EXISTS songs (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        file_url TEXT NOT NULL,
        duration INTEGER,
        file_size INTEGER,
        author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_songs_author_id ON songs(author_id)
    `;

    console.log("✓ Songs table created");

    // Add song_id column to drafts
    console.log("Adding song_id column to drafts table...");

    await sql`
      ALTER TABLE drafts
      ADD COLUMN IF NOT EXISTS song_id TEXT REFERENCES songs(id) ON DELETE SET NULL
    `;

    console.log("✓ song_id column added");

    // Optionally: Remove old columns (mp3_url, mp3_duration, has_audio)
    // Uncomment these if you want to remove the old columns:
    // console.log("Removing old audio columns...");
    // await sql`ALTER TABLE drafts DROP COLUMN IF EXISTS mp3_url`;
    // await sql`ALTER TABLE drafts DROP COLUMN IF EXISTS mp3_duration`;
    // await sql`ALTER TABLE drafts DROP COLUMN IF EXISTS has_audio`;
    // console.log("✓ Old columns removed");

    console.log("\n✅ Migration completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrateToSongsTable();
