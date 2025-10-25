import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import { writeFile, unlink, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

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
    const { title, content, form, themes, published } = body;

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

    // Extract summary
    const summary = content.split('\n\n')[0].substring(0, 150).trim();

    // Update draft in database
    await sql`
      UPDATE drafts
      SET title = ${title}, slug = ${slug}, content = ${content}, summary = ${summary},
          form = ${form}, themes = ${themes}, published = ${published}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;

    const drafts = await sql`SELECT * FROM drafts WHERE id = ${id}`;
    const draft = drafts[0];

    const contentDir = join(process.cwd(), "content", "library");
    const filePath = join(contentDir, `${slug}.mdx`);

    // If published, create/update MDX file
    if (published) {
      await mkdir(contentDir, { recursive: true });

      const themesArray = themes.split(",").map((t: string) => `"${t.trim()}"`).join(", ");
      const escapedSummary = summary.replace(/"/g, '\\"');

      const mdxContent = `---
title: "${title}"
summary: "${escapedSummary}"
date: "${new Date(existingDraft.created_at).toISOString()}"
updated: "${new Date().toISOString()}"
form: "${form}"
themes: [${themesArray}]
---

${content}
`;

      await writeFile(filePath, mdxContent, "utf-8");
    } else if (existsSync(filePath)) {
      // If unpublished and file exists, delete it
      await unlink(filePath);
    }

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

    // Delete MDX file if it exists
    const slug = draft.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const filePath = join(process.cwd(), "content", "library", `${slug}.mdx`);

    if (existsSync(filePath)) {
      await unlink(filePath);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
