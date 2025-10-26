# Vercel Deployment Setup

## Environment Variables

To deploy this application on Vercel, you need to set the following environment variables in your Vercel project settings:

### Required Environment Variables

1. **DATABASE_URL**
   - Your Neon PostgreSQL connection string
   - Format: `postgresql://user:password@host/database?sslmode=require`
   - Example: `postgresql://neondb_owner:npg_BGaju7PyTI3Z@ep-blue-river-a4twxwg2-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require`

2. **JWT_SECRET**
   - A secure random string for JWT token signing
   - Recommended: Use a long random string (at least 32 characters)
   - Example: Generate one with: `openssl rand -base64 32`

3. **NEXT_PUBLIC_SITE_URL**
   - Your production site URL
   - Example: `https://modern-bard.vercel.app`

### How to Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Click on **Settings**
3. Click on **Environment Variables** in the left sidebar
4. Add each variable with the following settings:
   - **Key**: Variable name (e.g., `DATABASE_URL`)
   - **Value**: Variable value (e.g., your Neon connection string)
   - **Environment**: Select all environments (Production, Preview, Development)
5. Click **Save**

### After Adding Variables

After adding or updating environment variables:
1. Redeploy your application
2. Or trigger a new deployment by pushing a commit

### Security Notes

- Never commit `.env.local` or `.env.production.local` files to git
- Keep your DATABASE_URL and JWT_SECRET secure
- Rotate your JWT_SECRET periodically for better security
- Use different DATABASE_URL for production and development if possible

### Database Setup

Make sure your Neon database has the required tables. Run the schema from `db/schema.sql` if you haven't already:

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Drafts/Posts table
CREATE TABLE IF NOT EXISTS drafts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  form TEXT NOT NULL DEFAULT 'essay',
  themes TEXT NOT NULL,
  published BOOLEAN DEFAULT FALSE,
  author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subscribers table
CREATE TABLE IF NOT EXISTS subscribers (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Troubleshooting

**Issue**: Posts not appearing on Library page
- **Solution**: Verify DATABASE_URL is set correctly in Vercel environment variables

**Issue**: "Database connection string format error"
- **Solution**: Ensure DATABASE_URL uses PostgreSQL format, not SQLite (`file:./dev.db`)

**Issue**: Authentication not working
- **Solution**: Verify JWT_SECRET is set and consistent across deployments
