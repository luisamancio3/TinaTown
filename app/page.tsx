import { ClipsSection } from "@/components/ClipsSection";
import { LiveStreamWidget } from "@/components/LiveStreamWidget";
import { MiniGamesSection } from "@/components/MiniGamesSection";

export default function Home() {
  return (
    <main className="app-shell">
      <LiveStreamWidget />
      <MiniGamesSection />
      <ClipsSection />
    </main>
  );
}
