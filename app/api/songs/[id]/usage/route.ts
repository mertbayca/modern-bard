import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";

// GET - Get posts using this song
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const posts = await sql`
      SELECT id, title, slug, published
      FROM drafts
      WHERE song_id = ${id}
      ORDER BY published DESC, updated_at DESC
    `;

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Error fetching song usage:", error);
    return NextResponse.json(
      { error: "Failed to fetch song usage" },
      { status: 500 }
    );
  }
}
