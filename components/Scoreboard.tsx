"use client";

import { useCallback, useEffect, useState } from "react";

type TopEntry = { name: string; score: number };
type RecentEntry = { name: string; score: number; time: number };

const RANK_COLORS = ["#f0c040", "#c0c0c0", "#cd7f32"];

function timeAgo(ts: number): string {
  const diff = Math.max(0, Date.now() - ts);
  const secs = Math.floor(diff / 1000);
  if (secs < 10) return "agora";
  if (secs < 60) return `${secs}s atras`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins} min atras`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h atras`;
  const days = Math.floor(hrs / 24);
  return `${days}d atras`;
}

export function Scoreboard({ game }: { game: string }) {
  const [top, setTop] = useState<TopEntry[]>([]);
  const [recent, setRecent] = useState<RecentEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"ranking" | "recentes">("ranking");

  const fetchScores = useCallback(() => {
    fetch(`/api/scores?game=${game}`)
      .then((r) => r.json())
      .then((data) => {
        setTop(data.top || []);
        setRecent(data.recent || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [game]);

  useEffect(() => {
    fetchScores();
    const interval = setInterval(fetchScores, 30_000);
    return () => clearInterval(interval);
  }, [fetchScores]);

  return (
    <div className="scoreboard">
      <div className="scoreboard__tabs">
        <button
          className={`chip chip--filter${tab === "ranking" ? " chip--active" : ""}`}
          onClick={() => setTab("ranking")}
        >
          Ranking
        </button>
        <button
          className={`chip chip--filter${tab === "recentes" ? " chip--active" : ""}`}
          onClick={() => setTab("recentes")}
        >
          Recentes
        </button>
      </div>

      {loading ? (
        <p className="helper-text">Carregando placar...</p>
      ) : tab === "ranking" ? (
        <div className="scoreboard__list">
          {top.length === 0 ? (
            <p className="helper-text">Nenhuma pontuacao ainda. Jogue e seja o primeiro!</p>
          ) : (
            top.map((entry, i) => (
              <div key={`${entry.name}-${i}`} className="scoreboard__row">
                <span
                  className="scoreboard__rank"
                  style={{ color: RANK_COLORS[i] || "var(--muted)" }}
                >
                  #{i + 1}
                </span>
                <span className="scoreboard__name">{entry.name}</span>
                <span className="scoreboard__score">
                  {entry.score} {entry.score === 1 ? "ponto" : "pontos"}
                </span>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="scoreboard__list scoreboard__list--scroll">
          {recent.length === 0 ? (
            <p className="helper-text">Nenhuma partida recente.</p>
          ) : (
            recent.map((entry, i) => (
              <div key={`${entry.time}-${i}`} className="scoreboard__row">
                <span className="scoreboard__name">{entry.name}</span>
                <span className="scoreboard__score">
                  {entry.score} {entry.score === 1 ? "ponto" : "pontos"}
                </span>
                <span className="scoreboard__time">{timeAgo(entry.time)}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
