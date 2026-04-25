import { Link, useLocation } from "@tanstack/react-router";
import { GitBranch, BookOpen, History } from "lucide-react";

export function Navbar() {
  const location = useLocation();
  const path = location.pathname;

  const navItems = [
    { to: "/", label: "Beranda", icon: GitBranch, exact: true },
    { to: "/logs", label: "Riwayat", icon: History, exact: false },
    { to: "/panduan", label: "Panduan", icon: BookOpen, exact: false },
  ] as const;

  return (
    <header className="sticky top-0 z-30 w-full">
      <div className="glass-strong border-b border-white/10">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="group flex items-center gap-2.5">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl gradient-primary glow-cyan transition-transform group-hover:scale-110">
              <GitBranch className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-bold tracking-tight">
                <span className="text-gradient">GitPush</span>{" "}
                <span className="text-foreground">Web</span>
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                tanpa terminal
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const active = item.exact ? path === item.to : path.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                  {active && (
                    <span className="absolute inset-x-2 -bottom-px h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
