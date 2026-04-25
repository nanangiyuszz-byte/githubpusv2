import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud, X, FileText, FileCode, FileImage, Folder, FileArchive,
  Eye, Loader2, GitBranch as GitBranchIcon, GitCommit, Sparkles,
  Rocket, AlertCircle, CheckCircle2, FolderTree, Trash2, FileQuestion,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  fileToBytes, readZipEntries, isZip, isTextFile, isImage, formatSize,
  getExt, decodeText, type StagedFile,
} from "@/lib/files";
import {
  listBranches, getFileSha, putFile, toBase64, joinPath,
  GitHubError, type Repo, type Branch,
} from "@/lib/github";
import { appendLog } from "@/lib/activity-log";

interface Props {
  repo: Repo | null;
  authed: boolean;
}

interface PushProgress {
  current: number;
  total: number;
  filename: string;
}

export function UploadArea({ repo, authed }: Props) {
  const [files, setFiles] = useState<StagedFile[]>([]);
  const [extractZip, setExtractZip] = useState(true);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branch, setBranch] = useState<string>("main");
  const [targetPath, setTargetPath] = useState("/");
  const [commitMsg, setCommitMsg] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [progress, setProgress] = useState<PushProgress | null>(null);
  const [previewFile, setPreviewFile] = useState<StagedFile | null>(null);
  const [loadingBranches, setLoadingBranches] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Load branches when repo changes
  useEffect(() => {
    if (!repo || !authed) {
      setBranches([]);
      return;
    }
    setLoadingBranches(true);
    listBranches(repo.owner.login, repo.name)
      .then((b) => {
        setBranches(b);
        const def = b.find((x) => x.name === repo.default_branch) ?? b[0];
        if (def) setBranch(def.name);
      })
      .catch((e) => {
        toast.error(e instanceof Error ? e.message : "Gagal memuat branch.");
      })
      .finally(() => setLoadingBranches(false));
  }, [repo, authed]);

  const onPick = (input: HTMLInputElement | null) => input?.click();

  const handleFiles = async (fileList: FileList | File[]) => {
    const arr = Array.from(fileList);
    const next: StagedFile[] = [];

    for (const f of arr) {
      // Folder upload provides webkitRelativePath
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rel = (f as any).webkitRelativePath as string | undefined;

      if (isZip(f.name)) {
        if (extractZip) {
          try {
            const entries = await readZipEntries(f);
            next.push(...entries);
            toast.success(`ZIP "${f.name}" berhasil diekstrak (${entries.length} file).`);
          } catch (e) {
            toast.error(`Gagal ekstrak ${f.name}: ${e instanceof Error ? e.message : ""}`);
          }
        } else {
          const bytes = await fileToBytes(f);
          next.push({
            id: crypto.randomUUID(),
            relPath: f.name,
            size: bytes.length,
            bytes,
            origin: "zip-raw",
          });
        }
      } else {
        const bytes = await fileToBytes(f);
        next.push({
          id: crypto.randomUUID(),
          relPath: rel && rel.length > 0 ? rel : f.name,
          size: bytes.length,
          bytes,
          origin: rel ? "folder" : "file",
        });
      }
    }

    setFiles((prev) => [...prev, ...next]);
  };

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (!e.dataTransfer.files) return;
    await handleFiles(e.dataTransfer.files);
  };

  const removeFile = (id: string) =>
    setFiles((prev) => prev.filter((f) => f.id !== id));

  const clearAll = () => setFiles([]);

  const suggestCommit = () => {
    if (files.length === 0) {
      toast.info("Belum ada file untuk dijadikan saran.");
      return;
    }
    const names = files.slice(0, 3).map((f) => f.relPath.split("/").pop()).join(", ");
    const more = files.length > 3 ? ` dan ${files.length - 3} file lain` : "";
    const verb = files.length === 1 ? "Tambah" : "Perbarui";
    setCommitMsg(`${verb} ${names}${more}`);
    toast.success("Pesan commit disarankan.");
  };

  const canPush =
    authed && repo && files.length > 0 && commitMsg.trim().length > 0 && branch && !pushing;

  const handlePush = async () => {
    if (!repo || !authed) return;
    if (files.length === 0) {
      toast.error("Belum ada file untuk di-push.");
      return;
    }
    if (!commitMsg.trim()) {
      toast.error("Pesan commit wajib diisi.");
      return;
    }

    setPushing(true);
    setProgress({ current: 0, total: files.length, filename: "" });
    const cleanBase = targetPath.replace(/^\/+|\/+$/g, "");
    let success = 0;
    let failed = 0;
    let lastError: string | null = null;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fullPath = joinPath(cleanBase, file.relPath);
      setProgress({ current: i, total: files.length, filename: fullPath });

      try {
        const sha = await getFileSha(repo.owner.login, repo.name, fullPath, branch);
        await putFile({
          owner: repo.owner.login,
          repo: repo.name,
          path: fullPath,
          branch,
          contentBase64: toBase64(file.bytes),
          message: commitMsg,
          sha,
        });
        success++;
      } catch (e) {
        failed++;
        lastError = e instanceof GitHubError ? e.message : "Push error";
        console.error("Push failed for", fullPath, e);
      }
    }

    setProgress({ current: files.length, total: files.length, filename: "" });

    appendLog({
      repo: repo.full_name,
      path: cleanBase || "/",
      branch,
      message: commitMsg,
      status: failed === 0 ? "Sukses" : "Gagal",
      detail:
        failed === 0
          ? `${success} file berhasil di-push.`
          : `${success} sukses, ${failed} gagal. ${lastError ?? ""}`,
      filesCount: files.length,
    });

    if (failed === 0) {
      toast.success(`Berhasil push ${success} file ke ${repo.full_name}!`);
      setFiles([]);
      setCommitMsg("");
    } else {
      toast.error(`Push selesai dengan ${failed} kegagalan. ${lastError ?? ""}`);
    }

    setPushing(false);
    setTimeout(() => setProgress(null), 1200);
  };

  return (
    <div className="glass rounded-2xl p-5 sm:p-6 shadow-elegant">
      <div className="mb-5 flex items-center gap-2">
        <UploadCloud className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold tracking-tight">Area Unggah File</h2>
        {repo && (
          <span className="ml-auto truncate rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-muted-foreground">
            Target: <span className="text-foreground">{repo.full_name}</span>
          </span>
        )}
      </div>

      {!repo && (
        <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center text-sm text-muted-foreground">
          <FolderTree className="mx-auto mb-2 h-8 w-8 opacity-40" />
          Pilih repositori dulu di panel sebelah kiri untuk mulai upload.
        </div>
      )}

      {repo && (
        <>
          {/* Target settings */}
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs">
                <GitBranchIcon className="h-3.5 w-3.5" /> Branch Target
              </Label>
              <Select value={branch} onValueChange={setBranch} disabled={loadingBranches || pushing}>
                <SelectTrigger className="h-10 bg-white/[0.03]">
                  <SelectValue placeholder={loadingBranches ? "Memuat..." : "Pilih branch"} />
                </SelectTrigger>
                <SelectContent className="glass-strong">
                  {branches.map((b) => (
                    <SelectItem key={b.name} value={b.name}>
                      {b.name}
                      {b.name === repo.default_branch && (
                        <span className="ml-2 text-xs text-primary">default</span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs">
                <FolderTree className="h-3.5 w-3.5" /> Path Target
              </Label>
              <Input
                value={targetPath}
                onChange={(e) => setTargetPath(e.target.value)}
                placeholder="/ atau /src/components"
                className="h-10 font-mono text-sm bg-white/[0.03]"
                disabled={pushing}
              />
            </div>
          </div>

          {/* Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
              dragOver
                ? "border-primary bg-primary/10 neon-border-cyan"
                : "border-white/10 bg-white/[0.02] hover:border-white/20"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) handleFiles(e.target.files);
                e.target.value = "";
              }}
            />
            <input
              ref={folderInputRef}
              type="file"
              multiple
              className="hidden"
              // @ts-expect-error - non-standard but supported in chromium
              webkitdirectory=""
              directory=""
              onChange={(e) => {
                if (e.target.files) handleFiles(e.target.files);
                e.target.value = "";
              }}
            />

            <motion.div
              animate={{ y: dragOver ? -4 : 0 }}
              className="mx-auto mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary glow-cyan"
            >
              <UploadCloud className="h-7 w-7 text-primary-foreground" />
            </motion.div>
            <p className="text-base font-semibold">
              Tarik file/folder ke sini, atau klik untuk pilih
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Mendukung file individual, folder lengkap, atau ZIP archive
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => onPick(fileInputRef.current)}
                disabled={pushing}
              >
                <FileText className="mr-1.5 h-4 w-4" /> Pilih File
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => onPick(folderInputRef.current)}
                disabled={pushing}
              >
                <Folder className="mr-1.5 h-4 w-4" /> Pilih Folder
              </Button>
            </div>

            <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
              <Checkbox
                id="extract-zip"
                checked={extractZip}
                onCheckedChange={(v) => setExtractZip(v === true)}
                disabled={pushing}
              />
              <Label htmlFor="extract-zip" className="cursor-pointer text-xs">
                <FileArchive className="mr-1 inline h-3.5 w-3.5 text-accent" />
                Ekstrak file ZIP otomatis sebelum di-push?
              </Label>
            </div>
          </div>

          {/* Staged files */}
          {files.length > 0 && (
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground">
                  {files.length} file siap di-push •{" "}
                  {formatSize(files.reduce((acc, f) => acc + f.size, 0))}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="h-7 text-xs text-muted-foreground hover:text-[oklch(0.7_0.27_25)]"
                  disabled={pushing}
                >
                  <Trash2 className="mr-1 h-3.5 w-3.5" />
                  Bersihkan
                </Button>
              </div>
              <ul className="max-h-72 overflow-y-auto space-y-1 rounded-lg border border-white/10 bg-white/[0.02] p-2">
                <AnimatePresence initial={false}>
                  {files.map((f) => (
                    <FileRow
                      key={f.id}
                      file={f}
                      onRemove={() => removeFile(f.id)}
                      onPreview={() => setPreviewFile(f)}
                      disabled={pushing}
                    />
                  ))}
                </AnimatePresence>
              </ul>
            </div>
          )}

          {/* Commit + Push */}
          <div className="mt-6 space-y-3">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs">
                <GitCommit className="h-3.5 w-3.5" /> Pesan Commit (Wajib)
              </Label>
              <div className="flex gap-2">
                <Input
                  value={commitMsg}
                  onChange={(e) => setCommitMsg(e.target.value)}
                  placeholder="Misal: Perbarui file index.html"
                  className="h-11 bg-white/[0.03]"
                  disabled={pushing}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={suggestCommit}
                  disabled={pushing || files.length === 0}
                  className="h-11 shrink-0"
                  title="Saran AI berdasarkan file"
                >
                  <Sparkles className="mr-1.5 h-4 w-4 text-accent" />
                  Saran AI
                </Button>
              </div>
            </div>

            {progress && (
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                <div className="mb-2 flex items-center gap-2 text-xs font-medium">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  <span>
                    Sedang Mengunggah... ({progress.current}/{progress.total})
                  </span>
                </div>
                <Progress
                  value={(progress.current / Math.max(progress.total, 1)) * 100}
                  className="h-1.5"
                />
                {progress.filename && (
                  <p className="mt-2 truncate font-mono text-[10px] text-muted-foreground">
                    {progress.filename}
                  </p>
                )}
              </div>
            )}

            <Button
              size="lg"
              onClick={handlePush}
              disabled={!canPush}
              className="w-full h-14 text-base font-bold gradient-primary text-primary-foreground rounded-xl glow-cyan hover:scale-[1.01] transition-transform animate-pulse-glow disabled:opacity-50 disabled:animate-none"
            >
              {pushing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Sedang Mengunggah...
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-5 w-5" />
                  Push ke GitHub
                </>
              )}
            </Button>

            {!authed && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <AlertCircle className="h-3.5 w-3.5" />
                Hubungkan akun GitHub terlebih dahulu.
              </p>
            )}
          </div>
        </>
      )}

      <PreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
    </div>
  );
}

function FileRow({
  file, onRemove, onPreview, disabled,
}: {
  file: StagedFile;
  onRemove: () => void;
  onPreview: () => void;
  disabled: boolean;
}) {
  const Icon = pickIcon(file.relPath);
  const text = isTextFile(file.relPath);
  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      className="group flex items-center gap-2 rounded-md border border-transparent px-2 py-1.5 hover:border-white/10 hover:bg-white/[0.04]"
    >
      <Icon className="h-4 w-4 flex-shrink-0 text-primary" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium">{file.relPath}</p>
        <p className="text-[10px] text-muted-foreground">
          {formatSize(file.size)}
          {file.origin === "zip-entry" && file.source && (
            <>
              {" "}• dari <span className="text-accent">{file.source}</span>
            </>
          )}
          {file.origin === "zip-raw" && <> • ZIP raw</>}
          {file.origin === "folder" && <> • dari folder</>}
        </p>
      </div>
      {text && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-primary"
          onClick={onPreview}
          title="Pratinjau Kode"
          disabled={disabled}
        >
          <Eye className="h-3.5 w-3.5" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-[oklch(0.7_0.27_25)]"
        onClick={onRemove}
        title="Hapus"
        disabled={disabled}
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </motion.li>
  );
}

function pickIcon(name: string) {
  if (name.endsWith("/")) return Folder;
  if (isZip(name)) return FileArchive;
  if (isImage(name)) return FileImage;
  if (isTextFile(name)) return FileCode;
  if (getExt(name) === name && !name.includes(".")) return FileQuestion;
  return FileText;
}

function PreviewModal({
  file, onClose,
}: { file: StagedFile | null; onClose: () => void }) {
  return (
    <Dialog open={!!file} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="glass-strong border-white/10 max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCode className="h-5 w-5 text-primary" />
            Pratinjau Kode
          </DialogTitle>
          <DialogDescription className="font-mono text-xs">
            {file?.relPath} • {file ? formatSize(file.size) : ""}
          </DialogDescription>
        </DialogHeader>
        <pre className="max-h-[60vh] overflow-auto rounded-lg border border-white/10 bg-black/40 p-4 font-mono text-xs leading-relaxed">
          <code>{file ? decodeText(file.bytes) : ""}</code>
        </pre>
      </DialogContent>
    </Dialog>
  );
}
