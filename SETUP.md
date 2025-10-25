# Quick Setup Guide

This guide will help you get The Modern Bard up and running in minutes.

## Prerequisites

- Node.js 18 or higher
- npm (comes with Node.js)

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Initialize the Database

```bash
# Set up database and create admin user
DATABASE_URL="file:./dev.db" npm run db:push
DATABASE_URL="file:./dev.db" npx prisma generate
DATABASE_URL="file:./dev.db" npx tsx scripts/create-admin.ts
```

Or use the setup script (if environment variables are configured):

```bash
npm run setup
```

### 3. Build Content

```bash
npx contentlayer2 build
```

### 4. Start Development Server

```bash
npm run dev
```

The site will be available at [http://localhost:3000](http://localhost:3000)

## Default Admin Credentials

- **Email**: `admin@modernbard.local`
- **Password**: `admin123456`

**⚠️ IMPORTANT**: Change these credentials immediately after first login!

## Access Points

- **Public Site**: http://localhost:3000
- **Library**: http://localhost:3000/library
- **Admin Login**: http://localhost:3000/admin/login
- **Admin Dashboard**: http://localhost:3000/admin/dashboard
- **RSS Feed**: http://localhost:3000/api/rss

## Next Steps

1. **Login to Admin Panel**
   - Go to http://localhost:3000/admin/login
   - Use the default credentials above
   - Explore the dashboard

2. **Add Content**
   - Create new `.mdx` files in `content/library/`
   - Use the sample posts as templates
   - See `content/library/welcome-to-modern-bard.mdx` for frontmatter format

3. **Customize**
   - Edit brand colors in `tailwind.config.ts`
   - Update fonts in `app/layout.tsx`
   - Modify content in `app/(site)/about/page.tsx`

4. **Configure Environment**
   - Copy `.env.example` to `.env.local`
   - Update `JWT_SECRET` with a secure random string
   - Set `NEXT_PUBLIC_SITE_URL` for production

## Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run db:studio       # Open Prisma Studio
npm run db:push         # Push schema changes
npm run db:generate     # Generate Prisma client
npm run db:seed         # Create admin user

# Content
npx contentlayer2 build # Build MDX content
```

## Troubleshooting

### Database Connection Issues

If you see "Environment variable not found: DATABASE_URL", run commands with the env var:

```bash
DATABASE_URL="file:./dev.db" npx prisma db push
```

### Contentlayer Warning

The warning about `baseUrl` has been fixed in `tsconfig.json`. Rebuild content:

```bash
npx contentlayer2 build
```

### Port Already in Use

If port 3000 is taken, start on a different port:

```bash
npm run dev -- -p 3001
```

## Production Deployment

For production, use PostgreSQL instead of SQLite:

1. Update `DATABASE_URL` in your environment:
   ```
   DATABASE_URL="postgresql://user:password@host:5432/database"
   ```

2. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. Generate a secure JWT secret:
   ```bash
   openssl rand -base64 32
   ```

4. Deploy to Vercel, Netlify, or your preferred platform

## Need Help?

Check the main [README.md](./README.md) for full documentation.
