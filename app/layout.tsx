import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PolicyProof — Evidence-led control review",
  description: "Turn written policies into reviewable controls and inspect the exact evidence behind every conclusion.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
