import { MessageCircle, Github, Heart } from "lucide-react";

const WA_CHANNEL = "https://whatsapp.com/channel/0029VbBsAy17T8bbFQZ9y410";

export function Footer() {
  return (
    <footer className="relative z-10 mt-16 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="text-center sm:text-left">
            <p className="text-sm font-semibold">
              <span className="text-gradient">GitPush Web</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Push file ke GitHub langsung dari browser. Aman, cepat, tanpa terminal.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <a
              href={WA_CHANNEL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-lg border border-[oklch(0.75_0.18_145_/_0.4)] bg-[oklch(0.75_0.18_145_/_0.08)] px-4 py-2 text-sm font-medium text-[oklch(0.85_0.18_145)] transition-all hover:scale-105 hover:bg-[oklch(0.75_0.18_145_/_0.15)]"
              style={{ boxShadow: "0 0 20px -4px oklch(0.75 0.18 145 / 0.4)" }}
            >
              <MessageCircle className="h-4 w-4" />
              Gabung Saluran WhatsApp
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-white/20 hover:text-foreground"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <span>Dibuat dengan</span>
          <Heart className="h-3 w-3 fill-current text-[oklch(0.7_0.27_25)]" />
          <span>untuk komunitas developer Indonesia</span>
        </div>
      </div>
    </footer>
  );
}
