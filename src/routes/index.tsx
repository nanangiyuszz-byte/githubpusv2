import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ConnectionPanel } from "@/components/ConnectionPanel";
import { RepoExplorer } from "@/components/RepoExplorer";
import { UploadArea } from "@/components/UploadArea";
import { ActivityLog } from "@/components/ActivityLog";
import { useGithubAuth } from "@/hooks/use-github-auth";
import type { Repo } from "@/lib/github";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const auth = useGithubAuth();
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
  const authed = auth.status === "authed";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <ConnectionPanel
        user={auth.user}
        status={auth.status}
        error={auth.error}
        onLogin={auth.login}
        onLogout={() => {
          auth.logout();
          setSelectedRepo(null);
        }}
      />

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:h-[calc(100vh-7rem)]">
          <RepoExplorer
            selectedRepo={selectedRepo}
            onSelect={setSelectedRepo}
            enabled={authed}
          />
        </aside>

        <section className="space-y-6">
          <UploadArea repo={selectedRepo} authed={authed} />
          <ActivityLog compact limit={5} />
        </section>
      </div>
    </div>
  );
}
