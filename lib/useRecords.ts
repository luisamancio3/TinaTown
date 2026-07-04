"use client";

import { useEffect, useState } from "react";
import { GAMES } from "./games";

export type CharacterRecord = {
  score: number;
  game: string;
};

export type GameLeader = {
  slug: string;
  game: string;
  name: string;
  score: number;
};

export type RecordsData = {
  /** best score per player name (lowercased) across all games */
  byName: Record<string, CharacterRecord>;
  /** current #1 of each game's scoreboard */
  leaders: GameLeader[];
};

type ScoreEntry = { name: string; score: number };

const EMPTY: RecordsData = { byName: {}, leaders: [] };

/**
 * Scoreboard data used around the town: speech bubbles brag about
 * records, and the plaza gossip ticker reports scoreboard leaders.
 */
export function useRecords(): RecordsData {
  const [data, setData] = useState<RecordsData>(EMPTY);

  useEffect(() => {
    let cancelled = false;

    Promise.all(
      GAMES.map(async (game) => {
        try {
          const res = await fetch(`/api/scores?game=${game.slug}`);
          if (!res.ok) return { game, top: [] as ScoreEntry[] };
          const payload = await res.json();
          return { game, top: (payload.top || []) as ScoreEntry[] };
        } catch {
          return { game, top: [] as ScoreEntry[] };
        }
      }),
    ).then((results) => {
      if (cancelled) return;
      const byName: Record<string, CharacterRecord> = {};
      const leaders: GameLeader[] = [];
      for (const { game, top } of results) {
        if (top.length > 0) {
          leaders.push({ slug: game.slug, game: game.title, name: top[0].name, score: top[0].score });
        }
        for (const entry of top) {
          const key = entry.name.toLowerCase();
          if (!byName[key] || entry.score > byName[key].score) {
            byName[key] = { score: entry.score, game: game.title };
          }
        }
      }
      setData({ byName, leaders });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return data;
}
