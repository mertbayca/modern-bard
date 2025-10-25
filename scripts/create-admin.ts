import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Require environment variables - no defaults for security
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "Admin";

  if (!email || !password) {
    console.error("❌ Error: ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required");
    console.error("   Set them before running this script:");
    console.error("   export ADMIN_EMAIL='your-email@example.com'");
    console.error("   export ADMIN_PASSWORD='your-secure-password'");
    process.exit(1);
  }

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    console.log("Admin user already exists:", email);
    return;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: "admin",
    },
  });

  console.log("Admin user created successfully!");
  console.log("Email:", email);
  console.log("Password:", password);
  console.log("\nPlease change the password after first login!");
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
