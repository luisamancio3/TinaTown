import { BingoBoard } from "@/components/BingoBoard";

export default function BingoPage() {
  return (
    <main className="app-shell">
      <header className="hero">
        <div className="hero__badge">LIVE GAME MODE</div>
        <h1>Bingo</h1>
        <p>Bingo do tinaverso com o diciotina</p>
      </header>

      <BingoBoard />
    </main>
  );
}
