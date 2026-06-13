"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useMemo } from "react";

import { normalizeHref, splitBullets } from "../../lib/data-utils";
import type { EducationRow, WorkExperienceRow } from "../../types/database";

type ResumeProps = {
  education: EducationRow[];
  workExperience: WorkExperienceRow[];
};

type TimelineItem = {
  badge: string;
  description: string[];
  endDate: string | null;
  href: string | null;
  id: string;
  kind: "education" | "work";
  location: string | null;
  logoUrl: string | null;
  organization: string;
  role: string;
  startDate: string | null;
};

export default function Resume({ education, workExperience }: ResumeProps) {
  const educationItems = useMemo(
    () =>
      education
        .map(mapEducationItem)
        .sort((first, second) => getSortYear(second) - getSortYear(first)),
    [education],
  );
  const workItems = useMemo(
    () =>
      workExperience
        .map(mapWorkItem)
        .sort((first, second) => getSortYear(second) - getSortYear(first)),
    [workExperience],
  );

  return (
    <section id="resume" className="relative px-4 py-18 md:px-8 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 md:gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="lg:sticky lg:top-28 lg:h-fit">
            <p className="mb-3 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-lime-200/80 md:mb-5 md:text-xs md:tracking-[0.22em]">
              Resume Timeline
            </p>
            <h2 className="max-w-lg text-balance text-4xl font-black leading-[0.95] text-white md:text-8xl">
              Field-tested across AI, web, and networks.
            </h2>
          </div>

          <div className="relative space-y-8 md:space-y-10">
            <ResumeCategory
              count={educationItems.length}
              items={educationItems}
              label="Education"
            />
            <ResumeCategory
              count={workItems.length}
              items={workItems}
              label="Work Experiences"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

type ResumeCategoryProps = {
  count: number;
  items: TimelineItem[];
  label: string;
};

function ResumeCategory({ count, items, label }: ResumeCategoryProps) {
  return (
    <div className="relative">
      <div className="mb-4 flex items-center justify-between gap-4 border-b border-white/10 pb-3 md:mb-6">
        <h3 className="text-sm font-black uppercase tracking-[0.18em] text-white md:text-base">
          {label}
        </h3>
        <span className="border border-white/10 px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-white/50 md:text-xs">
          {count} {count === 1 ? "Entry" : "Entries"}
        </span>
      </div>
      <div
        aria-hidden="true"
        className="absolute left-2 top-14 bottom-2 w-px bg-white/10 md:left-8 md:top-16"
      />
      <div className="space-y-4 md:space-y-6">
        {items.map((item, index) => (
          <TimelineEntry key={item.id} index={index} item={item} />
        ))}
      </div>
    </div>
  );
}

type TimelineEntryProps = {
  index: number;
  item: TimelineItem;
};

function TimelineEntry({ index, item }: TimelineEntryProps) {
  const content = (
    <div className="grid min-w-0 gap-4 border border-white/10 bg-black/30 p-4 transition hover:border-white/25 md:grid-cols-[5rem_1fr] md:gap-5 md:p-6">
      <div className="relative z-10 grid size-14 place-items-center overflow-hidden border border-white/10 bg-white/[0.05] md:size-20">
        {item.logoUrl ? (
          <Image
            src={item.logoUrl}
            alt={`${item.organization} logo`}
            fill
            sizes="5rem"
            className="object-cover"
          />
        ) : (
          <span className="text-xl font-black text-white">
            {item.organization.slice(0, 2)}
          </span>
        )}
      </div>

      <div className="min-w-0">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-white/50 md:mb-4 md:gap-3 md:text-xs md:tracking-[0.16em]">
          <span>{formatRange(item.startDate, item.endDate)}</span>
          <span className="h-px w-5 bg-white/20 md:w-8" />
          <span>{item.badge}</span>
          {item.location ? <span>{item.location}</span> : null}
        </div>

        <h3 className="break-words text-xl font-black leading-tight text-white md:text-3xl">
          {item.organization}
        </h3>
        <p className="mt-2 break-words text-sm font-semibold leading-6 text-cyan-100/80 md:text-base">
          {item.role}
        </p>

        {item.description.length > 0 ? (
          <ul className="mt-4 space-y-3 text-sm leading-7 text-white/70 md:mt-5 md:text-base">
            {item.description.map((description) => (
              <li
                key={description}
                className="grid min-w-0 grid-cols-[0.75rem_1fr] gap-2 md:grid-cols-[1rem_1fr] md:gap-3"
              >
                <span aria-hidden="true" className="mt-3 h-px bg-cyan-200/70" />
                <span className="min-w-0 break-words">{description}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );

  return (
    <motion.div
      className="relative pl-6 md:pl-20"
      initial={{ opacity: 0, x: 36 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{
        delay: index * 0.04,
        duration: 0.68,
        ease: [0.22, 1, 0.36, 1],
      }}
      viewport={{ once: true, amount: 0.1 }}
    >
      <span
        aria-hidden="true"
        className="absolute left-[0.38rem] top-6 z-10 size-2.5 border border-cyan-200 bg-[#050505] md:left-[1.84rem] md:top-7 md:size-3"
      />

      {item.href ? (
        <a href={item.href} target="_blank" rel="noreferrer">
          {content}
        </a>
      ) : (
        content
      )}
    </motion.div>
  );
}

function mapWorkItem(item: WorkExperienceRow): TimelineItem {
  return {
    badge: item.badge ?? "Experience",
    description: splitBullets(item.description),
    endDate: item.end_date,
    href: normalizeHref(item.href),
    id: `work-${item.id}`,
    kind: "work",
    location: item.location,
    logoUrl: item.logo_url,
    organization: item.company ?? "Organization",
    role: item.title ?? "Role",
    startDate: item.start_date,
  };
}

function mapEducationItem(item: EducationRow): TimelineItem {
  return {
    badge: "Education",
    description: [],
    endDate: item.end_date,
    href: normalizeHref(item.href),
    id: `education-${item.id}`,
    kind: "education",
    location: null,
    logoUrl: item.logo_url,
    organization: item.school ?? "School",
    role: item.degree ?? "Degree",
    startDate: item.start_date,
  };
}

function formatRange(startDate: string | null, endDate: string | null): string {
  if (startDate && endDate) {
    return `${startDate} - ${endDate}`;
  }

  return startDate ?? endDate ?? "Present";
}

function getSortYear(item: TimelineItem): number {
  const value = item.endDate ?? item.startDate ?? "0";
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}
