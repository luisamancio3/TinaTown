"use client";

import { useEffect, useState } from "react";
import { GAMES } from "./games";

export type CharacterRecord = {
  score: number;
  game: string;
};

type ScoreEntry = { name: string; score: number };

/**
 * Best score per player name across all games (name, lowercased).
 * Used by speech bubbles: citizens brag about their records when the
 * scoreboard name matches the character name.
 */
export function useRecords(): Record<string, CharacterRecord> {
  const [records, setRecords] = useState<Record<string, CharacterRecord>>({});

  useEffect(() => {
    let cancelled = false;

    Promise.all(
      GAMES.map(async (game) => {
        try {
          const res = await fetch(`/api/scores?game=${game.slug}`);
          if (!res.ok) return { game, top: [] as ScoreEntry[] };
          const data = await res.json();
          return { game, top: (data.top || []) as ScoreEntry[] };
        } catch {
          return { game, top: [] as ScoreEntry[] };
        }
      }),
    ).then((results) => {
      if (cancelled) return;
      const map: Record<string, CharacterRecord> = {};
      for (const { game, top } of results) {
        for (const entry of top) {
          const key = entry.name.toLowerCase();
          if (!map[key] || entry.score > map[key].score) {
            map[key] = { score: entry.score, game: game.title };
          }
        }
      }
      setRecords(map);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return records;
}
