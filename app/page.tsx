import { ClipsSection } from "@/components/ClipsSection";
import { LiveStreamWidget } from "@/components/LiveStreamWidget";

export default function Home() {
  return (
    <main className="app-shell">
      <LiveStreamWidget />
      <ClipsSection />
    </main>
  );
}
