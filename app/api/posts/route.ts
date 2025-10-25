import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sql, generateId } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
  const session = await getSession();

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, content, form, themes, published } = body;

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Extract summary
    const summary = content.split('\n\n')[0].substring(0, 150).trim();

    // Create draft in database
    const id = generateId();
    await sql`
      INSERT INTO drafts (id, title, slug, content, summary, form, themes, published, author_id)
      VALUES (${id}, ${title}, ${slug}, ${content}, ${summary}, ${form}, ${themes}, ${published}, ${session.user.id})
    `;

    // If published, also create MDX file in content directory
    if (published) {
      const contentDir = join(process.cwd(), "content", "library");
      await mkdir(contentDir, { recursive: true });

      const themesArray = themes.split(",").map((t: string) => `"${t.trim()}"`).join(", ");
      const escapedSummary = summary.replace(/"/g, '\\"');

      const mdxContent = `---
title: "${title}"
summary: "${escapedSummary}"
date: "${new Date().toISOString()}"
form: "${form}"
themes: [${themesArray}]
---

${content}
`;

      const filePath = join(contentDir, `${slug}.mdx`);
      await writeFile(filePath, mdxContent, "utf-8");
    }

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
