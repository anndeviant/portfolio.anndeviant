"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

interface StorageFile {
  id?: string;
  name: string;
  created_at?: string;
  updated_at?: string;
  last_accessed_at?: string;
  metadata?: {
    size?: number;
    mimetype?: string;
  };
  publicUrl: string;
}

export default function WhoAmIPage() {
  const [authStatus, setAuthStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");
  const [passcode, setPasscode] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [filesError, setFilesError] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name" | "size">("newest");

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deletingFileName, setDeletingFileName] = useState<string | null>(null);
  const [confirmDeleteFile, setConfirmDeleteFile] = useState<StorageFile | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputId = useId();
  const router = useRouter();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setAuthStatus("loading");
    try {
      const res = await fetch("/api/whoami/auth");
      const data = await res.json();
      if (data.authenticated) {
        setAuthStatus("authenticated");
        fetchFiles();
      } else {
        setAuthStatus("unauthenticated");
      }
    } catch {
      setAuthStatus("unauthenticated");
    }
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setAuthError("Please enter passcode.");
      return;
    }
    setAuthSubmitting(true);
    setAuthError(null);

    try {
      const res = await fetch("/api/whoami/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: passcode.trim() }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setAuthError(data.error || "Incorrect access code.");
        setAuthSubmitting(false);
        return;
      }

      setAuthStatus("authenticated");
      setPasscode("");
      fetchFiles();
    } catch {
      setAuthError("Failed to authenticate.");
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/whoami/logout", { method: "POST" });
    } finally {
      setAuthStatus("unauthenticated");
      router.push("/");
    }
  };

  const fetchFiles = async () => {
    setLoadingFiles(true);
    setFilesError(null);
    try {
      const res = await fetch("/api/whoami/files");
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFilesError(data.error || "Failed to load files from storage.");
        return;
      }
      setFiles(data.files || []);
    } catch {
      setFilesError("Network error while loading files.");
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleFileUpload = async (selectedFiles: FileList | File[]) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    setUploading(true);
    setFilesError(null);

    const total = selectedFiles.length;
    let uploadedCount = 0;
    let failedCount = 0;
    let lastError: string | null = null;

    for (let i = 0; i < total; i++) {
      const file = selectedFiles[i];
      setUploadProgress(`Uploading ${file.name} (${i + 1}/${total})...`);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/whoami/files", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
          failedCount++;
          lastError = data.error || "Upload failed.";
        } else {
          uploadedCount++;
        }
      } catch (err) {
        failedCount++;
        lastError = err instanceof Error ? err.message : "Upload error.";
      }
    }

    setUploading(false);
    setUploadProgress(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (uploadedCount > 0) {
      showToast(
        failedCount === 0
          ? `Uploaded ${uploadedCount} file(s).`
          : `Uploaded ${uploadedCount} file(s), ${failedCount} failed.`,
      );
      fetchFiles();
    } else if (lastError) {
      setFilesError(lastError);
    }
  };

  const handleDeleteFile = async (fileName: string) => {
    setDeletingFileName(fileName);
    try {
      const res = await fetch("/api/whoami/files", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFilesError(data.error || "Failed to delete file.");
        return;
      }
      showToast(`Deleted ${fileName}`);
      setFiles((prev) => prev.filter((f) => f.name !== fileName));
    } catch {
      setFilesError("Network error deleting file.");
    } finally {
      setDeletingFileName(null);
      setConfirmDeleteFile(null);
    }
  };

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      showToast("Link copied to clipboard.");
    } catch {
      showToast("Failed to copy link.");
    }
  };

  const filteredFiles = useMemo(() => {
    const list = files.filter((f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    list.sort((a, b) => {
      if (sortBy === "newest") {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      }
      if (sortBy === "oldest") {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateA - dateB;
      }
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "size") {
        const sizeA = a.metadata?.size || 0;
        const sizeB = b.metadata?.size || 0;
        return sizeB - sizeA;
      }
      return 0;
    });

    return list;
  }, [files, searchQuery, sortBy]);

  const totalSize = useMemo(() => {
    return files.reduce((acc, f) => acc + (f.metadata?.size || 0), 0);
  }, [files]);

  const formatBytes = (bytes?: number) => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "-";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "-";
    }
  };

  const isImageFile = (name: string) => {
    return /\.(jpg|jpeg|png|webp|svg|gif|avif)$/i.test(name);
  };

  const isPdfFile = (name: string) => {
    return /\.pdf$/i.test(name);
  };

  const isArchiveFile = (name: string) => {
    return /\.(zip|rar|7z|tar|gz)$/i.test(name);
  };

  // Loading Screen
  if (authStatus === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="size-5 border-2 border-cyan-200 border-t-transparent animate-spin" />
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.24em] text-white/50">
            Authenticating Session...
          </p>
        </div>
      </main>
    );
  }

  // Locked Screen
  if (authStatus === "unauthenticated") {
    return (
      <main className="min-h-screen flex items-center justify-center p-3 sm:p-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm border border-white/15 bg-[#020807] p-5 sm:p-7 shadow-2xl"
        >
          <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-cyan-200/80">
              Private Storage
            </span>
            <span className="border border-white/10 px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-[0.16em] text-white/50">
              Locked
            </span>
          </div>

          <div className="mb-4">
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              Who am I?
            </h1>
            <p className="mt-2 text-xs leading-5 text-white/60">
              Unlock access to personal cloud drive in Supabase Storage (`media/drive`).
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-3.5">
            <div>
              <label
                htmlFor="whoami-page-passcode"
                className="mb-1.5 block text-[0.62rem] font-bold uppercase tracking-[0.18em] text-white/60"
              >
                Access Passcode
              </label>
              <input
                id="whoami-page-passcode"
                type="password"
                autoFocus
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  if (authError) setAuthError(null);
                }}
                placeholder="••••••••••••"
                className="w-full border border-white/20 bg-white/[0.035] px-3.5 py-2.5 text-xs font-mono text-white placeholder-white/20 outline-none transition focus:border-cyan-200"
              />
            </div>

            {authError && (
              <div className="border border-rose-500/40 bg-rose-500/10 p-2.5 text-xs text-rose-300">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={authSubmitting}
              className="w-full border border-cyan-200/70 bg-cyan-200 py-2.5 text-xs font-black uppercase tracking-[0.16em] !text-black transition hover:bg-white hover:!text-black disabled:opacity-50"
            >
              {authSubmitting ? "Verifying..." : "Unlock Vault"}
            </button>
          </form>
        </motion.div>
      </main>
    );
  }

  // Authenticated Dashboard
  return (
    <main className="min-h-screen px-3 py-4 sm:px-6 sm:py-8 md:px-8 md:py-12 max-w-7xl mx-auto">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="fixed top-4 right-4 z-50 border border-cyan-200/60 bg-[#020807] px-3.5 py-2 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-cyan-200 shadow-2xl"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Controls: 3 Sejajar, Height sama persis, Tanpa Back button */}
      <div className="mb-4 sm:mb-6 grid grid-cols-3 gap-2 sm:gap-3 border-b border-white/10 pb-3 sm:pb-5">
        <div className="flex h-10 sm:h-11 items-center justify-center border border-white/10 bg-white/[0.035] px-2 text-center text-[0.62rem] sm:text-xs font-bold uppercase tracking-[0.14em] text-cyan-200/90 truncate">
          <span className="truncate">media / drive</span>
        </div>

        <button
          type="button"
          onClick={fetchFiles}
          disabled={loadingFiles}
          className="flex h-10 sm:h-11 items-center justify-center border border-white/20 bg-transparent px-2 text-center text-[0.62rem] sm:text-xs font-bold uppercase tracking-[0.14em] text-white/80 transition hover:border-white/50 hover:text-white disabled:opacity-50"
        >
          <span>{loadingFiles ? "Refreshing..." : "Refresh"}</span>
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="flex h-10 sm:h-11 items-center justify-center border border-rose-500/40 bg-transparent px-2 text-center text-[0.62rem] sm:text-xs font-bold uppercase tracking-[0.14em] text-rose-300 transition hover:border-rose-400 hover:bg-rose-500/10"
        >
          <span>Lock Vault</span>
        </button>
      </div>

      {/* Hero Section of Whoami - Compact on Mobile */}
      <div className="mb-4 sm:mb-6">
        <p className="mb-1 text-[0.62rem] sm:text-xs font-bold uppercase tracking-[0.18em] text-cyan-200/80">
          Private Vault
        </p>
        <h1 className="text-2xl sm:text-4xl md:text-6xl font-black leading-none text-white uppercase tracking-tight">
          Personal Cloud Drive.
        </h1>
        <p className="mt-1.5 text-xs text-white/60 leading-5 max-w-xl">
          Direct asset storage in bucket <code className="text-cyan-200">media/drive</code>. Upload, inspect, download, and copy links flexibly.
        </p>
      </div>

      {/* Metrics Grid - Compact height */}
      <div className="mb-4 sm:mb-6 grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        <div className="border border-white/10 bg-white/[0.035] p-2.5 sm:p-4">
          <p className="text-[0.58rem] sm:text-[0.65rem] font-bold uppercase tracking-[0.16em] text-cyan-200/70">
            Total Files
          </p>
          <p className="mt-1 text-xl sm:text-3xl font-black text-white">
            {files.length}
          </p>
        </div>

        <div className="border border-white/10 bg-white/[0.035] p-2.5 sm:p-4">
          <p className="text-[0.58rem] sm:text-[0.65rem] font-bold uppercase tracking-[0.16em] text-cyan-200/70">
            Total Size
          </p>
          <p className="mt-1 text-xl sm:text-3xl font-black text-white">
            {formatBytes(totalSize)}
          </p>
        </div>

        <div className="border border-white/10 bg-white/[0.035] p-2.5 sm:p-4">
          <p className="text-[0.58rem] sm:text-[0.65rem] font-bold uppercase tracking-[0.16em] text-cyan-200/70">
            Target Bucket
          </p>
          <p className="mt-1 text-lg sm:text-2xl font-black text-white truncate">
            media
          </p>
        </div>

        <div className="border border-white/10 bg-white/[0.035] p-2.5 sm:p-4">
          <p className="text-[0.58rem] sm:text-[0.65rem] font-bold uppercase tracking-[0.16em] text-cyan-200/70">
            Target Subfolder
          </p>
          <p className="mt-1 text-lg sm:text-2xl font-black text-cyan-200 truncate">
            /drive
          </p>
        </div>
      </div>

      {/* Error alert if any */}
      {filesError && (
        <div className="mb-4 sm:mb-6 border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300">
          <strong className="font-bold uppercase tracking-wider block mb-0.5">Notice:</strong>
          {filesError}
        </div>
      )}

      {/* Drag & Drop Upload Panel - Compact height */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          if (e.dataTransfer.files) {
            handleFileUpload(e.dataTransfer.files);
          }
        }}
        className={`mb-4 sm:mb-6 border-2 border-dashed p-4 sm:p-6 md:p-8 text-center transition ${
          isDragOver
            ? "border-cyan-200 bg-cyan-200/10"
            : "border-white/20 bg-white/[0.02] hover:border-white/40 hover:bg-white/[0.03]"
        }`}
      >
        <input
          ref={fileInputRef}
          id={fileInputId}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) {
              handleFileUpload(e.target.files);
            }
          }}
        />

        <div className="flex flex-col items-center justify-center gap-2 sm:gap-3">
          <p className="text-[0.58rem] sm:text-[0.68rem] font-bold uppercase tracking-[0.18em] text-cyan-200/80">
            Storage Upload Area
          </p>
          <h2 className="text-sm sm:text-lg md:text-xl font-black uppercase text-white">
            {uploading ? uploadProgress : "Drop files to upload into media/drive"}
          </h2>
          <p className="text-[0.62rem] sm:text-xs text-white/50 max-w-sm">
            Accepts any file formats. Files accessible via direct CDN link.
          </p>

          <label
            htmlFor={fileInputId}
            className={`mt-1 border border-cyan-200/70 bg-cyan-200 px-4 py-2 sm:px-5 sm:py-2.5 text-[0.68rem] sm:text-xs font-black uppercase tracking-[0.14em] !text-black transition hover:bg-white hover:!text-black cursor-pointer ${
              uploading ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            Select Files From Device
          </label>
        </div>
      </div>

      {/* Filter & Search Bar - 1 Baris: Full-width Search + Modern Sort di Kanan */}
      <div className="mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 w-full border-b border-white/10 pb-3 sm:pb-4">
        {/* Search Input Full Width */}
        <div className="relative flex-1 min-w-0">
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
            <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files by name..."
            className="h-10 w-full border border-white/15 bg-white/[0.03] pl-9 pr-8 text-xs text-white placeholder-white/30 outline-none transition hover:border-white/25 focus:border-cyan-200 focus:bg-white/[0.05]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-white/40 transition hover:text-white"
              title="Clear search"
            >
              <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Modern Sort Dropdown di Kanan */}
        <div className="relative shrink-0">
          <select
            id="whoami-sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "newest" | "oldest" | "name" | "size")}
            className="h-10 cursor-pointer appearance-none border border-white/15 bg-[#020807] pl-3 pr-8 text-[0.68rem] sm:text-xs font-bold uppercase tracking-wider text-white outline-none transition hover:border-white/30 focus:border-cyan-200"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="name">Name (A-Z)</option>
            <option value="size">Size</option>
          </select>
          <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-cyan-200/80">
            <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* File List Grid - Compact Card Layout */}
      {loadingFiles ? (
        <div className="border border-white/10 bg-white/[0.02] p-10 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/50">
            Loading Storage Contents...
          </p>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="border border-white/10 bg-white/[0.02] p-10 text-center">
          <h3 className="text-base font-black uppercase text-white">No Files Found</h3>
          <p className="text-xs text-white/50 mt-1 uppercase tracking-wider">
            {searchQuery ? "No files match your search filter." : "The drive folder is currently empty. Drop files above to upload."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredFiles.map((file, index) => (
            <motion.article
              key={file.name}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02, duration: 0.35 }}
              className="border border-white/10 bg-white/[0.035] p-3 sm:p-4 flex flex-col justify-between transition hover:border-white/30"
            >
              <div>
                {/* Media Preview Box */}
                <div className="relative aspect-[16/9] overflow-hidden bg-black/60 border border-white/5 mb-2.5">
                  {isImageFile(file.name) ? (
                    <Image
                      src={file.publicUrl}
                      alt={file.name}
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="(min-width: 1024px) 30rem, 100vw"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center p-3 text-center">
                      <span className="text-[0.58rem] sm:text-[0.62rem] font-bold uppercase tracking-[0.18em] text-cyan-200/80 mb-1">
                        {isPdfFile(file.name)
                          ? "PDF Document"
                          : isArchiveFile(file.name)
                            ? "Compressed Archive"
                            : "Asset File"}
                      </span>
                      <span className="text-[0.68rem] font-mono text-white/50 truncate max-w-full">
                        {file.name}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mb-1.5 flex items-center justify-between gap-2 text-[0.58rem] sm:text-[0.62rem] font-bold uppercase tracking-[0.14em] text-white/50">
                  <span>{formatDate(file.created_at)}</span>
                  <span>{formatBytes(file.metadata?.size)}</span>
                </div>

                <h3 className="break-all text-xs sm:text-sm font-black leading-snug text-white truncate" title={file.name}>
                  {file.name}
                </h3>
              </div>

              {/* Action Toolbar */}
              <div className="mt-3 grid grid-cols-3 gap-1.5 border-t border-white/10 pt-2.5">
                <button
                  type="button"
                  onClick={() => handleCopyLink(file.publicUrl)}
                  className="border border-white/20 py-1.5 text-[0.62rem] sm:text-[0.68rem] font-black uppercase tracking-[0.1em] text-white transition hover:border-cyan-200 hover:text-cyan-200 text-center"
                >
                  Copy Link
                </button>

                <a
                  href={file.publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="border border-white/20 py-1.5 text-[0.62rem] sm:text-[0.68rem] font-black uppercase tracking-[0.1em] text-white transition hover:border-cyan-200 hover:text-cyan-200 text-center flex items-center justify-center"
                >
                  Open
                </a>

                <button
                  type="button"
                  onClick={() => setConfirmDeleteFile(file)}
                  disabled={deletingFileName === file.name}
                  className="border border-rose-500/40 py-1.5 text-[0.62rem] sm:text-[0.68rem] font-black uppercase tracking-[0.1em] text-rose-300 transition hover:border-rose-400 hover:bg-rose-500/10 text-center disabled:opacity-40"
                >
                  Delete
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      )}

      {/* Delete Confirmation Box */}
      <AnimatePresence>
        {confirmDeleteFile && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmDeleteFile(null)}
              className="fixed inset-0 bg-black/85 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative w-full max-w-sm border border-white/15 bg-[#020807] p-5 sm:p-6 shadow-2xl"
            >
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-rose-400">
                Confirm Deletion
              </p>
              <h4 className="mt-1.5 text-xl font-black uppercase text-white">
                Delete File?
              </h4>
              <p className="mt-2 text-xs leading-5 text-white/70">
                Are you sure you want to permanently remove{" "}
                <span className="text-white font-mono break-all">{confirmDeleteFile.name}</span>{" "}
                from Supabase Storage (<code className="text-cyan-200">media/drive</code>)?
              </p>
              <div className="mt-5 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setConfirmDeleteFile(null)}
                  className="border border-white/20 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white/70 transition hover:border-white/40 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteFile(confirmDeleteFile.name)}
                  className="border border-rose-500/70 bg-rose-600 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-white transition hover:bg-rose-500"
                >
                  Delete Permanently
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
