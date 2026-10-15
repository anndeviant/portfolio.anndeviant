import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Who Am I | Personal Drive Vault",
  description: "Private file management vault.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function WhoAmILayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
