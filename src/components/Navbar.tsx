"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type NavbarProps = {
  initials: string;
  name: string;
};

const navItems = [
  { href: "#resume", label: "Resume" },
  { href: "#tech-stack", label: "Stack" },
  { href: "#projects", label: "Projects" },
  { href: "#events", label: "Events" },
];

export default function Navbar({ initials, name }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <header className="fixed left-0 right-0 top-0 z-40 px-4 py-3 md:px-8 md:py-4">
      <nav
        aria-label="Primary navigation"
        className="mx-auto flex max-w-7xl items-center justify-between border-b border-white/10 bg-[#050505]/95"
      >
        <Link
          href="#top"
          className="group flex min-h-14 items-center gap-3 text-sm font-semibold uppercase tracking-[0.22em] text-white md:min-h-16 md:tracking-[0.28em]"
          onClick={closeMenu}
        >
          <span className="relative block size-9 overflow-hidden border border-white/20 bg-white md:size-11">
            <Image
              src="/icon.svg"
              alt={`${name} logo`}
              fill
              priority
              sizes="44px"
              className="object-cover"
            />
          </span>
          <span className="hidden text-white/70 transition group-hover:text-white sm:block">
            {name}
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex md:gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/60 transition hover:text-white md:px-4"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <button
          type="button"
          className="grid size-10 place-items-center border border-white/15 text-white md:hidden"
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((current) => !current)}
        >
          <span className="flex w-5 flex-col gap-1.5">
            <span className="h-px w-full bg-current" />
            <span className="h-px w-full bg-current" />
            <span className="h-px w-full bg-current" />
          </span>
        </button>
      </nav>

      <AnimatePresence>
        {isOpen ? (
          <>
            <motion.button
              type="button"
              aria-label="Close navigation menu"
              className="fixed inset-0 z-40 bg-black/60 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              onClick={closeMenu}
            />
            <motion.aside
              className="fixed right-0 top-0 z-50 flex h-dvh w-[min(20rem,88vw)] flex-col border-l border-white/10 bg-[#050505] px-5 py-4 md:hidden"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <Link
                  href="#top"
                  className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-white"
                  onClick={closeMenu}
                >
                  <span className="relative block size-10 overflow-hidden border border-white/20 bg-white">
                    <Image
                      src="/icon.svg"
                      alt={`${name} logo`}
                      fill
                      sizes="44px"
                      className="object-cover"
                    />
                  </span>
                  <span>{initials}</span>
                </Link>
                <button
                  type="button"
                  className="grid size-9 place-items-center border border-white/15 text-lg leading-none text-white"
                  aria-label="Close navigation menu"
                  onClick={closeMenu}
                >
                  X
                </button>
              </div>

              <div className="flex flex-1 flex-col justify-center gap-3">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.05 + index * 0.04,
                      duration: 0.3,
                      ease: "easeOut",
                    }}
                  >
                    <Link
                      href={item.href}
                      className="flex items-center justify-between border-b border-white/10 py-4 text-lg font-black uppercase tracking-[0.13em] text-white"
                      onClick={closeMenu}
                    >
                      <span>{item.label}</span>
                      <span className="text-sm text-white/40">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>

              <p className="border-t border-white/10 pt-5 text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                {name} Sovianto
              </p>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
