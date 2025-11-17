import { sql } from "../lib/db";

async function addAudioColumns() {
  try {
    console.log("Adding audio columns to drafts table...");

    await sql`
      ALTER TABLE drafts
      ADD COLUMN IF NOT EXISTS mp3_url TEXT,
      ADD COLUMN IF NOT EXISTS mp3_duration INTEGER,
      ADD COLUMN IF NOT EXISTS has_audio BOOLEAN NOT NULL DEFAULT false
    `;

    console.log("✓ Audio columns added successfully");
    process.exit(0);
  } catch (error) {
    console.error("Failed to add audio columns:", error);
    process.exit(1);
  }
}

addAudioColumns();
