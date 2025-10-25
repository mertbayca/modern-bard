# Production Database Setup Guide

## Prerequisites

1. Vercel project deployed
2. Vercel Postgres database created and connected
3. Vercel CLI installed: `npm i -g vercel`

## Step 1: Connect to Vercel Project

```bash
# Login to Vercel
vercel login

# Link to your project (run from project root)
vercel link

# Pull environment variables (creates .env.production.local)
vercel env pull .env.production.local
```

## Step 2: Push Database Schema

This creates the database tables in production:

```bash
# Use production environment variables
export $(cat .env.production.local | grep -v '^#' | xargs)

# Push schema to production database
npx prisma db push

# Generate Prisma client
npx prisma generate
```

## Step 3: Create Admin User

### Option A: Using the seed script

```bash
# Make sure environment variables are loaded
export $(cat .env.production.local | grep -v '^#' | xargs)

# Set admin credentials (or use defaults)
export ADMIN_EMAIL="your-email@domain.com"
export ADMIN_PASSWORD="your-secure-password"
export ADMIN_NAME="Admin"

# Run seed script
npm run db:seed
```

### Option B: Using Vercel Postgres Dashboard

1. Go to Vercel Dashboard → Storage → Your Database → Data tab
2. Click "Query" tab
3. Run this SQL (after generating password hash):

```sql
-- First, generate password hash locally:
-- npm run hash-password YOUR_PASSWORD

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
  'clxxx' || substring(md5(random()::text) from 1 for 20),  -- Random CUID-like ID
  'your-email@domain.com',                                  -- Your email
  'PASTE_PASSWORD_HASH_HERE',                               -- Bcrypt hash from step below
  'Admin',                                                   -- Display name
  'admin',                                                   -- Role
  NOW(),                                                     -- Created at
  NOW()                                                      -- Updated at
);
```

### Option C: Generate Password Hash First

```bash
# Generate password hash
npm run hash-password "YourSecurePassword123"

# This will output a hash like:
# $2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Use this hash in the SQL INSERT above
```

## Step 4: Verify Setup

```bash
# Open Prisma Studio connected to production
npx prisma studio
```

Or query the database:

```bash
# Check if user exists
npx prisma db execute --stdin <<EOF
SELECT id, email, name, role FROM "User" WHERE role = 'admin';
EOF
```

## Step 5: Test Login

1. Go to your production site: `https://your-app.vercel.app/admin/login`
2. Login with the credentials you created
3. You should be redirected to `/admin/dashboard`

## Troubleshooting

### Check Vercel Logs

If login fails, check the function logs:
1. Go to Vercel Dashboard → Deployments
2. Click on latest deployment
3. Click "Functions" tab
4. Look for `/api/auth/login` logs

The logs will show:
- "Login attempt for email: ..."
- "User not found: ..." (if no user exists)
- "Invalid password for: ..." (if password is wrong)
- "Login successful for: ..." (if successful)

### Database Connection Issues

If you see database connection errors:

```bash
# Test database connection
npx prisma db execute --stdin <<EOF
SELECT 1;
EOF
```

### Check Environment Variables

Make sure these are set in Vercel:
- `DATABASE_URL` - Postgres connection string
- `JWT_SECRET` - Random secret string (generate with: `openssl rand -base64 32`)
- `NEXT_PUBLIC_SITE_URL` - Your Vercel URL

## Quick Commands Reference

```bash
# Generate password hash
npm run hash-password "YourPassword"

# Push schema to production
npx prisma db push

# Create admin user
npm run db:seed

# Open Prisma Studio
npx prisma studio

# View production logs
vercel logs
```
