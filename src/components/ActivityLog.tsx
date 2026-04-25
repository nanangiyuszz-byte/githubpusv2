import { useEffect, useState } from "react";
import { History, Trash2, CheckCircle2, XCircle, FolderGit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { readLog, clearLog, type ActivityEntry } from "@/lib/activity-log";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

interface Props {
  compact?: boolean;
  limit?: number;
}

export function ActivityLog({ compact = false, limit }: Props) {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);

  useEffect(() => {
    const sync = () => setEntries(readLog());
    sync();
    window.addEventListener("gitpush:activity", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("gitpush:activity", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const items = limit ? entries.slice(0, limit) : entries;

  return (
    <div className="glass rounded-2xl shadow-elegant overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 p-4">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold tracking-tight">Riwayat Aktivitas</h2>
          <span className="text-xs text-muted-foreground">({entries.length})</span>
        </div>
        {entries.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm("Hapus semua riwayat?")) clearLog();
            }}
            className="h-7 text-xs text-muted-foreground hover:text-[oklch(0.7_0.27_25)]"
          >
            <Trash2 className="mr-1 h-3.5 w-3.5" /> Hapus
          </Button>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="p-10 text-center text-sm text-muted-foreground">
          <FolderGit2 className="mx-auto mb-2 h-8 w-8 opacity-40" />
          Belum ada aktivitas push. Riwayat akan muncul di sini setelah kamu push file.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.03] text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 font-medium">Waktu</th>
                <th className="px-4 py-2.5 font-medium">Repositori</th>
                {!compact && <th className="px-4 py-2.5 font-medium">Path</th>}
                <th className="px-4 py-2.5 font-medium">Pesan Commit</th>
                <th className="px-4 py-2.5 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {items.map((e) => (
                <tr key={e.id} className="transition-colors hover:bg-white/[0.02]">
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                    {format(new Date(e.timestamp), "dd MMM yyyy HH:mm", { locale: idLocale })}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    <span className="text-foreground">{e.repo}</span>
                    <span className="ml-1 text-muted-foreground">@{e.branch}</span>
                  </td>
                  {!compact && (
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {e.path}
                    </td>
                  )}
                  <td className="px-4 py-3 text-xs">
                    <p className="line-clamp-1 max-w-xs">{e.message}</p>
                    <p className="text-[10px] text-muted-foreground">{e.filesCount} file</p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {e.status === "Sukses" ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-[oklch(0.85_0.18_145_/_0.15)] px-2 py-1 text-[10px] font-semibold text-[oklch(0.85_0.18_145)]">
                        <CheckCircle2 className="h-3 w-3" /> Sukses
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md bg-[oklch(0.7_0.27_25_/_0.15)] px-2 py-1 text-[10px] font-semibold text-[oklch(0.85_0.2_25)]" title={e.detail ?? ""}>
                        <XCircle className="h-3 w-3" /> Gagal
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
