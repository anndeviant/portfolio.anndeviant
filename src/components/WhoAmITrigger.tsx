"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function WhoAmITrigger() {
  const [isOpen, setIsOpen] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleOpen = () => {
    setPasscode("");
    setError(null);
    setIsSuccess(false);
    setIsOpen(true);
  };

  const handleClose = () => {
    if (loading) return;
    setIsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setError("Please enter the passcode.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/whoami/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: passcode.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Incorrect access code.");
        setLoading(false);
        return;
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push("/whoami");
      }, 500);
    } catch {
      setError("Unable to authenticate. Check connection.");
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="w-fit text-left text-[1rem] font-medium text-white/86 transition hover:text-cyan-200 md:text-[1.05rem] cursor-pointer"
      >
        Who am I?
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 bg-black/85 backdrop-blur-sm"
            />

            {/* Modal Dialog - Editorial Sharp Brutalist Style */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-md border border-white/15 bg-[#020807] p-6 shadow-2xl md:p-8"
              role="dialog"
              aria-modal="true"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={handleClose}
                className="absolute right-5 top-5 border border-white/15 p-1.5 text-white/50 transition hover:border-white/40 hover:text-white"
                aria-label="Close"
              >
                <svg
                  className="size-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <div className="mb-6">
                <p className="mb-2 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-cyan-200/80">
                  Private Identification
                </p>
                <h3 className="text-3xl font-black uppercase tracking-tight text-white md:text-4xl">
                  Who am I?
                </h3>
                <p className="mt-3 text-sm leading-6 text-white/60">
                  Enter your secret passcode to unlock and manage assets in the private storage drive.
                </p>
              </div>

              {isSuccess ? (
                <div className="border border-emerald-500/30 bg-emerald-500/10 p-5 text-center">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">
                    Access Granted
                  </p>
                  <p className="mt-1 text-xs text-white/60">
                    Opening vault...
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="vault-passcode-input"
                      className="mb-2 block text-[0.65rem] font-bold uppercase tracking-[0.18em] text-white/60"
                    >
                      Passcode
                    </label>
                    <input
                      id="vault-passcode-input"
                      type="password"
                      autoFocus
                      value={passcode}
                      onChange={(e) => {
                        setPasscode(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="••••••••••••"
                      className="w-full border border-white/20 bg-white/[0.035] px-4 py-3 text-sm font-mono text-white placeholder-white/20 outline-none transition focus:border-cyan-200 focus:bg-white/[0.06]"
                    />
                  </div>

                  {error && (
                    <div className="border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300">
                      {error}
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={loading}
                      className="border border-white/20 px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white/70 transition hover:border-white/40 hover:text-white disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 border border-cyan-200/70 bg-cyan-200 py-3 text-xs font-black uppercase tracking-[0.16em] !text-black transition hover:bg-white hover:!text-black disabled:opacity-50"
                    >
                      {loading ? "Verifying..." : "Unlock Vault"}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
