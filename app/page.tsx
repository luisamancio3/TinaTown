import { ClipsSection } from "@/components/ClipsSection";
import { LiveCounters } from "@/components/LiveCounters";
import { LiveStreamWidget } from "@/components/LiveStreamWidget";
import { TownMap } from "@/components/TownMap";

export default function Home() {
  return (
    <main className="app-shell">
      <TownMap />
      <LiveStreamWidget />
      <LiveCounters />
      <div id="clips-panel">
        <ClipsSection />
      </div>
    </main>
  );
}
