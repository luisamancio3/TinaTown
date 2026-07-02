import type { Metadata } from "next";
import Link from "next/link";
import { FooterParade } from "@/components/FooterParade";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tina Town",
  description: "A cidadezinha da Fruttinha: livestream, mini-jogos e cidadaos pixelados",
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
        <FooterParade />
      </body>
    </html>
  );
}
