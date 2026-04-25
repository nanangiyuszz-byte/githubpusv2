import { createFileRoute } from "@tanstack/react-router";
import { ActivityLog } from "@/components/ActivityLog";
import { History } from "lucide-react";

export const Route = createFileRoute("/logs")({
  head: () => ({
    meta: [
      { title: "Riwayat Aktivitas — GitPush Web" },
      { name: "description", content: "Lihat semua riwayat push file kamu ke GitHub via GitPush Web." },
      { property: "og:title", content: "Riwayat Aktivitas — GitPush Web" },
      { property: "og:description", content: "Riwayat lengkap push file ke repositori GitHub." },
    ],
  }),
  component: LogsPage,
});

function LogsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-muted-foreground">
          <History className="h-3.5 w-3.5 text-primary" />
          Tersimpan di browser kamu
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          <span className="text-gradient">Riwayat</span> Aktivitas
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Semua aktivitas push tersimpan di <code>localStorage</code> browser kamu.
          Data ini tidak dikirim ke server manapun.
        </p>
      </header>
      <ActivityLog />
    </div>
  );
}
