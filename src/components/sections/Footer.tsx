import WhoAmITrigger from "../WhoAmITrigger";
import Link from "next/link";

import { normalizeHref } from "../../lib/data-utils";
import { getProfileContactLinks } from "../../lib/profile-contact";
import type { ProfileRow } from "../../types/database";

type FooterProps = {
  profile: ProfileRow;
};

const footerNavigation = [
  { href: "#top", label: "Home" },
  { href: "#projects", label: "Projects" },
  { href: "#resume", label: "Experiences" },
];

export default function Footer({ profile }: FooterProps) {
  const name = profile.name ?? "Annas Sovianto";
  const displayName = name.toLowerCase().includes("sovianto")
    ? name
    : `${name} Sovianto`;
  const description =
    "Software engineer delivering thoughtful digital products through clean code, scalable systems, and purposeful design.";
  const contactLinks = getProfileContactLinks(profile);
  const locationLabel = profile.location ?? "Yogyakarta, Indonesia";
  const locationHref = normalizeHref(profile.location_link);
  const year = new Date().getFullYear();
  const locationIndicator = (
    <span className="relative inline-flex size-2.5 items-center justify-center">
      <span className="absolute inset-0 rounded-full bg-emerald-400/70 animate-ping" />
      <span className="relative size-2 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.85)]" />
    </span>
  );

  return (
    <footer className="relative px-4 pb-8 pt-2 md:px-8 md:pb-12 md:pt-6">
      <div className="mx-auto px-2 max-w-7xl border-t border-white/10 pt-6 md:pt-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.04fr)_minmax(0,0.96fr)] lg:items-start lg:gap-10">
          <div className="max-w-xl">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.26em] text-cyan-200/72 md:text-[0.68rem]">
              You&apos;re Done! Thank You.
            </p>
            <h2 className="mt-3 text-[2.3rem] font-black uppercase leading-[0.9] tracking-[-0.05em] text-white sm:text-[2.95rem] md:text-[5.4rem] lg:text-[4.2rem]">
              {displayName}
            </h2>
            <p className="mt-4 max-w-lg text-[0.96rem] leading-7 text-white/64 md:text-base md:leading-8">
              {description}
            </p>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)] items-start gap-x-4 sm:gap-x-6 md:gap-x-8 lg:grid-cols-2 lg:gap-x-12">
            <div className="pr-3 text-center sm:pr-5 md:pr-7 lg:pr-0 lg:text-left">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-cyan-200/70 md:text-[0.68rem]">
                Navigate
              </p>
              <div className="mt-4 flex flex-col items-center gap-3 lg:items-start">
                {footerNavigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="w-fit text-[1rem] font-medium text-white/86 transition hover:text-cyan-200 md:text-[1.05rem]"
                  >
                    {item.label}
                  </Link>
                ))}
                <WhoAmITrigger />
              </div>
            </div>

            <div
              className="min-h-full bg-white/14 lg:hidden"
              aria-hidden="true"
            />

            <div className="pl-3 text-center sm:pl-5 md:pl-7 lg:pl-0 lg:text-left">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-cyan-200/70 md:text-[0.68rem]">
                Connect
              </p>
              <div className="mt-4 flex flex-col items-center gap-3 lg:items-start">
                {contactLinks.map((link) => (
                  <a
                    key={`${link.label}-${link.url}`}
                    href={link.url}
                    target={link.url.startsWith("http") ? "_blank" : undefined}
                    rel={link.url.startsWith("http") ? "noreferrer" : undefined}
                    className="w-fit text-[1rem] font-medium text-white/86 transition hover:text-cyan-200 md:text-[1.05rem]"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 border-t border-white/10 pt-4 text-center md:mt-10 md:pt-5 lg:flex-row lg:items-center lg:justify-between lg:text-left">
          <p className="text-[0.72rem] font-medium tracking-[0.01em] text-white/52 md:text-sm">
            &copy; {year} {displayName}. All rights reserved.
          </p>

          {locationHref ? (
            <a
              href={locationHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-fit items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[0.72rem] font-medium text-white/72 backdrop-blur-sm transition hover:border-white/20 hover:text-white md:text-sm"
            >
              {locationIndicator}
              <span>{locationLabel}</span>
            </a>
          ) : (
            <p className="inline-flex w-fit items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[0.72rem] font-medium text-white/72 backdrop-blur-sm md:text-sm">
              {locationIndicator}
              <span>{locationLabel}</span>
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
