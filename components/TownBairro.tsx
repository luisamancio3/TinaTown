"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Press_Start_2P } from "next/font/google";
import { adjustLightness } from "@/lib/colors";
import { pickPhrase } from "@/lib/phrases";
import type { CharacterRecord } from "@/lib/useRecords";

const pixelFont = Press_Start_2P({ weight: "400", subsets: ["latin"], display: "swap" });

export type BairroResident = {
  id: string;
  name: string;
  skin: string;
  hair: string;
  shirt: string;
  pants: string;
  eye?: string;
  pending?: boolean;
  mine?: boolean;
};

const BUBBLE_MS = 4500;

function House({
  resident,
  record,
}: {
  resident: BairroResident;
  record?: CharacterRecord;
}) {
  const [bubble, setBubble] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function talk() {
    const text =
      record && Math.random() < 0.4
        ? `recorde: ${record.score} no ${record.game}`
        : pickPhrase("citizen");
    setBubble(text);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setBubble(null), BUBBLE_MS);
  }

  const roof = adjustLightness(resident.hair, -0.05);
  const wall = resident.shirt;
  const wallShade = adjustLightness(resident.shirt, -0.12);
  const door = resident.pants;
  const windowGlow = resident.eye || "#cfe6f4";

  return (
    <button
      type="button"
      className={`house${resident.mine ? " house--mine" : ""}`}
      onClick={talk}
      aria-label={`Casa de ${resident.name}`}
    >
      {bubble && (
        <span className={`speech-bubble ${pixelFont.className}`} role="status">
          {bubble}
        </span>
      )}
      <svg viewBox="0 0 80 78" className="house__svg" aria-hidden>
        <path d="M0 28 L40 0 L80 28 Z" fill={roof} />
        <rect x="34" y="4" width="8" height="14" fill={wallShade} />
        <rect x="6" y="28" width="68" height="46" fill={wall} />
        <rect x="6" y="28" width="68" height="6" fill={wallShade} />
        <rect x="32" y="50" width="16" height="24" fill={door} />
        <rect x="44" y="60" width="3" height="3" fill="#f6e9b2" />
        <rect x="13" y="38" width="15" height="13" fill={windowGlow} className="house__window" />
        <rect x="52" y="38" width="15" height="13" fill={windowGlow} className="house__window" />
        <rect x="0" y="74" width="80" height="4" fill="#3f7a4f" />
      </svg>
      <span className={`house__plate ${pixelFont.className}`}>
        {resident.name}
        {resident.pending ? " (em analise)" : ""}
      </span>
    </button>
  );
}

export function TownBairro({
  residents,
  records,
}: {
  residents: BairroResident[];
  records: Record<string, CharacterRecord>;
}) {
  return (
    <div className="bairro">
      <div className="bairro__head">
        <h3 className={`bairro__title ${pixelFont.className}`}>BAIRRO DOS CIDADAOS</h3>
        <span className="bairro__count">{residents.length} {residents.length === 1 ? "casa" : "casas"}</span>
      </div>

      {residents.length === 0 ? (
        <p className="bairro__empty">
          O bairro ainda esta vazio.{" "}
          <Link href="/personagem">Crie seu personagem e ganhe sua casinha →</Link>
        </p>
      ) : (
        <div className="bairro__row">
          {residents.map((r) => (
            <House key={r.id} resident={r} record={records[r.name.toLowerCase()]} />
          ))}
        </div>
      )}
    </div>
  );
}
