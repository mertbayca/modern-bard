-- Create Admin User for Modern Bard
-- Run this in Vercel Postgres Dashboard → Data → Query tab

-- First check if admin already exists
SELECT id, email, name, role
FROM "User"
WHERE email = 'admin@modernbard.local';

-- If no results, run this INSERT:
INSERT INTO "User" (
  id,
  email,
  password,
  name,
  role,
  "createdAt",
  "updatedAt"
)
VALUES (
  'clxadmin' || substring(md5(random()::text) from 1 for 20),
  'admin@modernbard.local',
  '$2b$10$7iQQHtWlvVZh/EcDNL45oukQwSwo3yuH986y.DJ3K2.NCIAfA7Ogm',
  'Admin',
  'admin',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Verify the user was created
SELECT id, email, name, role, "createdAt"
FROM "User"
WHERE role = 'admin';
