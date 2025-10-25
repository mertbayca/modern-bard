# Deploying The Modern Bard to Vercel

## Prerequisites

1. A [Vercel](https://vercel.com) account
2. A GitHub repository with your code
3. A PostgreSQL database (Vercel Postgres recommended)

## Step-by-Step Deployment

### 1. Push Your Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/modern-bard.git
git push -u origin main
```

### 2. Create a Vercel Postgres Database

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on "Storage" tab
3. Click "Create Database"
4. Select "Postgres"
5. Choose a name (e.g., "modern-bard-db")
6. Select your preferred region
7. Click "Create"

### 3. Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure your project:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: .next
   - **Install Command**: `npm install`

### 4. Configure Environment Variables

In the Vercel project settings, add these environment variables:

#### From Vercel Postgres (Auto-configured if you connected the database)
- `DATABASE_URL` - Your PostgreSQL connection string

#### Required Variables
- `NEXT_PUBLIC_SITE_URL` - Your production URL (e.g., `https://modern-bard.vercel.app`)
- `JWT_SECRET` - A secure random string (generate with: `openssl rand -base64 32`)

#### Optional Admin Setup Variables
- `ADMIN_EMAIL` - Admin email (default: `admin@modernbard.local`)
- `ADMIN_PASSWORD` - Admin password (default: `admin123456`)
- `ADMIN_NAME` - Admin name (default: `Admin`)

### 5. Connect Database to Project

1. In your Vercel project settings, go to "Storage"
2. Click "Connect Store"
3. Select your Postgres database
4. This will automatically add the `DATABASE_URL` environment variable

### 6. Deploy and Initialize Database

1. Click "Deploy" to trigger your first deployment
2. Once deployed, go to the Vercel project dashboard
3. Navigate to the "Settings" tab → "Functions"
4. You may need to run database migrations manually

### 7. Initialize the Database (One-time setup)

You have two options:

#### Option A: Using Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Run database migration
vercel env pull .env.production
npx prisma db push

# Create admin user
npm run db:seed
```

#### Option B: Using Prisma Studio via Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Link project: `vercel link`
4. Pull environment variables: `vercel env pull`
5. Run Prisma Studio locally connected to production: `npx prisma studio`
6. Manually create an admin user in the User table with:
   - email: your-email@domain.com
   - password: (hash with bcrypt)
   - role: "admin"

### 8. Create Your First Admin User

After deployment, you can create an admin user by:

1. Using the provided script (if you have the environment variables set):
   ```bash
   npm run db:seed
   ```

2. Or manually via Prisma Studio

### 9. Access Your Site

- **Public Site**: `https://your-project.vercel.app`
- **Admin Login**: `https://your-project.vercel.app/admin/login`
- **Admin Dashboard**: `https://your-project.vercel.app/admin/dashboard`

## Post-Deployment

### Change Default Admin Password

1. Login with your default credentials
2. Create a new admin user with a secure password
3. Delete or update the default admin account

### Update Environment Variables

You can update environment variables in:
- Vercel Dashboard → Project Settings → Environment Variables

Changes to environment variables require a redeploy to take effect.

## Troubleshooting

### Build Fails

- Check build logs in Vercel dashboard
- Ensure all environment variables are set
- Verify Prisma schema is compatible with PostgreSQL

### Database Connection Issues

- Verify `DATABASE_URL` is correctly set
- Check if database is in the same region as your Vercel deployment
- Ensure connection string includes `?sslmode=require`

### Prisma Issues

- Make sure `postinstall` script runs: `"postinstall": "prisma generate"`
- Verify database schema is pushed: `npx prisma db push`

### Content Not Showing

- Check that MDX files are in `content/library/` directory
- Verify Contentlayer is building correctly
- Check build logs for any Contentlayer errors

## Continuous Deployment

Every push to your `main` branch will automatically trigger a new deployment on Vercel.

For preview deployments, create a pull request and Vercel will create a preview URL.

## Custom Domain

1. Go to Vercel Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXT_PUBLIC_SITE_URL` environment variable to your custom domain

## Database Backups

Vercel Postgres includes automatic backups. You can also:
- Export data via Prisma Studio
- Set up custom backup scripts
- Use Vercel's backup features in the Storage settings
