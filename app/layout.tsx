import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PolicyProof — Evidence-led control review",
  description: "A deterministic PolicyProof review fixture for OpenAI Build Week 2026.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
