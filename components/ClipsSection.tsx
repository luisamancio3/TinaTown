"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const CHANNEL = "fruttinhaa";
const TWITCH_GQL_ENDPOINT = "https://gql.twitch.tv/gql";
const TWITCH_PUBLIC_CLIENT_ID = "kimne78kx3ncx6brgo4mv6wki5h1ko";

type ClipItem = {
  url: string;
  title: string;
  thumbnailURL: string;
  viewCount: number;
};

type ClipsQueryResponse = {
  data?: {
    user?: {
      clips?: {
        edges?: Array<{
          node?: ClipItem;
        }>;
      };
    };
  };
};

/* ── filter types ──────────────────────────────────────── */
type Period = "LAST_DAY" | "LAST_WEEK" | "LAST_MONTH" | "ALL_TIME";
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

/* ── fetch function ────────────────────────────────────── */
async function fetchClips(period: Period): Promise<ClipItem[]> {
  const body = [
    {
      operationName: "ClipsSectionQuery",
      variables: { login: CHANNEL, period },
      query:
        "query ClipsSectionQuery($login:String!,$period:ClipsPeriod!){user(login:$login){clips(first:12,criteria:{period:$period}){edges{node{url title thumbnailURL viewCount}}}}}",
    },
  ];

  try {
    const response = await fetch(TWITCH_GQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Client-ID": TWITCH_PUBLIC_CLIENT_ID,
        "Content-Type": "text/plain;charset=UTF-8",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) return [];

    const payload = (await response.json()) as ClipsQueryResponse[];

    return (
      payload?.[0]?.data?.user?.clips?.edges
        ?.map((edge) => edge.node)
        .filter((clip): clip is ClipItem => Boolean(clip?.url && clip?.title)) ?? []
    );
  } catch {
    return [];
  }
}

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
