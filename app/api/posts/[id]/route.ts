import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sql, stripHtml } from "@/lib/db";

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
    const { title, content, form, themes, published, summary, song_id } = body;

    // Get existing draft
    const existingDrafts = await sql`
      SELECT * FROM drafts WHERE id = ${id}
    `;

    if (existingDrafts.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const existingDraft = existingDrafts[0];

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Extract summary (strip HTML tags)
    const resolvedSummary =
      typeof summary === "string" && summary.trim().length > 0
        ? stripHtml(summary).slice(0, 180)
        : stripHtml(content.split("\n\n")[0]).substring(0, 150);

    // Update draft in database
    await sql`
      UPDATE drafts
      SET title = ${title}, slug = ${slug}, content = ${content}, summary = ${resolvedSummary},
          form = ${form}, themes = ${themes}, published = ${published},
          song_id = ${song_id || null}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;

    const drafts = await sql`SELECT * FROM drafts WHERE id = ${id}`;
    const draft = drafts[0];

    // Note: Content is stored in database only.
    // MDX files should be generated/managed locally and committed to git.

    return NextResponse.json({ success: true, draft });
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

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

    const drafts = await sql`
      SELECT * FROM drafts WHERE id = ${id}
    `;

    if (drafts.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const draft = drafts[0];

    // Delete from database
    await sql`
      DELETE FROM drafts WHERE id = ${id}
    `;

    // Note: MDX files are managed separately in git

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
