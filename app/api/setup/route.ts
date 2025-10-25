import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// This route initializes the database and creates an admin user
// Access it at: https://your-app.vercel.app/api/setup
// For security, it only works if no admin exists yet

export async function GET() {
  try {
    // Check if tables exist by trying to count users
    let userCount = 0;
    try {
      userCount = await prisma.user.count();
    } catch (error) {
      // Tables might not exist, will be created by Prisma
      console.log("Database tables might not exist yet, Prisma will create them");
    }

    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: "admin" },
    });

    if (existingAdmin) {
      return NextResponse.json({
        success: false,
        message: "Admin user already exists. Setup not needed.",
        admin: {
          email: existingAdmin.email,
          name: existingAdmin.name,
        },
      });
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash("admin123456", 10);

    const admin = await prisma.user.create({
      data: {
        email: "admin@modernbard.local",
        password: hashedPassword,
        name: "Admin",
        role: "admin",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Database initialized and admin user created successfully!",
      admin: {
        email: admin.email,
        name: admin.name,
      },
      credentials: {
        email: "admin@modernbard.local",
        password: "admin123456",
        note: "Please change this password after first login!",
      },
    });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to initialize database",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
