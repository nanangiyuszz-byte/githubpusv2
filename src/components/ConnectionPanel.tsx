// src/components/ConnectionPanel.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Github, 
  LogOut, 
  KeyRound, 
  ShieldCheck, 
  Sparkles, 
  ExternalLink, 
  RefreshCw,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { GitHubUser } from "@/lib/github";

interface Props {
  user: GitHubUser | null;
  status: "idle" | "loading" | "authed" | "error";
  onLogin: (callback: (code: string, url: string) => void) => Promise<void>;
  onLogout: () => void;
}

export function ConnectionPanel({ user, status, onLogin, onLogout }: Props) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [authInfo, setAuthInfo] = useState<{ code: string; url: string } | null>(null);

  const handleStartLogin = async () => {
    setSubmitting(true);
    try {
      await onLogin((code, url) => {
        setAuthInfo({ code, url });
        // Memberi sedikit jeda sebelum buka tab agar user tidak kaget
        setTimeout(() => {
          window.open(url, "_blank");
        }, 1500);
        toast.success("Kode berhasil dibuat! Silakan verifikasi di GitHub.");
      });
    } catch (err) {
      toast.error("Gagal memulai proses login otomatis.");
      setSubmitting(false);
    }
  };

  // Tampilan saat user SUDAH LOGIN (Dibuat tetap estetik)
  if (status === "authed" && user) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 p-1.5 pr-4 bg-white/5 backdrop-blur-md rounded-full border border-white/10 hover:border-cyan-500/30 transition-colors"
      >
        <div className="relative">
          <img 
            src={user.avatar_url} 
            alt={user.login} 
            className="w-8 h-8 rounded-full border border-cyan-500/50"
          />
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-zinc-950 rounded-full" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-white leading-none">{user.login}</span>
          <span className="text-[10px] text-cyan-400/70 font-medium">Terhubung</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onLogout}
          className="h-7 w-7 ml-2 rounded-full hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          <LogOut className="h-3.5 w-3.5" />
        </Button>
      </motion.div>
    );
  }

  return (
    <>
      <Button 
        onClick={() => setOpen(true)}
        className="gradient-primary glow-cyan h-10 gap-2 font-bold px-5 rounded-full transition-all hover:scale-105 active:scale-95"
      >
        <Github className="h-4 w-4" />
        <span>Hubungkan GitHub</span>
        <Sparkles className="h-3.5 w-3.5" />
      </Button>

      <Dialog open={open} onOpenChange={(val) => {
        setOpen(val);
        if (!val) {
          setAuthInfo(null);
          setSubmitting(false);
        }
      }}>
        <DialogContent className="sm:max-w-md bg-zinc-950/95 border-white/10 backdrop-blur-xl">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center mb-4 border border-cyan-500/20">
              <KeyRound className="h-6 w-6 text-cyan-400" />
            </div>
            <DialogTitle className="text-center text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              Otorisasi GitHub
            </DialogTitle>
            <DialogDescription className="text-center">
              Login otomatis menggunakan Device Flow. Lebih aman dan tanpa ribet salin token manual.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-6">
            <AnimatePresence mode="wait">
              {!authInfo ? (
                <motion.div
                  key="start"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Button 
                    onClick={handleStartLogin}
                    disabled={submitting}
                    className="w-full h-14 gradient-primary text-lg font-bold glow-cyan rounded-xl group"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                        Menghubungkan...
                      </>
                    ) : (
                      <>
                        Mulai Login Otomatis
                        <ExternalLink className="ml-2 h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="code"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                    <div className="relative p-8 bg-zinc-900 border border-white/10 rounded-2xl text-center">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-3 font-bold">
                        Masukkan Kode Ini di GitHub
                      </p>
                      <h2 className="text-5xl font-mono font-black text-white tracking-tighter">
                        {authInfo.code}
                      </h2>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button 
                      asChild 
                      className="w-full h-12 bg-white text-black hover:bg-white/90 font-bold rounded-xl"
                    >
                      <a href={authInfo.url} target="_blank" rel="noreferrer">
                        Buka Halaman Aktivasi
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                    <p className="text-center text-[11px] text-muted-foreground animate-pulse">
                      Menunggu Anda mengonfirmasi di browser...
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Panel Informasi Keamanan (Tetap di bawah) */}
            <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-4 space-y-3">
              <div className="flex gap-3">
                <div className="mt-0.5">
                  <ShieldCheck className="h-4 w-4 text-green-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-white">Keamanan Terjamin</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Token akses hanya disimpan di <code>localStorage</code> browser kamu. 
                    Aplikasi ini tidak memiliki database untuk menyimpan data pribadimu.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="mt-0.5">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-white">Direct Access</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Semua permintaan API dikirim langsung dari browser kamu ke <code>api.github.com</code>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
