import { createFileRoute } from "@tanstack/react-router";
import {
  BookOpen, Smartphone, Settings2, MousePointerClick, FileArchive,
  ShieldCheck, MessageCircle, KeyRound, GitBranch, Rocket, ExternalLink,
} from "lucide-react";

export const Route = createFileRoute("/panduan")({
  head: () => ({
    meta: [
      { title: "Panduan Lengkap — GitPush Web" },
      {
        name: "description",
        content: "Pelajari cara menggunakan GitPush Web untuk push file ke GitHub langsung dari browser, lengkap dengan setup OAuth dan tips ZIP.",
      },
      { property: "og:title", content: "Panduan Lengkap — GitPush Web" },
      {
        property: "og:description",
        content: "Tutorial setup, cara penggunaan, fitur ZIP, dan keamanan data GitPush Web.",
      },
    ],
  }),
  component: PanduanPage,
});

const WA_CHANNEL = "https://whatsapp.com/channel/0029VbBsAy17T8bbFQZ9y410";

const sections = [
  { id: "pendahuluan", label: "Pendahuluan", icon: BookOpen },
  { id: "persiapan", label: "Persiapan Token / OAuth", icon: KeyRound },
  { id: "penggunaan", label: "Cara Penggunaan", icon: MousePointerClick },
  { id: "zip", label: "Fitur ZIP", icon: FileArchive },
  { id: "keamanan", label: "Keamanan Data", icon: ShieldCheck },
  { id: "dukungan", label: "Dukungan", icon: MessageCircle },
];

function PanduanPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-10">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-muted-foreground">
          <BookOpen className="h-3.5 w-3.5 text-primary" />
          Panduan Lengkap
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Panduan <span className="text-gradient">GitPush Web</span>
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Semua yang perlu kamu tahu untuk push file ke GitHub tanpa ribet ketik perintah terminal.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:h-fit">
          <div className="glass rounded-xl p-3">
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Daftar Isi
            </p>
            <ul className="space-y-0.5">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                  >
                    <s.icon className="h-3.5 w-3.5" />
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <article className="space-y-10">
          <Section id="pendahuluan" icon={Smartphone} title="Pendahuluan">
            <p>
              <strong className="text-foreground">GitPush Web</strong> dibuat untuk satu alasan utama:
              memudahkan developer yang bekerja dari <strong>HP Android</strong> (lewat Termux),
              tablet, atau perangkat dengan keyboard terbatas untuk tetap bisa{" "}
              <strong>push file ke GitHub</strong> tanpa harus mengetik perintah git yang panjang.
            </p>
            <p>
              Cukup buka website ini, hubungkan akun GitHub-mu, drag &amp; drop file atau folder,
              dan klik <em>Push</em>. Semua proses berjalan langsung di browser, tidak ada server
              perantara yang menyimpan file kamu.
            </p>
            <Callout>
              Cocok untuk: pengguna Termux, pelajar yang belajar Git, kontributor open-source dari
              mobile, atau siapapun yang ingin alur push yang lebih cepat.
            </Callout>
          </Section>

          <Section id="persiapan" icon={Settings2} title="Persiapan Token / OAuth">
            <p>
              GitPush Web menggunakan <strong>Personal Access Token (PAT)</strong> untuk
              terhubung ke akun GitHub kamu. Cara ini lebih sederhana, aman, dan tidak butuh
              backend tambahan.
            </p>
            <ol className="list-inside list-decimal space-y-2">
              <li>
                Buka{" "}
                <a
                  className="text-primary hover:underline"
                  href="https://github.com/settings/tokens/new?scopes=repo&description=GitPush%20Web"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  halaman pembuatan token GitHub
                </a>{" "}
                <ExternalLink className="inline h-3 w-3" />.
              </li>
              <li>
                Beri nama token (misal: <code>GitPush Web</code>) dan pilih masa berlaku.
              </li>
              <li>
                Pastikan scope <code className="text-primary">repo</code> tercentang (sudah otomatis dari link di atas).
              </li>
              <li>
                Klik <strong>Generate token</strong>, lalu salin token yang dimulai dengan{" "}
                <code>ghp_...</code>.
              </li>
              <li>
                Kembali ke GitPush Web, klik <strong>Hubungkan Akun GitHub</strong>, dan tempel token.
              </li>
            </ol>
            <Callout tone="warn">
              Token kamu hanya disimpan di <code>localStorage</code> browser. Jangan berikan token
              kepada siapapun. Jika perangkat yang kamu gunakan bukan milik pribadi, klik
              <strong> Keluar</strong> setelah selesai.
            </Callout>

            <h3 className="mt-6 text-lg font-semibold text-foreground">
              Opsional: Setup OAuth GitHub App
            </h3>
            <p>
              Jika kamu mem-fork project ini dan ingin pakai full OAuth flow, daftarkan{" "}
              <a
                className="text-primary hover:underline"
                href="https://github.com/settings/developers"
                target="_blank"
                rel="noopener noreferrer"
              >
                OAuth App di GitHub Developer Settings
              </a>
              :
            </p>
            <ul className="list-inside list-disc space-y-1">
              <li>
                <strong>Homepage URL:</strong> URL deploy kamu (misal{" "}
                <code>https://gitpush-web.vercel.app</code>)
              </li>
              <li>
                <strong>Authorization callback URL:</strong>{" "}
                <code>https://your-domain/auth/callback</code>
              </li>
              <li>
                Set environment <code>VITE_GITHUB_CLIENT_ID</code> di Vercel dengan nilai Client ID
                yang muncul.
              </li>
            </ul>
          </Section>

          <Section id="penggunaan" icon={MousePointerClick} title="Cara Penggunaan">
            <Step n={1} title="Hubungkan akun" icon={KeyRound}>
              Klik tombol <strong>Hubungkan Akun GitHub</strong> di halaman utama dan tempel
              Personal Access Token kamu.
            </Step>
            <Step n={2} title="Pilih repositori" icon={GitBranch}>
              Daftar repositori akan muncul di panel kiri. Gunakan kotak pencarian untuk
              menemukan repositori dengan cepat. Klik untuk memilih sebagai target push.
            </Step>
            <Step n={3} title="Pilih branch & path" icon={GitBranch}>
              Atur branch tujuan (default: <code>main</code>) dan path target di dalam
              repositori (misal <code>/src</code> atau biarkan <code>/</code> untuk root).
            </Step>
            <Step n={4} title="Upload file" icon={MousePointerClick}>
              Drag &amp; drop file/folder ke area dropzone, atau klik untuk memilih dari perangkat.
              Untuk file ZIP, centang opsi ekstrak otomatis sesuai kebutuhan.
            </Step>
            <Step n={5} title="Push!" icon={Rocket}>
              Tulis pesan commit (atau klik <strong>Saran AI</strong> untuk auto-fill), lalu
              klik tombol <strong>Push ke GitHub</strong>. Progress upload akan tampil real-time.
            </Step>
          </Section>

          <Section id="zip" icon={FileArchive} title="Fitur ZIP">
            <p>
              GitPush Web mendukung dua mode untuk file <code>.zip</code>:
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Card title="✅ Ekstrak otomatis (default)">
                Setiap file di dalam ZIP akan di-extract di browser kamu menggunakan{" "}
                <code>jszip</code>, lalu masing-masing di-push sebagai file individual ke
                GitHub. Cocok untuk upload project lengkap atau folder hasil download.
              </Card>
              <Card title="📦 Upload sebagai biner">
                Jika checkbox <strong>“Ekstrak file ZIP otomatis”</strong> tidak dicentang,
                file <code>.zip</code> akan di-push apa adanya sebagai binary blob.
                Cocok untuk distribusi bundle, asset pack, atau backup.
              </Card>
            </div>
            <Callout>
              Proses ekstraksi 100% berjalan di browser kamu. Konten ZIP tidak pernah
              dikirim ke server pihak ketiga.
            </Callout>
          </Section>

          <Section id="keamanan" icon={ShieldCheck} title="Keamanan Data">
            <p>
              GitPush Web dirancang dengan prinsip <strong>zero-server-state</strong>:
            </p>
            <ul className="list-inside list-disc space-y-2">
              <li>
                <strong>Tidak ada server perantara.</strong> Semua request berjalan langsung dari
                browser kamu ke <code>https://api.github.com</code>.
              </li>
              <li>
                <strong>Token tidak pernah disimpan di server kami.</strong> Token disimpan
                hanya di <code>localStorage</code> browser kamu, dan hanya dikirim sebagai header
                Authorization ke GitHub.
              </li>
              <li>
                <strong>Riwayat aktivitas lokal.</strong> Log push tersimpan di{" "}
                <code>localStorage</code>, bisa dihapus kapan saja dari halaman Riwayat.
              </li>
              <li>
                <strong>HTTPS only.</strong> Komunikasi browser ↔ GitHub terenkripsi end-to-end.
              </li>
              <li>
                <strong>Open source.</strong> Kode dapat diaudit langsung — tidak ada logika
                tersembunyi.
              </li>
            </ul>
            <Callout tone="warn">
              <strong>Tips:</strong> Selalu logout dari perangkat publik setelah selesai. Untuk
              keamanan maksimal, buat token dengan masa berlaku pendek (7–30 hari) dan revoke
              setelah tidak digunakan.
            </Callout>
          </Section>

          <Section id="dukungan" icon={MessageCircle} title="Dukungan">
            <p>
              Punya pertanyaan, request fitur, atau menemukan bug? Gabung saluran WhatsApp kami
              untuk update dan dukungan langsung dari komunitas.
            </p>
            <a
              href={WA_CHANNEL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-[oklch(0.75_0.18_145_/_0.4)] bg-[oklch(0.75_0.18_145_/_0.1)] px-5 py-3 text-sm font-semibold text-[oklch(0.85_0.18_145)] transition-all hover:scale-105"
              style={{ boxShadow: "0 0 24px -4px oklch(0.75 0.18 145 / 0.45)" }}
            >
              <MessageCircle className="h-5 w-5" />
              Gabung Saluran WhatsApp Kami
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Section>
        </article>
      </div>
    </div>
  );
}

function Section({
  id, icon: Icon, title, children,
}: {
  id: string;
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary glow-cyan">
          <Icon className="h-4 w-4 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      </div>
      <div className="glass space-y-4 rounded-2xl p-6 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

function Step({
  n, title, icon: Icon, children,
}: {
  n: number;
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/10 font-bold text-primary">
        {n}
      </div>
      <div className="flex-1">
        <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Icon className="h-3.5 w-3.5 text-primary" />
          {title}
        </p>
        <p className="text-sm text-muted-foreground">{children}</p>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="mb-2 font-semibold text-foreground">{title}</p>
      <p className="text-sm text-muted-foreground">{children}</p>
    </div>
  );
}

function Callout({
  children, tone = "info",
}: { children: React.ReactNode; tone?: "info" | "warn" }) {
  const styles =
    tone === "warn"
      ? "border-[oklch(0.75_0.2_70_/_0.4)] bg-[oklch(0.75_0.2_70_/_0.08)] text-[oklch(0.9_0.15_80)]"
      : "border-primary/30 bg-primary/5 text-foreground";
  return (
    <div className={`rounded-xl border p-4 text-sm ${styles}`}>
      {children}
    </div>
  );
}
