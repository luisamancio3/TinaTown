"use client";

import { useEffect, useMemo, useState } from "react";
import { Press_Start_2P } from "next/font/google";
import type { GameLeader } from "@/lib/useRecords";

const pixelFont = Press_Start_2P({ weight: "400", subsets: ["latin"], display: "swap" });

const ROTATE_MS = 7000;
const KNOWN_CITIZENS_KEY = "tinatown-known-citizens";
const KNOWN_LEADERS_KEY = "tinatown-known-leaders";

const FILLER_GOSSIP = [
  "o bruken foi visto perto do cine",
  "o bar nao para de encher",
  "dizem que os gatos mandam na cidade",
  "alguem esqueceu a luz do fliperama acesa",
  "a prefeitura nunca abre",
  "as bandeirinhas sao novas? adorei",
];

type Counter = { command: string; count: number };

/**
 * Plaza gossip ticker: headlines generated from real town data —
 * scoreboard leaders, dethroned champions, new citizens, counters.
 * "Dethroned" and "welcome" items compare against what this browser
 * saw last visit (localStorage), so returning visitors get real news.
 */
export function TownTicker({
  population,
  citizenNames,
  leaders,
  live,
}: {
  population: number;
  citizenNames: string[];
  leaders: GameLeader[];
  live: boolean;
}) {
  const [counters, setCounters] = useState<Counter[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    fetch("/api/counters")
      .then((r) => (r.ok ? r.json() : { counters: [] }))
      .then((data) => setCounters(data.counters || []))
      .catch(() => {});
  }, []);

  const headlines = useMemo(() => {
    const items: string[] = [];

    if (live) items.push("a tina esta AO VIVO AGORA!");

    /* dethroned leaders vs what this browser saw before */
    if (leaders.length > 0) {
      try {
        const prev: Record<string, string> = JSON.parse(
          localStorage.getItem(KNOWN_LEADERS_KEY) || "{}",
        );
        for (const l of leaders) {
          const old = prev[l.slug];
          if (old && old.toLowerCase() !== l.name.toLowerCase()) {
            items.push(`${l.name} roubou o trono de ${old} no ${l.game}!`);
          }
        }
        localStorage.setItem(
          KNOWN_LEADERS_KEY,
          JSON.stringify(Object.fromEntries(leaders.map((l) => [l.slug, l.name]))),
        );
      } catch {
        /* localStorage unavailable */
      }
    }

    /* new citizens since last visit */
    if (citizenNames.length > 0) {
      try {
        const known: string[] = JSON.parse(localStorage.getItem(KNOWN_CITIZENS_KEY) || "[]");
        if (known.length > 0) {
          for (const name of citizenNames) {
            if (!known.includes(name)) items.push(`boas-vindas a ${name}, novo cidadao!`);
          }
        }
        localStorage.setItem(
          KNOWN_CITIZENS_KEY,
          JSON.stringify(Array.from(new Set([...known, ...citizenNames]))),
        );
      } catch {
        /* localStorage unavailable */
      }
    }

    /* scoreboard leaders (up to 3, rotated daily by weekday) */
    const day = new Date().getDay();
    const picked = leaders.slice(day % Math.max(1, leaders.length)).concat(leaders).slice(0, 3);
    for (const l of picked) {
      items.push(`${l.name} lidera o ${l.game} com ${l.score}`);
    }

    /* live counters */
    for (const c of counters.slice(0, 2)) {
      items.push(`ja foram ${c.count} !${c.command}`);
    }

    items.push(`a cidade tem ${population} cidadaos`);

    /* a couple of fillers so the ticker never feels empty */
    const f = day % FILLER_GOSSIP.length;
    items.push(FILLER_GOSSIP[f], FILLER_GOSSIP[(f + 3) % FILLER_GOSSIP.length]);

    return items;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaders, citizenNames.join("|"), counters, population, live]);

  useEffect(() => {
    if (headlines.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % headlines.length), ROTATE_MS);
    return () => clearInterval(t);
  }, [headlines.length]);

  if (headlines.length === 0) return null;

  return (
    <div className="town-ticker" aria-live="off">
      <span className={`town-ticker__label ${pixelFont.className}`}>FOFOCA</span>
      <span key={index} className={`town-ticker__text ${pixelFont.className}`}>
        {headlines[index % headlines.length]}
      </span>
    </div>
  );
}
