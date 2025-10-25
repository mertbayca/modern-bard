import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Initialize production database and create admin user
// Run with: npm run init-production

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Initializing production database...\n");

  try {
    // Test database connection
    console.log("📡 Testing database connection...");
    await prisma.$connect();
    console.log("✅ Connected to database\n");

    // Check if admin exists
    console.log("🔍 Checking for existing admin user...");
    const existingAdmin = await prisma.user.findFirst({
      where: { role: "admin" },
    });

    if (existingAdmin) {
      console.log("⚠️  Admin user already exists:");
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Name: ${existingAdmin.name}`);
      console.log("\n✨ Database is already set up!\n");
      return;
    }

    // Require environment variables - no defaults for security
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const name = process.env.ADMIN_NAME || "Admin";

    if (!email || !password) {
      console.error("\n❌ Error: ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required");
      console.error("   Set them before running this script:");
      console.error("   export ADMIN_EMAIL='your-email@example.com'");
      console.error("   export ADMIN_PASSWORD='your-secure-password'\n");
      process.exit(1);
    }

    // Create admin user
    console.log("👤 Creating admin user...");
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "admin",
      },
    });

    console.log("✅ Admin user created successfully!\n");
    console.log("📝 Login credentials:");
    console.log(`   Email:    ${email}`);
    console.log(`   Password: ${password}`);
    console.log("\n⚠️  IMPORTANT: Change this password after first login!\n");
    console.log("🎉 Setup complete! You can now login to your app.\n");

    // Verify tables exist
    console.log("🔍 Verifying database tables...");
    const userCount = await prisma.user.count();
    const draftCount = await prisma.draft.count();
    const subscriberCount = await prisma.subscriber.count();

    console.log(`   Users: ${userCount}`);
    console.log(`   Drafts: ${draftCount}`);
    console.log(`   Subscribers: ${subscriberCount}`);
    console.log("\n✅ All tables created successfully!\n");

  } catch (error) {
    console.error("\n❌ Error during setup:");
    if (error instanceof Error) {
      console.error(`   ${error.message}\n`);

      if (error.message.includes("connect")) {
        console.error("💡 Tip: Make sure DATABASE_URL is set correctly");
        console.error("   Check your .env.production.local file\n");
      }
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
