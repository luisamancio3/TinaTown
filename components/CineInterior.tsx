"use client";

import { useEffect, useState } from "react";
/* eslint-disable @next/next/no-img-element */
import { Press_Start_2P } from "next/font/google";
import { CHANNEL, fetchClips, type ClipItem } from "@/lib/clips";

const pixelFont = Press_Start_2P({ weight: "400", subsets: ["latin"], display: "swap" });

export type AudienceMember = {
  id: string;
  hair: string;
  skin: string;
};

const ROTATE_MS = 7000;

/** Inside of the Cine Tina: citizens watching the week's top clips. */
export function CineInterior({ audience }: { audience: AudienceMember[] }) {
  const [clips, setClips] = useState<ClipItem[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchClips("LAST_WEEK").then((data) => {
      if (cancelled) return;
      const top = [...data].sort((a, b) => b.viewCount - a.viewCount).slice(0, 6);
      setClips(top);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  /* rotate the featured clip like movie sessions */
  useEffect(() => {
    if (clips.length < 2) return;
    const t = setInterval(() => setCurrent((c) => (c + 1) % clips.length), ROTATE_MS);
    return () => clearInterval(t);
  }, [clips.length]);

  const clip = clips[current];

  /* seat the audience in rows of 8 (up to 3 rows) */
  const rows: AudienceMember[][] = [];
  for (let i = 0; i < Math.min(audience.length, 24); i += 8) {
    rows.push(audience.slice(i, i + 8));
  }

  return (
    <div className="interior interior--cine">
      <h3 className={`interior__title interior__title--cine ${pixelFont.className}`}>
        CINE TINA
      </h3>
      <p className="interior__hint">Sessao da semana: os clips mais vistos</p>

      <div className="cine-screen">
        {loading ? (
          <div className="cine-screen__empty">
            <span className={pixelFont.className}>CARREGANDO...</span>
          </div>
        ) : clip ? (
          <a
            className="cine-screen__link"
            href={clip.url}
            target="_blank"
            rel="noreferrer"
            aria-label={`Assistir clip: ${clip.title}`}
          >
            <img className="cine-screen__thumb" src={clip.thumbnailURL} alt={clip.title} />
            <span className="cine-screen__banner">
              <span className="cine-screen__clip-title">{clip.title}</span>
              <span className="cine-screen__clip-meta">
                {clip.viewCount.toLocaleString()} visualizacoes · assistir ↗
              </span>
            </span>
          </a>
        ) : (
          <div className="cine-screen__empty">
            <span className={pixelFont.className}>SEM SESSAO HOJE</span>
            <a href={`https://www.twitch.tv/${CHANNEL}/clips`} target="_blank" rel="noreferrer">
              ver clips na Twitch ↗
            </a>
          </div>
        )}
      </div>

      {clips.length > 1 && (
        <div className="cine-dots" role="tablist" aria-label="Clips da sessao">
          {clips.map((c, i) => (
            <button
              key={c.url}
              type="button"
              className={`cine-dots__dot${i === current ? " cine-dots__dot--active" : ""}`}
              onClick={() => setCurrent(i)}
              aria-label={`Clip ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* audience: back of heads in front of the screen */}
      <div className="cine-audience" aria-hidden>
        {rows.map((row, r) => (
          <div key={r} className="cine-audience__row">
            {row.map((member) => (
              <span key={member.id} className="cine-head" style={{ animationDelay: `${(member.id.charCodeAt(0) % 5) * 0.4}s` }}>
                <span className="cine-head__hair" style={{ backgroundColor: member.hair }} />
                <span className="cine-head__neck" style={{ backgroundColor: member.skin }} />
                <span className="cine-head__seat" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
