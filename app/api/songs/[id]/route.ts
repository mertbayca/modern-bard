import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";

// DELETE - Delete a song
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const songs = await sql`
      SELECT * FROM songs WHERE id = ${id}
    `;

    if (songs.length === 0) {
      return NextResponse.json({ error: "Song not found" }, { status: 404 });
    }

    // Delete from database
    await sql`
      DELETE FROM songs WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting song:", error);
    return NextResponse.json(
      { error: "Failed to delete song" },
      { status: 500 }
    );
  }
}

// PATCH - Update a song
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { title, cover_image_url, artist, album, genre, description } = body;

    const songs = await sql`
      SELECT * FROM songs WHERE id = ${id}
    `;

    if (songs.length === 0) {
      return NextResponse.json({ error: "Song not found" }, { status: 404 });
    }

    await sql`
      UPDATE songs
      SET title = ${title},
          cover_image_url = ${cover_image_url || null},
          artist = ${artist || null},
          album = ${album || null},
          genre = ${genre || null},
          description = ${description || null},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;

    const updatedSongs = await sql`SELECT * FROM songs WHERE id = ${id}`;
    return NextResponse.json({ success: true, song: updatedSongs[0] });
  } catch (error) {
    console.error("Error updating song:", error);
    return NextResponse.json(
      { error: "Failed to update song" },
      { status: 500 }
    );
  }
}
