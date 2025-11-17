import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sql, generateId } from "@/lib/db";

// GET - List all songs
export async function GET(request: NextRequest) {
  const session = await getSession();

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const songs = await sql`
      SELECT * FROM songs
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ songs });
  } catch (error) {
    console.error("Error fetching songs:", error);
    return NextResponse.json(
      { error: "Failed to fetch songs" },
      { status: 500 }
    );
  }
}

// POST - Create new song
export async function POST(request: NextRequest) {
  const session = await getSession();

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, file_url, duration, file_size, cover_image_url, artist, album, genre, description } = body;

    if (!title || !file_url) {
      return NextResponse.json(
        { error: "Title and file URL are required" },
        { status: 400 }
      );
    }

    const id = generateId();
    await sql`
      INSERT INTO songs (id, title, file_url, duration, file_size, cover_image_url, artist, album, genre, description, author_id)
      VALUES (${id}, ${title}, ${file_url}, ${duration || null}, ${file_size || null}, ${cover_image_url || null}, ${artist || null}, ${album || null}, ${genre || null}, ${description || null}, ${session.user.id})
    `;

    const songs = await sql`SELECT * FROM songs WHERE id = ${id}`;
    return NextResponse.json({ success: true, song: songs[0] });
  } catch (error) {
    console.error("Error creating song:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create song";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
