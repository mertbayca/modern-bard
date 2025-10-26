import { sql, generateId } from "../lib/db";
import bcrypt from "bcryptjs";

async function main() {
  console.log("👤 Creating admin user...\n");

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "Admin";

  if (!email || !password) {
    console.error("❌ Error: ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required");
    console.error("   Set them before running this script:");
    console.error("   export ADMIN_EMAIL='your-email@example.com'");
    console.error("   export ADMIN_PASSWORD='your-secure-password'\n");
    process.exit(1);
  }

  try {
    // Check if admin exists
    const existing = await sql`
      SELECT id, email, name FROM users WHERE role = 'admin' LIMIT 1
    `;

    if (existing.length > 0) {
      console.log("⚠️  Admin user already exists:");
      console.log(`   Email: ${existing[0].email}`);
      console.log(`   Name: ${existing[0].name}\n");
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = generateId();
    const role = 'admin';

    await sql`INSERT INTO users (id, email, password, name, role) VALUES (${id}, ${email}, ${hashedPassword}, ${name}, ${role})`;

    console.log("✅ Admin user created successfully!\n");
    console.log("📝 Login credentials:");
    console.log(`   Email:    ${email}`);
    console.log(`   Password: ${password}`);
    console.log("\n⚠️  IMPORTANT: Change this password after first login!\n");
  } catch (error) {
    console.error("❌ Error creating admin user:");
    console.error(error);
    process.exit(1);
  }
}

main();
