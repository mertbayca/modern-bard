# The Modern Bard

A literary blog platform built with Next.js, featuring a built-in CMS, authentication, and beautiful typography.

## Features

- ✨ Modern, clean design with "Modern Bard" theme
- 📝 MDX-based content management
- 🔐 Built-in authentication system
- 🎨 Admin CMS for content management
- 🌓 Dark mode support
- 📱 Fully responsive
- 🚀 SEO optimized with metadata and OpenGraph
- 📡 RSS feed generation
- 🎯 Sitemap generation
- 🔍 Content filtering by form and theme

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4 with custom brand tokens
- **UI Components**: shadcn/ui + Radix UI
- **Fonts**: Inter (UI), Literata (Display), JetBrains Mono (Code)
- **Content**: Contentlayer (MDX)
- **Database**: Prisma + SQLite (can be changed to PostgreSQL)
- **Authentication**: JWT with jose
- **Animation**: Framer Motion

## Brand Colors

- **Ink**: `#0B0B0F` - Primary text
- **Paper**: `#FAFAF7` - Background
- **Sage**: `#4C7F5B` - Primary accent
- **Gold**: `#C0A46B` - Secondary accent
- **Mist**: `#D9DED9` - Borders and subtle backgrounds

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository (if not already done)

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and update the values:
- `DATABASE_URL`: Your database URL (default is SQLite)
- `JWT_SECRET`: A secure random string for JWT tokens
- `NEXT_PUBLIC_SITE_URL`: Your site URL

4. Initialize the database and create an admin user:
```bash
npm run setup
```

This will:
- Create the database schema
- Generate Prisma client
- Create an admin user with:
  - Email: `admin@modernbard.local`
  - Password: `admin123456`

**⚠️ Important**: Change these credentials after first login!

### Development

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

Access the admin panel at [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

## Project Structure

```
modern-bard/
├── app/
│   ├── (site)/              # Public site routes
│   │   ├── library/         # Blog posts
│   │   ├── projects/        # Projects page
│   │   ├── about/           # About page
│   │   ├── contact/         # Contact page
│   │   └── subscribe/       # Subscribe page
│   ├── admin/               # Admin CMS routes
│   │   ├── login/           # Admin login
│   │   └── dashboard/       # Admin dashboard
│   └── api/                 # API routes
│       ├── auth/            # Authentication
│       └── rss/             # RSS feed
├── components/              # React components
│   └── ui/                  # shadcn/ui components
├── content/                 # MDX content
│   ├── library/             # Blog posts
│   └── projects/            # Project content
├── lib/                     # Utilities
│   ├── auth.ts              # Authentication helpers
│   ├── prisma.ts            # Prisma client
│   └── utils.ts             # Utility functions
├── prisma/                  # Database schema
├── public/                  # Static assets
└── scripts/                 # Utility scripts
```

## Content Management

### Writing Posts

Create MDX files in `content/library/` with frontmatter:

```mdx
---
title: "Your Post Title"
summary: "A brief summary of your post"
date: "2025-01-15"
published: true
form: "essay"  # essay, poem, or note
themes: ["craft", "tech"]  # craft, psyche, tech, culture
---

Your content here...
```

### MDX Components

Available custom components:
- `<Stanza>` - For poetry stanzas
- `<PullQuote>` - For pull quotes
- `<Figure>` - For images with captions

### Using the CMS

1. Login at `/admin/login`
2. Access the dashboard at `/admin/dashboard`
3. View statistics and manage content

## Database Management

```bash
# View database with Prisma Studio
npm run db:studio

# Push schema changes
npm run db:push

# Generate Prisma client
npm run db:generate

# Create a new admin user
npm run db:seed
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

For production, consider using PostgreSQL instead of SQLite:

```env
DATABASE_URL="postgresql://user:password@host:5432/database"
```

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Render
- DigitalOcean

## Customization

### Changing Colors

Edit `tailwind.config.ts` to customize the brand colors.

### Changing Fonts

Edit `app/layout.tsx` to change the Google Fonts imports.

### Adding More Content Types

1. Update `contentlayer.config.ts`
2. Create new MDX files in `content/`
3. Add corresponding pages in `app/(site)/`

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run setup` - Initialize database and admin user
- `npm run db:studio` - Open Prisma Studio
- `npm run db:push` - Push schema to database
- `npm run db:generate` - Generate Prisma client
- `npm run db:seed` - Create admin user

## License

MIT

## Credits

Built with love for The Modern Bard.
