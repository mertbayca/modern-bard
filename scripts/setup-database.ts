import { sql } from "../lib/db";
import { readFileSync } from "fs";
import { join } from "path";

async function setupDatabase() {
  console.log("🚀 Setting up database...\n");

  try {
    console.log("📝 Creating tables...");

    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT,
        role TEXT NOT NULL DEFAULT 'user',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`;

    // Create sessions table
    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token TEXT UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token)`;

    // Create drafts table
    await sql`
      CREATE TABLE IF NOT EXISTS drafts (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT NOT NULL,
        content TEXT NOT NULL,
        summary TEXT,
        published BOOLEAN NOT NULL DEFAULT false,
        form TEXT NOT NULL,
        themes TEXT NOT NULL,
        author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_drafts_author_id ON drafts(author_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_drafts_published ON drafts(published)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_drafts_slug ON drafts(slug)`;

    // Create subscribers table
    await sql`
      CREATE TABLE IF NOT EXISTS subscribers (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email)`;

    console.log("✅ Database setup complete!\n");
  } catch (error) {
    console.error("❌ Error setting up database:");
    console.error(error);
    process.exit(1);
  }
}

setupDatabase();
