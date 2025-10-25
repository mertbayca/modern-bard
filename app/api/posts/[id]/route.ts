import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
    const existingDraft = await prisma.draft.findUnique({
      where: { id },
    });

    if (!existingDraft) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Update draft in database
    const draft = await prisma.draft.update({
      where: { id },
      data: {
        title,
        slug,
        content,
        form,
        themes,
        published,
      },
    });

    const contentDir = join(process.cwd(), "content", "library");
    const filePath = join(contentDir, `${slug}.mdx`);

    // If published, create/update MDX file
    if (published) {
      await mkdir(contentDir, { recursive: true });

      // Extract first paragraph or first 150 chars as summary
      const summary = content.split('\n\n')[0].substring(0, 150).trim();

      const mdxContent = `---
title: "${title}"
summary: "${summary.replace(/"/g, '\\"')}"
date: "${existingDraft.createdAt.toISOString()}"
updated: "${new Date().toISOString()}"
form: "${form}"
themes: [${themes.split(",").map((t: string) => `"${t.trim()}"`).join(", ")}]
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

    const draft = await prisma.draft.findUnique({
      where: { id },
    });

    if (!draft) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Delete from database
    await prisma.draft.delete({
      where: { id },
    });

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
