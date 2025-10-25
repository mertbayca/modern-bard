#!/bin/bash

echo "🎭 Setting up The Modern Bard..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✓ Node.js found: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✓ npm found: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo "✓ Dependencies installed"
echo ""

# Set up environment variables
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cp .env.example .env.local
    echo "✓ .env.local created"
else
    echo "✓ .env.local already exists"
fi
echo ""

# Initialize database
echo "🗄️  Initializing database..."
DATABASE_URL="file:./dev.db" npx prisma db push --skip-generate
if [ $? -ne 0 ]; then
    echo "❌ Failed to initialize database"
    exit 1
fi
echo "✓ Database initialized"
echo ""

# Generate Prisma client
echo "⚙️  Generating Prisma client..."
DATABASE_URL="file:./dev.db" npx prisma generate
if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma client"
    exit 1
fi
echo "✓ Prisma client generated"
echo ""

# Create admin user
echo "👤 Creating admin user..."
DATABASE_URL="file:./dev.db" npx tsx scripts/create-admin.ts
if [ $? -ne 0 ]; then
    echo "❌ Failed to create admin user"
    exit 1
fi
echo ""

# Build content
echo "📚 Building content..."
npx contentlayer2 build
if [ $? -ne 0 ]; then
    echo "❌ Failed to build content"
    exit 1
fi
echo "✓ Content built"
echo ""

echo "✅ Setup complete!"
echo ""
echo "🚀 To start the development server, run:"
echo "   npm run dev"
echo ""
echo "📍 Then visit:"
echo "   • Public site: http://localhost:3000"
echo "   • Admin panel: http://localhost:3000/admin/login"
echo ""
echo "🔐 Admin credentials:"
echo "   Email: admin@modernbard.local"
echo "   Password: admin123456"
echo ""
echo "⚠️  Remember to change these credentials after first login!"
echo ""
