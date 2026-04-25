// src/hooks/use-github-auth.ts
import { useCallback, useEffect, useState } from "react";
import { 
  tokenStore, 
  getUser, 
  getDeviceCode, 
  pollForToken, 
  type GitHubUser, 
  GitHubError 
} from "@/lib/github";

interface AuthState {
  status: "idle" | "loading" | "authed" | "error";
  user: GitHubUser | null;
  token: string | null;
  error: string | null;
}

export function useGithubAuth() {
  const [state, setState] = useState<AuthState>({
    status: "idle",
    user: null,
    token: null,
    error: null,
  });

  /**
   * Fungsi untuk menyegarkan sesi (Refresh Session)
   * Mengambil token dari localStorage dan memvalidasi ke API GitHub
   */
  const refresh = useCallback(async () => {
    const token = tokenStore.get();
    
    if (!token) {
      setState({ 
        status: "idle", 
        user: null, 
        token: null, 
        error: null 
      });
      return;
    }

    setState((s) => ({ ...s, status: "loading", token }));

    try {
      const user = await getUser(token);
      setState({ 
        status: "authed", 
        user, 
        token, 
        error: null 
      });
    } catch (e) {
      const msg = e instanceof GitHubError ? e.message : "Sesi telah berakhir atau token tidak valid.";
      console.error("Auth error:", e);
      
      // Jika error 401 (Unauthorized), hapus token
      tokenStore.clear();
      setState({ 
        status: "error", 
        user: null, 
        token: null, 
        error: msg 
      });
    }
  }, []);

  // Jalankan refresh otomatis saat pertama kali aplikasi dimuat
  useEffect(() => {
    refresh();
  }, [refresh]);

  /**
   * Fungsi Login Baru (Device Flow)
   * @param onCodeReceived Callback untuk mengirimkan user_code ke UI
   */
  const login = useCallback(
    async (onCodeReceived: (code: string, url: string) => void) => {
      setState((s) => ({ ...s, status: "loading", error: null }));

      try {
        // 1. Minta Device Code dari GitHub
        const deviceData = await getDeviceCode();
        
        if (deviceData.error) {
          throw new Error(deviceData.error_description || "Gagal mendapatkan kode dari GitHub.");
        }

        // 2. Kirim user_code dan verification_uri ke komponen UI (ConnectionPanel)
        onCodeReceived(deviceData.user_code, deviceData.verification_uri);

        // 3. Polling: Cek terus-menerus apakah user sudah klik 'Authorize' di GitHub
        const intervalTime = (deviceData.interval || 5) * 1000;
        
        const pollInterval = setInterval(async () => {
          try {
            const authResponse = await pollForToken(deviceData.device_code);

            // Jika berhasil dapet token
            if (authResponse.access_token) {
              clearInterval(pollInterval);
              tokenStore.set(authResponse.access_token);
              await refresh(); // Perbarui state user
            } 
            // Jika ada error selain "masih nunggu" (pending)
            else if (authResponse.error && authResponse.error !== "authorization_pending") {
              clearInterval(pollInterval);
              setState((s) => ({ 
                ...s, 
                status: "error", 
                error: authResponse.error_description 
              }));
            }
          } catch (err) {
            console.error("Polling error:", err);
          }
        }, intervalTime);

        // Bersihkan interval jika komponen unmount atau proses terlalu lama (opsional: 15 menit)
        setTimeout(() => clearInterval(pollInterval), 900000);

      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "Terjadi kesalahan saat memulai login.";
        setState((s) => ({ 
          ...s, 
          status: "error", 
          error: errorMessage 
        }));
      }
    },
    [refresh]
  );

  /**
   * Fungsi Logout
   */
  const logout = useCallback(() => {
    tokenStore.clear();
    setState({ 
      status: "idle", 
      user: null, 
      token: null, 
      error: null 
    });
  }, []);

  return {
    ...state,
    login,
    logout,
    refresh
  };
}
