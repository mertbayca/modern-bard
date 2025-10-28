import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Increment view count
    await sql`
      UPDATE drafts
      SET views = views + 1
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to increment view:", error);
    return NextResponse.json(
      { error: "Failed to increment view" },
      { status: 500 }
    );
  }
}
