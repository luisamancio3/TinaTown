"use client";

import { useEffect, useState } from "react";

type Counter = {
  command: string;
  count: number;
};

/* emoji map for known commands — add more as needed */
const EMOJI_MAP: Record<string, string> = {
  arroto: "💨",
  cabelo: "💇",
  peido: "💨",
  risada: "😂",
  grito: "🗣️",
  tombo: "🤸",
  drink: "🍸",
  soco: "👊",
  beijo: "💋",
  choro: "😢",
  danca: "💃",
  susto: "😱",
  sono: "😴",
  raiva: "😤",
  fome: "🍕",
};

function getEmoji(command: string): string {
  return EMOJI_MAP[command.toLowerCase()] ?? "🔢";
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function LiveCounters() {
  const [counters, setCounters] = useState<Counter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const res = await fetch("/api/counters");
        if (!res.ok) return;
        const data = await res.json();
        if (mounted) setCounters(data.counters ?? []);
      } catch {
        /* silently ignore */
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    /* refresh every 60s */
    const timer = setInterval(load, 60_000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  /* don't render the panel at all if no counters and done loading */
  if (!loading && counters.length === 0) return null;

  return (
    <section className="panel">
      <div className="panel__head">
        <h2>Contadores da Live</h2>
      </div>

      {loading ? (
        <p className="helper-text">Carregando contadores...</p>
      ) : (
        <div className="counters">
          {counters.map((c) => (
            <div key={c.command} className="counters__item">
              <span className="counters__emoji">{getEmoji(c.command)}</span>
              <span className="counters__name">!{c.command}</span>
              <span className="counters__value">{formatCount(c.count)}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
