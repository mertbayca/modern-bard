import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Temporary endpoint to test database connection
// Delete this after debugging
export async function GET() {
  try {
    // Test database connection
    await prisma.$connect();

    // Count users
    const userCount = await prisma.user.count();

    // Get admin user (without password)
    const admin = await prisma.user.findFirst({
      where: { role: "admin" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      database: "connected",
      userCount,
      adminExists: !!admin,
      admin: admin || null,
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
