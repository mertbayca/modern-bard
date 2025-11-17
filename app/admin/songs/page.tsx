import { requireAuth } from "@/lib/auth";
import { SongsManager } from "@/components/songs-manager";

export const metadata = {
  title: "Audio Library • Admin",
};

export default async function SongsPage() {
  await requireAuth();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-ink dark:text-paper">
          Modern Bard Audio
        </h1>
        <p className="mt-2 text-sm text-ink/60 dark:text-paper/60">
          Upload and manage audio recordings for Modern Bard
        </p>
      </div>

      <SongsManager />
    </div>
  );
}
