import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sql, generateId } from "@/lib/db";

export async function POST(request: NextRequest) {
  const session = await getSession();

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, content, form, themes, published, summary } = body;

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Extract summary
    const computedSummary =
      typeof summary === "string" && summary.trim().length > 0
        ? summary.trim().slice(0, 180)
        : content.split("\n\n")[0].substring(0, 150).trim();

    // Create draft in database
    const id = generateId();
    await sql`
      INSERT INTO drafts (id, title, slug, content, summary, form, themes, published, author_id)
      VALUES (${id}, ${title}, ${slug}, ${content}, ${computedSummary}, ${form}, ${themes}, ${published}, ${session.user.id})
    `;

    // Note: We store content in database. MDX files should be generated locally for git commits.
    // Vercel's filesystem is read-only, so we can't write files in production.

    const drafts = await sql`SELECT * FROM drafts WHERE id = ${id}`;
    return NextResponse.json({ success: true, draft: drafts[0] });
  } catch (error) {
    console.error("Error creating post:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create post";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
