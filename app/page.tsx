import { ClipsSection } from "@/components/ClipsSection";
import { LiveCounters } from "@/components/LiveCounters";
import { LiveStreamWidget } from "@/components/LiveStreamWidget";

export default function Home() {
  return (
    <main className="app-shell">
      <LiveStreamWidget />
      <LiveCounters />
      <ClipsSection />
    </main>
  );
}
