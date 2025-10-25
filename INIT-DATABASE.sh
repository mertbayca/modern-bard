#!/bin/bash

# Database Initialization Script for Modern Bard
# This script initializes your production database on Neon via Vercel

echo "🚀 Modern Bard - Production Database Setup"
echo "=========================================="
echo ""

# Step 1: Pull environment variables
echo "📡 Step 1: Pulling production environment variables from Vercel..."
vercel env pull .env.production.local

if [ $? -ne 0 ]; then
    echo "❌ Failed to pull environment variables. Make sure you're logged in to Vercel."
    echo "   Run: vercel login"
    exit 1
fi

echo "✅ Environment variables loaded"
echo ""

# Step 2: Push database schema
echo "🗄️  Step 2: Creating database tables in Neon..."
npx prisma db push

if [ $? -ne 0 ]; then
    echo "❌ Failed to create database tables."
    exit 1
fi

echo "✅ Database schema created"
echo ""

# Step 3: Create admin user
echo "👤 Step 3: Creating admin user..."
npm run init-production

if [ $? -ne 0 ]; then
    echo "❌ Failed to create admin user."
    exit 1
fi

echo ""
echo "🎉 Setup complete!"
echo "You can now login to your app at: https://YOUR-APP.vercel.app/admin/login"
echo ""
