import type { Metadata } from "next";
import Link from "next/link";
import { WalkingCharacters } from "@/components/WalkingCharacters";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tina Town",
  description: "Widget de livestream + roleta do caos + mini-jogos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <nav className="top-nav" aria-label="Menu principal">
          <Link href="/">Inicio</Link>
          <Link href="/mini-games">Mini-Jogos</Link>
          <Link href="/personagem">Personagem</Link>
        </nav>
        {children}
        <WalkingCharacters />
      </body>
    </html>
  );
}
