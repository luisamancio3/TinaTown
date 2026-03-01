import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fruttinha Chaos Arcade",
  description: "Livestream widget + chaos wheel + risky drinking minigame",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="top-nav" aria-label="Main navigation">
          <Link href="/">Home</Link>
          <Link href="/bingo">Live Bingo</Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
