import { sql, stripHtml } from "../lib/db";

async function cleanSummaries() {
  try {
    console.log("Cleaning HTML tags from post summaries...");

    // Get all drafts with their current summaries
    const drafts = await sql`
      SELECT id, summary FROM drafts
    `;

    console.log(`Found ${drafts.length} posts to process`);

    let updated = 0;
    for (const draft of drafts) {
      const cleanSummary = stripHtml(draft.summary);

      // Only update if the summary changed
      if (cleanSummary !== draft.summary) {
        await sql`
          UPDATE drafts
          SET summary = ${cleanSummary}
          WHERE id = ${draft.id}
        `;
        updated++;
        console.log(`✓ Cleaned summary for post ID: ${draft.id}`);
      }
    }

    console.log(`\n✓ Successfully cleaned ${updated} summaries`);
    console.log(`✓ ${drafts.length - updated} summaries were already clean`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

cleanSummaries();
