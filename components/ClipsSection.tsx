"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { CHANNEL, fetchClips, type ClipItem, type ClipsPeriod } from "@/lib/clips";

/* ── filter types ──────────────────────────────────────── */
type Period = ClipsPeriod;
type SortOrder = "most" | "least";

const PERIODS: { value: Period; label: string }[] = [
  { value: "LAST_DAY", label: "24h" },
  { value: "LAST_WEEK", label: "Esta Semana" },
  { value: "LAST_MONTH", label: "Este Mes" },
  { value: "ALL_TIME", label: "Todos" },
];

const SORTS: { value: SortOrder; label: string }[] = [
  { value: "most", label: "Mais Vistos" },
  { value: "least", label: "Menos Vistos" },
];

/* ── component ─────────────────────────────────────────── */
export function ClipsSection() {
  const [period, setPeriod] = useState<Period>("LAST_WEEK");
  const [sortOrder, setSortOrder] = useState<SortOrder>("most");
  const [clips, setClips] = useState<ClipItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetchClips(period).then((data) => {
      if (!cancelled) {
        setClips(data);
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [period]);

  /* sort client-side */
  const sorted = [...clips].sort((a, b) =>
    sortOrder === "most" ? b.viewCount - a.viewCount : a.viewCount - b.viewCount
  );

  return (
    <section className="panel" aria-labelledby="clips-title">
      <div className="panel__head">
        <h2 id="clips-title">Clips</h2>
        <a
          className="chip chip--link"
          href={`https://www.twitch.tv/${CHANNEL}/clips`}
          target="_blank"
          rel="noreferrer"
        >
          twitch.tv/{CHANNEL}/clips
        </a>
      </div>

      {/* Filters */}
      <div className="clips-filters">
        <div className="clips-filters__group">
          <span className="clips-filters__label">Periodo</span>
          {PERIODS.map((p) => (
            <button
              key={p.value}
              className={`chip chip--filter${period === p.value ? " chip--active" : ""}`}
              onClick={() => setPeriod(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="clips-filters__group">
          <span className="clips-filters__label">Ordem</span>
          {SORTS.map((s) => (
            <button
              key={s.value}
              className={`chip chip--filter${sortOrder === s.value ? " chip--active" : ""}`}
              onClick={() => setSortOrder(s.value)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <p className="helper-text">Carregando clips...</p>
      ) : sorted.length > 0 ? (
        <div className="clips-grid">
          {sorted.map((clip) => (
            <a
              key={clip.url}
              className="clip-card"
              href={clip.url}
              target="_blank"
              rel="noreferrer"
            >
              <Image
                className="clip-card__thumb"
                src={clip.thumbnailURL}
                alt={clip.title}
                width={640}
                height={360}
                unoptimized
              />
              <div className="clip-card__body">
                <p className="clip-card__title">{clip.title}</p>
                <span className="clip-card__meta">
                  {clip.viewCount.toLocaleString()} visualizacoes
                </span>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <p className="helper-text">
          Nenhum clip encontrado neste periodo. Tente outro filtro ou visite{" "}
          <a
            href={`https://www.twitch.tv/${CHANNEL}/clips`}
            target="_blank"
            rel="noreferrer"
          >
            twitch.tv/{CHANNEL}/clips
          </a>
          .
        </p>
      )}
    </section>
  );
}
