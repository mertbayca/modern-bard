import bcrypt from "bcryptjs";

const password = process.argv[2] || "admin123456";

async function generateHash() {
  const hash = await bcrypt.hash(password, 10);
  console.log("\n=== Password Hash Generated ===");
  console.log("Password:", password);
  console.log("Hash:", hash);
  console.log("\nUse this hash in your SQL INSERT statement or create-admin script");
  console.log("================================\n");
}

generateHash();
