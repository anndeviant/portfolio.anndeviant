import type { Metadata, Viewport } from "next";

import ParticleBackground from "../components/ParticleBackground";
import SmoothScroll from "../components/SmoothScroll";
import "lenis/dist/lenis.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://portfolio-anndeviant.pages.dev"),
  title: "I'm Annas - Software Engineer and AI Builder | Portfolio",
  description:
    "Annas Portfolio, focused on software engineering, data science, machine learning, and modern web experiences.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "I'm Annas - Software Engineer and AI Builder | Portfolio",
    description:
      "Annas Portfolio, focused on software engineering, data science, machine learning, and modern web experiences.",
    url: "https://portfolio-anndeviant.pages.dev/",
    type: "website",
    siteName: "Annas Portfolio",
    images: [
      {
        url: "/assets/preview-image.png",
        width: 1200,
        height: 630,
        alt: "Annas Sovianto",
      },
    ],
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#050505",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ParticleBackground />
        <div className="relative z-10">
          <SmoothScroll>{children}</SmoothScroll>
        </div>
      </body>
    </html>
  );
}
