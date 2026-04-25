import JSZip from "jszip";

export interface StagedFile {
  id: string;
  // Final relative path within the upload (no leading slash).
  // For ZIP-extracted files, this is the path inside the ZIP.
  // For folder uploads, this is the webkitRelativePath.
  // For single files, this is just the filename.
  relPath: string;
  size: number;
  bytes: Uint8Array;
  // The original source (for UX hint / icon)
  origin: "file" | "folder" | "zip-entry" | "zip-raw";
  // For zip-raw, this is the ZIP filename.
  source?: string;
}

const TEXT_EXTS = new Set([
  "js", "jsx", "ts", "tsx", "mjs", "cjs",
  "json", "yml", "yaml", "toml", "xml",
  "md", "mdx", "txt", "csv", "log",
  "html", "htm", "css", "scss", "sass", "less",
  "py", "rb", "go", "rs", "java", "kt", "swift",
  "c", "cc", "cpp", "h", "hpp", "cs",
  "php", "sh", "bash", "zsh", "fish",
  "env", "gitignore", "gitattributes", "editorconfig",
  "vue", "svelte", "astro",
  "sql", "graphql", "gql",
  "dockerfile",
]);

export function getExt(name: string): string {
  const i = name.lastIndexOf(".");
  if (i === -1) return name.toLowerCase();
  return name.slice(i + 1).toLowerCase();
}

export function isTextFile(name: string): boolean {
  const lower = name.toLowerCase();
  if (lower === "dockerfile" || lower.endsWith("/dockerfile")) return true;
  return TEXT_EXTS.has(getExt(name));
}

export function isImage(name: string): boolean {
  return ["png", "jpg", "jpeg", "gif", "webp", "svg", "ico", "bmp", "avif"].includes(
    getExt(name),
  );
}

export function isZip(name: string): boolean {
  return getExt(name) === "zip";
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export async function fileToBytes(file: File): Promise<Uint8Array> {
  const buf = await file.arrayBuffer();
  return new Uint8Array(buf);
}

export async function readZipEntries(file: File): Promise<StagedFile[]> {
  const buf = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(buf);
  const entries: StagedFile[] = [];
  const names = Object.keys(zip.files);
  for (const name of names) {
    const entry = zip.files[name];
    if (entry.dir) continue;
    // Skip hidden files commonly included by macOS
    if (name.startsWith("__MACOSX/") || name.endsWith(".DS_Store")) continue;
    const bytes = await entry.async("uint8array");
    entries.push({
      id: crypto.randomUUID(),
      relPath: name.replace(/^\/+/, ""),
      size: bytes.length,
      bytes,
      origin: "zip-entry",
      source: file.name,
    });
  }
  return entries;
}

export function decodeText(bytes: Uint8Array): string {
  try {
    return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  } catch {
    return "";
  }
}
