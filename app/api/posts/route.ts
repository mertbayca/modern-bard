import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

    // Create draft in database
    const draft = await prisma.draft.create({
      data: {
        title,
        slug,
        content,
        form,
        themes,
        published,
        authorId: session.user.id,
      },
    });

    // If published, also create MDX file in content directory
    if (published) {

      const contentDir = join(process.cwd(), "content", "library");
      await mkdir(contentDir, { recursive: true });

      const mdxContent = `---
title: "${title}"
date: "${new Date().toISOString()}"
form: "${form}"
themes: [${themes.split(",").map((t: string) => `"${t.trim()}"`).join(", ")}]
---

${content}
`;

      const filePath = join(contentDir, `${slug}.mdx`);
      await writeFile(filePath, mdxContent, "utf-8");
    }

    return NextResponse.json({ success: true, draft });
  } catch (error) {
    console.error("Error creating post:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create post";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
