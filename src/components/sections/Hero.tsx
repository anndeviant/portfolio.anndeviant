"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import {
  extractJsonLinks,
  isRecord,
  jsonString,
  normalizeHref,
  splitList,
  splitParagraphs,
  type TextLink,
} from "../../lib/data-utils";
import type { ProfileRow } from "../../types/database";

type HeroProps = {
  profile: ProfileRow;
};

export default function Hero({ profile }: HeroProps) {
  const [activeTitle, setActiveTitle] = useState(0);
  const titles = useMemo(
    () => parseTitles(profile.descriptions),
    [profile.descriptions],
  );
  const summary = useMemo(
    () => splitParagraphs(profile.summary),
    [profile.summary],
  );
  const contactLinks = useMemo(() => getContactLinks(profile), [profile]);

  useEffect(() => {
    if (titles.length < 2) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveTitle((current) => (current + 1) % titles.length);
    }, 2600);

    return () => window.clearInterval(intervalId);
  }, [titles.length]);

  return (
    <section
      id="top"
      className="relative overflow-hidden px-4 pb-16 pt-24 md:px-8 md:py-28"
    >
      <div className="mx-auto grid w-full max-w-7xl gap-8 md:gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
        <motion.div
          className="relative z-10 max-w-5xl"
          initial={{ opacity: 0, y: 34 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="mb-4 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-cyan-200/80 md:mb-5 md:text-xs md:tracking-[0.22em]">
            {profile.location ?? "Indonesia"}
          </p>

          <h1 className="max-w-5xl text-balance text-5xl font-black leading-[0.95] text-white md:text-7xl lg:text-8xl xl:text-9xl">
            {profile.name ?? "Annas"}
          </h1>

          <div className="mt-4 min-h-9 overflow-hidden md:mt-6 md:min-h-12">
            <motion.p
              key={titles[activeTitle]}
              className="text-xl font-semibold leading-snug text-white/80 md:text-3xl lg:text-4xl"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -28 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              {titles[activeTitle]}
            </motion.p>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3 md:mt-8 md:gap-4">
            <a
              href="#projects"
              className="group inline-flex min-h-10 items-center gap-2 border border-cyan-200/70 bg-cyan-200 px-4 text-xs font-black uppercase tracking-[0.12em] !text-black transition hover:bg-white hover:!text-black md:min-h-12 md:gap-3 md:px-5 md:text-sm md:tracking-[0.16em]"
            >
              Explore Work
            </a>
            <a
              href="#resume"
              className="inline-flex min-h-10 items-center border border-white/20 px-4 text-xs font-bold uppercase tracking-[0.12em] text-white/80 transition hover:border-white/50 hover:text-white md:min-h-12 md:px-5 md:text-sm md:tracking-[0.16em]"
            >
              View Timeline
            </a>
          </div>

          <div className="mt-7 max-w-3xl border-l border-white/15 pl-5 md:mt-9 md:pl-6">
            <h2 className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-cyan-100/80 md:text-xs md:tracking-[0.22em]">
              Profile Summary
            </h2>
            <div className="mt-3 space-y-3 text-sm leading-6 text-white/68 md:text-base md:leading-7">
              {summary.slice(0, 2).map((paragraph) => (
                <p key={paragraph} className="text-pretty">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          className="relative mx-auto w-full max-w-[17rem] md:max-w-sm lg:mx-0 lg:max-w-md lg:justify-self-end xl:max-w-[29rem]"
          initial={{ opacity: 0, scale: 0.94, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative aspect-[4/5] max-h-[30rem] overflow-hidden border border-white/10 bg-white/[0.035]">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={`${profile.name ?? "Portfolio owner"} portrait`}
                fill
                priority
                sizes="(min-width: 1024px) 32rem, 90vw"
                className="object-cover"
              />
            ) : (
              <div className="grid h-full place-items-center text-6xl font-black text-white">
                {profile.initials ?? "AS"}
              </div>
            )}
          </div>

          <div className="mt-4 grid gap-2 border-l border-white/10 pl-4 md:mt-5 md:gap-3 md:pl-5">
            {contactLinks.map((link) => (
              <a
                key={`${link.label}-${link.url}`}
                href={link.url}
                target={link.url.startsWith("http") ? "_blank" : undefined}
                rel={link.url.startsWith("http") ? "noreferrer" : undefined}
                className="text-xs font-semibold uppercase tracking-[0.15em] text-white/60 transition hover:text-cyan-200 md:text-sm md:tracking-[0.18em]"
              >
                {link.label}
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function parseTitles(value: string | null): string[] {
  const titles = splitList(value);
  return titles.length > 0 ? titles : ["Software Engineer and AI Builder"];
}

function getContactLinks(profile: ProfileRow): TextLink[] {
  const links: TextLink[] = [];

  const contact = profile.contact;

  if (!isRecord(contact)) {
    return links;
  }

  const email = jsonString(contact.email);
  if (email) {
    links.push({ label: "Email", url: `mailto:${email}` });
  }

  if (isRecord(contact.social)) {
    links.push(...extractJsonLinks(contact.social));
  }

  return links
    .map((link) => ({ ...link, url: normalizeHref(link.url) ?? "" }))
    .filter((link) => link.url.length > 0)
    .sort((left, right) => getContactLinkOrder(left.label) - getContactLinkOrder(right.label));
}

function getContactLinkOrder(label: string): number {
  const normalized = label.trim().toLowerCase();

  switch (normalized) {
    case "linkedin":
      return 0;
    case "email":
      return 1;
    case "github":
      return 2;
    case "x":
      return 3;
    default:
      return 4;
  }
}
