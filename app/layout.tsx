import type { Metadata } from "next";
import "./globals.css";

const metadataBase = new URL(
  process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000",
);

export const metadata: Metadata = {
  metadataBase,
  title: "PolicyProof — Evidence-led control review",
  description: "Turn written policies into reviewable controls and inspect the exact evidence behind every conclusion.",
  icons: {
    icon: [
      { url: "/brand/favicon.svg", type: "image/svg+xml" },
      { url: "/brand/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/brand/favicon.ico", sizes: "64x64" },
    ],
    apple: [{ url: "/brand/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/brand/site.webmanifest",
  openGraph: {
    title: "PolicyProof — Evidence-led control review",
    description: "Turn written policies into reviewable controls and inspect the exact evidence behind every conclusion.",
    images: [
      {
        url: "/brand/policyproof-social-preview-1200x630.png",
        width: 1200,
        height: 630,
        alt: "PolicyProof",
      },
    ],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
