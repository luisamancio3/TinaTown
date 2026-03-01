import { ChaosWheel } from "@/components/ChaosWheel";
import { DrinkingGame } from "@/components/DrinkingGame";
import { LiveStreamWidget } from "@/components/LiveStreamWidget";

export default function Home() {
  return (
    <main className="app-shell">
      <header className="hero">
        <div className="hero__badge">LIVE TOOLKIT</div>
        <h1>Fruttinha Chaos Arcade</h1>
        <p>
          Future-ready Next.js base with a livestream widget first, plus chaos interactions for
          chat and stream moments.
        </p>
      </header>

      <LiveStreamWidget />
      <ChaosWheel />
      <DrinkingGame />
    </main>
  );
}
