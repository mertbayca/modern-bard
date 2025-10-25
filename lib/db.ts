import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

// Create a Neon SQL client
export const sql = neon(process.env.DATABASE_URL);

// Helper types for our database models
export interface User {
  id: string;
  email: string;
  password: string;
  name: string | null;
  role: string;
  created_at: Date;
  updated_at: Date;
}

export interface Session {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  created_at: Date;
}

export interface Draft {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary: string | null;
  published: boolean;
  form: string;
  themes: string;
  author_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface Subscriber {
  id: string;
  email: string;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Helper function to generate CUID-like IDs
export function generateId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).substring(2, 15)}`;
}
