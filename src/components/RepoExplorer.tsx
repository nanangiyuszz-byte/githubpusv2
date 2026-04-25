import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Lock, Globe, FolderGit2, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { listRepos, GitHubError, type Repo } from "@/lib/github";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";

interface Props {
  selectedRepo: Repo | null;
  onSelect: (repo: Repo) => void;
  enabled: boolean;
}

export function RepoExplorer({ selectedRepo, onSelect, enabled }: Props) {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listRepos();
      setRepos(data);
    } catch (e) {
      setError(e instanceof GitHubError ? e.message : "Gagal memuat repositori.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (enabled) void load();
    else setRepos([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return repos;
    return repos.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.full_name.toLowerCase().includes(q) ||
        (r.description?.toLowerCase().includes(q) ?? false),
    );
  }, [repos, query]);

  return (
    <div className="glass flex h-full flex-col rounded-2xl shadow-elegant overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 p-4">
        <div className="flex items-center gap-2">
          <FolderGit2 className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold tracking-tight">Pilih Repositori</h2>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={load}
          disabled={!enabled || loading}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          title="Muat ulang"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="border-b border-white/10 p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari repositori..."
            disabled={!enabled}
            className="h-9 pl-9 text-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {!enabled && (
          <EmptyState message="Hubungkan akun GitHub untuk melihat repositori." />
        )}
        {enabled && loading && (
          <div className="flex h-32 flex-col items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <p className="text-xs">Memuat repositori...</p>
          </div>
        )}
        {enabled && error && (
          <div className="m-2 flex items-start gap-2 rounded-lg border border-[oklch(0.7_0.27_25_/_0.4)] bg-[oklch(0.7_0.27_25_/_0.1)] p-3 text-xs text-[oklch(0.85_0.2_25)]">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {enabled && !loading && !error && filtered.length === 0 && (
          <EmptyState message={query ? "Tidak ada repositori yang cocok." : "Belum ada repositori."} />
        )}
        <ul className="space-y-1">
          <AnimatePresence initial={false}>
            {filtered.map((repo) => {
              const active = selectedRepo?.id === repo.id;
              return (
                <motion.li
                  key={repo.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <button
                    type="button"
                    onClick={() => onSelect(repo)}
                    className={`group flex w-full flex-col gap-1 rounded-lg border px-3 py-2.5 text-left transition-all ${
                      active
                        ? "border-primary/50 bg-primary/10 neon-border-cyan"
                        : "border-transparent hover:border-white/10 hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {repo.private ? (
                        <Lock className="h-3.5 w-3.5 flex-shrink-0 text-accent" />
                      ) : (
                        <Globe className="h-3.5 w-3.5 flex-shrink-0 text-[oklch(0.85_0.18_145)]" />
                      )}
                      <span className="truncate text-sm font-medium">{repo.name}</span>
                      <span
                        className={`ml-auto rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                          repo.private
                            ? "bg-accent/15 text-accent"
                            : "bg-[oklch(0.85_0.18_145_/_0.15)] text-[oklch(0.85_0.18_145)]"
                        }`}
                      >
                        {repo.private ? "Private" : "Public"}
                      </span>
                    </div>
                    {repo.description && (
                      <p className="truncate text-xs text-muted-foreground">{repo.description}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground/70">
                      Diupdate{" "}
                      {formatDistanceToNow(new Date(repo.updated_at), {
                        addSuffix: true,
                        locale: idLocale,
                      })}
                    </p>
                  </button>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-32 items-center justify-center px-4 text-center text-xs text-muted-foreground">
      {message}
    </div>
  );
}
