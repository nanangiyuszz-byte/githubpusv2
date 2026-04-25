const KEY = "gitpush.activity";

export interface ActivityEntry {
  id: string;
  timestamp: number;
  repo: string; // owner/name
  path: string;
  branch: string;
  message: string;
  status: "Sukses" | "Gagal";
  detail?: string;
  filesCount: number;
}

export function readLog(): ActivityEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ActivityEntry[];
  } catch {
    return [];
  }
}

export function appendLog(entry: Omit<ActivityEntry, "id" | "timestamp">) {
  if (typeof window === "undefined") return;
  const entries = readLog();
  const next: ActivityEntry = {
    ...entry,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
  entries.unshift(next);
  // Cap log
  const capped = entries.slice(0, 200);
  localStorage.setItem(KEY, JSON.stringify(capped));
  window.dispatchEvent(new Event("gitpush:activity"));
}

export function clearLog() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("gitpush:activity"));
}
