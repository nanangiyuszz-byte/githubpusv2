// src/lib/github.ts
// GitHub REST API client menggunakan fetch + stored token.
// Semua request langsung dari browser ke api.github.com.

const API = "https://api.github.com";
const TOKEN_KEY = "gitpush.token";

export interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
}

export interface Repo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  default_branch: string;
  description: string | null;
  updated_at: string;
  owner: { login: string; avatar_url: string };
  html_url: string;
}

export interface Branch {
  name: string;
  commit: { sha: string };
  protected: boolean;
}

export class GitHubError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export const tokenStore = {
  get(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  set(token: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEY, token);
  },
  clear() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
  },
};

// --- FUNGSI BARU: GITHUB DEVICE FLOW (LOGIN OTOMATIS) ---

export async function getDeviceCode() {
  const res = await fetch("https://github.com/login/device/code", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({
      client_id: import.meta.env.VITE_GITHUB_CLIENT_ID,
      scope: "repo,workflow,gist",
    }),
  });
  return res.json();
}

export async function pollForToken(deviceCode: string) {
  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({
      client_id: import.meta.env.VITE_GITHUB_CLIENT_ID,
      device_code: deviceCode,
      grant_type: "urn:ietf:params:oauth:grant-type:device_code",
    }),
  });
  return res.json();
}

// --- FUNGSI INTI UNTUK KOMUNIKASI API ---

async function gh<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const t = token || tokenStore.get();
  if (!t) throw new GitHubError("Tidak ada token", 401);

  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${t}`,
      Accept: "application/vnd.github.v3+json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new GitHubError(error.message, res.status);
  }

  if (res.status === 204) return {} as T;
  return res.json();
}

export async function getUser(token?: string): Promise<GitHubUser> {
  return gh<GitHubUser>("/user", {}, token);
}

export async function getRepos(): Promise<Repo[]> {
  // Mengambil repo yang di-owner oleh user, urut berdasarkan update terbaru
  return gh<Repo[]>("/user/repos?affiliation=owner&sort=updated&per_page=100");
}

export async function getBranches(owner: string, repo: string): Promise<Branch[]> {
  return gh<Branch[]>(`/repos/${owner}/${repo}/branches`);
}

export interface ContentResponse {
  sha: string;
}

export async function getFileSha(
  owner: string,
  repo: string,
  path: string,
  branch: string
): Promise<string | null> {
  try {
    const res = await gh<ContentResponse>(
      `/repos/${owner}/${repo}/contents/${encodeURIComponent(path).replace(/%2F/g, "/")}?ref=${encodeURIComponent(branch)}`
    );
    return res.sha;
  } catch (e) {
    if (e instanceof GitHubError && e.status === 404) return null;
    throw e;
  }
}

// Konversi ArrayBuffer/Uint8Array ke base64
export function toBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)));
  }
  return btoa(binary);
}

export interface PutFileArgs {
  owner: string;
  repo: string;
  path: string;
  branch: string;
  contentBase64: string;
  message: string;
  sha?: string | null;
}

export async function putFile(args: PutFileArgs) {
  const body: Record<string, unknown> = {
    message: args.message,
    content: args.contentBase64,
    branch: args.branch,
  };
  if (args.sha) body.sha = args.sha;

  return gh(
    `/repos/${args.owner}/${args.repo}/contents/${encodeURIComponent(args.path).replace(/%2F/g, "/")}`,
    {
      method: "PUT",
      body: JSON.stringify(body),
    }
  );
}
