import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { MeshBackground } from "@/components/MeshBackground";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <MeshBackground />
      <div className="glass relative z-10 max-w-md rounded-2xl p-10 text-center shadow-elegant">
        <h1 className="text-7xl font-bold text-gradient">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Halaman Tidak Ditemukan</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Halaman yang kamu cari tidak ada atau sudah dipindahkan.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:scale-105 glow-cyan"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "GitPush Web — Push ke GitHub Tanpa Terminal" },
      {
        name: "description",
        content:
          "Solusi cepat upload & push file ke GitHub langsung dari browser. Cocok untuk pengguna mobile & Termux.",
      },
      { name: "author", content: "GitPush Web" },
      { property: "og:title", content: "GitPush Web — Push ke GitHub Tanpa Terminal" },
      {
        property: "og:description",
        content:
          "GUI aesthetic untuk upload file & folder ke repositori GitHub via OAuth. Tanpa command line.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <MeshBackground />
      <Navbar />
      <main className="relative z-10 flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}
