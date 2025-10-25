import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

// Temporary endpoint to test database connection
// Delete this after debugging
export async function GET() {
  try {
    // Count users
    const userCountResult = await sql`SELECT COUNT(*) as count FROM users`;
    const userCount = Number(userCountResult[0].count);

    // Get admin user (without password)
    const admins = await sql`
      SELECT id, email, name, role, created_at
      FROM users
      WHERE role = 'admin'
      LIMIT 1
    `;

    const admin = admins.length > 0 ? admins[0] : null;

    return NextResponse.json({
      success: true,
      database: "connected",
      userCount,
      adminExists: !!admin,
      admin,
    });
  } catch (error) {
    console.error("Database test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : null,
      },
      { status: 500 }
    );
  }
}
