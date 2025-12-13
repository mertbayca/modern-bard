import { sql } from "../lib/db";

async function listPosts() {
  try {
    const posts = await sql`
      SELECT id, title, slug FROM drafts ORDER BY created_at DESC
    `;

    console.log(`Found ${posts.length} posts:\n`);
    posts.forEach((post, idx) => {
      console.log(`${idx + 1}. "${post.title}"`);
      console.log(`   ID: ${post.id}, Slug: ${post.slug}\n`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

listPosts();
