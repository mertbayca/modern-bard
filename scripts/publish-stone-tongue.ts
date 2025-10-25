import { PrismaClient } from "@prisma/client";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

const prisma = new PrismaClient();

async function main() {
  // Get admin user
  const admin = await prisma.user.findUnique({
    where: { email: "admin@modernbard.local" },
  });

  if (!admin) {
    throw new Error("Admin user not found");
  }

  const title = "Stone Tongue";
  const slug = "stone-tongue";
  const form = "poem";
  const themes = "craft, psyche";

  const content = `My words are carved in the bazaar dust
While I'm counting cracks in ancient walls
Their mouths move like hungry dogs
Chew the rumors, spit the bones
And I'm thinking,
I could be a shadow on the steppe by now
Every footprint I ever made, the wind erasing

Come with me,
While my smell still lingers
The cologne I wore this morning
Before it disappears
When the rain starts pouring

Let them speak to empty chairs
Write my epitaph in smoke
I'll be the echo that never answers back
Stone tongue, a sealed door
I'm learning how to be a ghost
Before I'm gone

I bit my tongue till it turned to stone,
Because I loved them enough not to scream
They build their stories like clay houses
Each one claiming they knew me best
But I'm already ash in someone else's fire
Already a myth, already misremembered
The mountains don't explain themselves
They don't bend to storms or prayers

I tried to speak, but my words dried to crust
Said ore than enough, they were plenty
But every truth I gave them rusted
In their mouths of iron and envy

And if I'm gone
No forwarding address
No last words worth heed
No more claims to fame
Just the space where I used to stand
Growing wild with weeds
Even the minaret forgot how to call my name

Their voices turn to static in the valley
My silence is the only truth they want to bear
They say my shadow walks at dawn
Drinking light it cannot keep
The shepherd swears he's seen me once
Whispering to the sheep
Stone tongue, a sealed door
Already a ghost
Already gone`;

  // Create draft in database
  const draft = await prisma.draft.create({
    data: {
      title,
      slug,
      content,
      form,
      themes,
      published: true,
      authorId: admin.id,
    },
  });

  console.log("Draft created:", draft.id);

  // Create MDX file
  const contentDir = join(process.cwd(), "content", "library");
  await mkdir(contentDir, { recursive: true });

  const mdxContent = `---
title: "${title}"
date: "${new Date().toISOString()}"
form: "${form}"
themes: [${themes.split(",").map((t) => `"${t.trim()}"`).join(", ")}]
---

${content}
`;

  const filePath = join(contentDir, `${slug}.mdx`);
  await writeFile(filePath, mdxContent, "utf-8");

  console.log("MDX file created:", filePath);
  console.log("\nPoem 'Stone Tongue' published successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
