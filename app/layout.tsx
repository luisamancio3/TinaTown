import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fruttinha Chaos Arcade",
  description: "Livestream widget + chaos wheel + risky drinking minigame",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
