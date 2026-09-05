import { ClipsSection } from "@/components/ClipsSection";
import { LiveCounters } from "@/components/LiveCounters";
import { LiveStreamWidget } from "@/components/LiveStreamWidget";
import { TownMap } from "@/components/TownMap";
import { FrutthonBanner } from "@/components/FrutthonBanner";

export default function Home() {
  return (
    <main className="app-shell">
      <FrutthonBanner />
      <TownMap />
      <LiveStreamWidget />
      <div id="counters-panel">
        <LiveCounters />
      </div>
      <div id="clips-panel">
        <ClipsSection />
      </div>
    </main>
  );
}
