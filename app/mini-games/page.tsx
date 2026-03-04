import { GameCarousel } from "@/components/GameCarousel";

export default function MiniGamesPage() {
  return (
    <main className="app-shell">
      <section className="hero">
        <span className="hero__badge">ARCADE</span>
        <h1>Mini-Jogos</h1>
        <p>Escolha um jogo e divirta-se.</p>
      </section>
      <GameCarousel />
    </main>
  );
}
