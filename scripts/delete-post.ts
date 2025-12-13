import { sql } from "../lib/db";

async function deletePost() {
  try {
    console.log("Searching for 'It Rarely Depends, If Ever' article...");

    const posts = await sql`
      SELECT id, title, slug FROM drafts
      WHERE title ILIKE '%rarely depends%'
    `;

    if (posts.length === 0) {
      console.log("❌ Post not found");
      process.exit(1);
    }

    const post = posts[0];
    console.log(`Found: "${post.title}" (ID: ${post.id}, Slug: ${post.slug})`);
    console.log("Deleting...");

    await sql`
      DELETE FROM drafts WHERE id = ${post.id}
    `;

    console.log(`✓ Successfully deleted "${post.title}"`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

deletePost();
