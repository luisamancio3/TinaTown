"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Press_Start_2P } from "next/font/google";
import { PixelHuman, PixelCat } from "@/components/WalkingCharacters";
import { useLiveStatus } from "@/lib/useLiveStatus";
import {
  deriveCharacterColors,
  type HumanColors,
  type HairStyle,
  type Accessory,
} from "@/lib/colors";

const pixelFont = Press_Start_2P({ weight: "400", subsets: ["latin"], display: "swap" });

/* ── deterministic hash so walk params survive re-renders/hydration ── */
function hashString(s: string): number {
  let h = 7;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ── clickable building wrapper (keyboard accessible) ────── */
function Building({
  label,
  onActivate,
  children,
}: {
  label: string;
  onActivate: () => void;
  children: React.ReactNode;
}) {
  return (
    <g
      className="town__building"
      role="link"
      tabIndex={0}
      aria-label={label}
      onClick={onActivate}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onActivate();
        }
      }}
    >
      <title>{label}</title>
      {children}
    </g>
  );
}

/* ── walking citizen inside the town street ──────────────── */
type Walker = {
  id: string;
  kind: "human" | "cat";
  name: string;
  colors?: HumanColors;
  hairStyle?: HairStyle;
  accessory?: Accessory;
};

function TownWalker({ walker, isMe }: { walker: Walker; isMe: boolean }) {
  const [frame, setFrame] = useState<0 | 1>(0);

  useEffect(() => {
    const t = setInterval(() => setFrame((f) => (f === 0 ? 1 : 0)), 200);
    return () => clearInterval(t);
  }, []);

  const h = hashString(walker.id);
  const dur = 26 + (h % 22);
  const delay = -(h % dur);
  const goesLeft = h % 2 === 1;
  const bottom = 1 + ((h >> 3) % 3) * 1.8;

  return (
    <div
      className={`town-walker${goesLeft ? " town-walker--left" : ""}${isMe ? " town-walker--me" : ""}`}
      style={{ animationDuration: `${dur}s`, animationDelay: `${delay}s`, bottom: `${bottom}%` }}
      aria-hidden
    >
      {isMe && <span className={`town-walker__me-tag ${pixelFont.className}`}>voce</span>}
      <span className={`town-walker__name ${pixelFont.className}`}>{walker.name}</span>
      <div className="town-walker__sprite">
        {walker.kind === "human" ? (
          <PixelHuman
            frame={frame}
            colors={walker.colors}
            hairStyle={walker.hairStyle || "longo"}
            accessory={walker.accessory || "nenhum"}
          />
        ) : (
          <PixelCat frame={frame} />
        )}
      </div>
    </div>
  );
}

/* ── user character from API ─────────────────────────────── */
type UserCharacter = {
  id: string;
  name: string;
  skin: string;
  hair: string;
  shirt: string;
  pants: string;
  eye?: string;
  hairStyle?: HairStyle;
  accessory?: Accessory;
  pending?: boolean;
};

const RESIDENTS: Walker[] = [
  { id: "resident-fruttinha", kind: "human", name: "Fruttinha" },
  { id: "resident-yuri", kind: "cat", name: "Yuri alberto" },
  { id: "resident-safira", kind: "cat", name: "Safira" },
];

export function TownMap() {
  const router = useRouter();
  const liveStatus = useLiveStatus();
  const [userChars, setUserChars] = useState<UserCharacter[]>([]);
  const [approvedCount, setApprovedCount] = useState<number | null>(null);
  const [myId, setMyId] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("tinatown-char-id");
    setMyId(id);

    const qs = id ? `?clientId=${encodeURIComponent(id)}` : "";
    fetch(`/api/characters${qs}`)
      .then((r) => r.json())
      .then((data) => {
        const chars: UserCharacter[] = data.characters || [];
        setApprovedCount(chars.filter((c) => !c.pending).length);
        setUserChars(chars.slice(0, 14));
      })
      .catch(() => {
        /* town still stands without citizens */
      });
  }, []);

  const isNight = liveStatus === "online";
  const walkers: Walker[] = [
    ...RESIDENTS,
    ...userChars.map((ch) => ({
      id: ch.id,
      kind: "human" as const,
      name: ch.name,
      colors: deriveCharacterColors(ch),
      hairStyle: ch.hairStyle,
      accessory: ch.accessory,
    })),
  ];
  const population = 3 + (approvedCount ?? 0);

  return (
    <section className={`town ${isNight ? "town--night" : "town--day"}`} aria-label="Mapa da TinaTown">
      <h2 className="visually-hidden">Mapa da TinaTown</h2>

      <div className="town-scroll">
        <div className="town-canvas">
          <svg
            className="town__scene"
            viewBox="0 0 1200 640"
            preserveAspectRatio="xMidYMid meet"
            role="presentation"
          >
            {/* ===== SKY ===== */}
            <rect className="town__sky" x="0" y="0" width="1200" height="584" />

            {/* stars (night only) */}
            <g className="town__stars">
              {[
                [100, 60, 2], [220, 120, 1.5], [340, 50, 2], [480, 95, 1.5],
                [640, 60, 2], [760, 130, 1.5], [880, 42, 2], [1010, 110, 1.5],
                [1130, 155, 2], [160, 190, 1.5], [560, 170, 2], [920, 185, 1.5],
              ].map(([cx, cy, r], i) => (
                <circle key={i} className={`town__star town__star--${i % 3}`} cx={cx} cy={cy} r={r} />
              ))}
            </g>

            {/* sun / moon */}
            <circle className="town__sun" cx="1080" cy="90" r="36" />
            <g className="town__moon">
              <circle cx="1080" cy="90" r="30" fill="#f2edd7" />
              <circle cx="1092" cy="82" r="24" className="town__moon-hole" />
            </g>

            {/* clouds */}
            <g className="town__cloud town__cloud--a">
              <ellipse cx="230" cy="105" rx="52" ry="18" />
              <ellipse cx="272" cy="94" rx="38" ry="15" />
              <ellipse cx="192" cy="94" rx="30" ry="12" />
            </g>
            <g className="town__cloud town__cloud--b">
              <ellipse cx="830" cy="150" rx="46" ry="16" />
              <ellipse cx="868" cy="140" rx="32" ry="13" />
            </g>

            {/* hills + ground */}
            <ellipse className="town__hill" cx="600" cy="565" rx="390" ry="92" />
            <ellipse className="town__hill" cx="1060" cy="572" rx="290" ry="74" />
            <rect className="town__grass" x="0" y="500" width="1200" height="60" />

            {/* ===== BUILDINGS ===== */}

            {/* Fliperama → mini-games hub */}
            <Building label="Fliperama — mini-jogos" onActivate={() => router.push("/mini-games")}>
              <rect className="town__wall town__wall--fliperama" x="40" y="300" width="200" height="260" />
              <rect x="30" y="286" width="220" height="18" fill="#3d2b80" />
              <rect x="56" y="316" width="168" height="40" rx="4" fill="#14101f" stroke="#3d2b80" strokeWidth="2" />
              <text
                className={pixelFont.className}
                x="140" y="338" fontSize="14" fill="#ffd95e"
                textAnchor="middle" dominantBaseline="middle"
              >
                FLIPERAMA
              </text>
              <circle className="town__bulb town__bulb--a" cx="64" cy="336" r="4" />
              <circle className="town__bulb town__bulb--b" cx="216" cy="336" r="4" />
              <rect className="town__window" x="64" y="380" width="52" height="40" />
              <rect className="town__window" x="164" y="380" width="52" height="40" />
              <rect className="town__window" x="64" y="440" width="52" height="40" />
              <rect className="town__window" x="164" y="440" width="52" height="40" />
              <rect x="112" y="496" width="56" height="64" fill="#241a48" />
              <rect x="130" y="516" width="20" height="14" fill="#3d2b80" />
            </Building>

            {/* Bar da Tina → Tina Bebe */}
            <Building label="Bar da Tina — jogo Tina Bebe" onActivate={() => router.push("/mini-games/tina-bebe")}>
              <rect className="town__wall town__wall--bar" x="270" y="360" width="160" height="200" />
              <rect x="262" y="348" width="176" height="14" fill="#8a3a20" />
              <rect x="286" y="374" width="128" height="32" rx="4" fill="#fff3e0" />
              <text
                className={pixelFont.className}
                x="350" y="392" fontSize="10" fill="#712b13"
                textAnchor="middle" dominantBaseline="middle"
              >
                BAR DA TINA
              </text>
              <rect x="264" y="414" width="172" height="20" fill="#f5f0e6" />
              <rect x="285.5" y="414" width="21.5" height="20" fill="#c9402a" />
              <rect x="328.5" y="414" width="21.5" height="20" fill="#c9402a" />
              <rect x="371.5" y="414" width="21.5" height="20" fill="#c9402a" />
              <rect x="414.5" y="414" width="21.5" height="20" fill="#c9402a" />
              <rect className="town__window" x="290" y="452" width="52" height="44" />
              <rect className="town__window" x="358" y="452" width="52" height="44" />
              <rect x="322" y="504" width="44" height="56" fill="#7a3018" />
            </Building>

            {/* lampposts framing the praca */}
            <g className="town__lamppost">
              <rect x="450" y="440" width="8" height="120" fill="#2f2f3a" />
              <circle className="town__lamp" cx="454" cy="432" r="10" />
            </g>
            <g className="town__lamppost">
              <rect x="742" y="440" width="8" height="120" fill="#2f2f3a" />
              <circle className="town__lamp" cx="746" cy="432" r="10" />
            </g>

            {/* Praca central: telao → live panel */}
            <Building label="Telao da praca — transmissao ao vivo" onActivate={() => scrollToId("live-panel")}>
              <rect x="492" y="400" width="12" height="160" fill="#3f3f4a" />
              <rect x="696" y="400" width="12" height="160" fill="#3f3f4a" />
              <rect x="470" y="250" width="260" height="160" rx="6" fill="#17131f" stroke="#3f3f4a" strokeWidth="3" />
              <rect className="town__screen" x="482" y="262" width="236" height="136" />

              {/* offline screen content */}
              <g className="town__screen-off">
                <text
                  className={pixelFont.className}
                  x="600" y="322" fontSize="16" fill="#55506a"
                  textAnchor="middle" dominantBaseline="middle"
                >
                  OFFLINE
                </text>
                <text
                  className={pixelFont.className}
                  x="600" y="352" fontSize="8" fill="#3f3a52"
                  textAnchor="middle" dominantBaseline="middle"
                >
                  zzz...
                </text>
              </g>

              {/* live screen content */}
              <g className="town__screen-live">
                <rect x="492" y="272" width="78" height="20" rx="3" fill="#e53935" className="town__live-chip" />
                <text
                  className={pixelFont.className}
                  x="531" y="283" fontSize="9" fill="#ffffff"
                  textAnchor="middle" dominantBaseline="middle"
                >
                  AO VIVO
                </text>
                <rect x="570" y="300" width="60" height="18" fill="#141418" />
                <rect x="578" y="318" width="44" height="26" fill="#fef5f0" />
                <rect x="588" y="326" width="5" height="5" fill="#2d6b3f" />
                <rect x="604" y="326" width="5" height="5" fill="#2d6b3f" />
                <rect x="595" y="336" width="10" height="4" fill="#e8a0a0" />
                <rect x="566" y="344" width="68" height="40" fill="#f0f0f5" />
                <rect className="town__eq town__eq--1" x="660" y="340" width="10" height="44" />
                <rect className="town__eq town__eq--2" x="675" y="326" width="10" height="58" />
                <rect className="town__eq town__eq--3" x="690" y="352" width="10" height="32" />
              </g>
            </Building>

            {/* census plaque */}
            <g className="town__plaque">
              <rect x="566" y="472" width="68" height="52" rx="4" fill="#221a38" stroke="#3f3f4a" strokeWidth="2" />
              <text
                className={pixelFont.className}
                x="600" y="492" fontSize="13" fill="#ffd95e"
                textAnchor="middle" dominantBaseline="middle"
              >
                {population}
              </text>
              <text
                className={pixelFont.className}
                x="600" y="510" fontSize="6" fill="#b9b2d9"
                textAnchor="middle" dominantBaseline="middle"
              >
                CIDADAOS
              </text>
            </g>

            {/* Cine Tina → clips */}
            <Building label="Cine Tina — clips da stream" onActivate={() => scrollToId("clips-panel")}>
              <rect className="town__wall town__wall--cine" x="770" y="330" width="180" height="230" />
              <rect x="756" y="346" width="208" height="44" rx="4" fill="#fff0f6" />
              <text
                className={pixelFont.className}
                x="860" y="370" fontSize="14" fill="#8a2b50"
                textAnchor="middle" dominantBaseline="middle"
              >
                CINE TINA
              </text>
              {[790, 822, 854, 886, 918, 950].map((cx, i) => (
                <circle
                  key={cx}
                  className={`town__bulb town__bulb--${i % 2 === 0 ? "a" : "b"}`}
                  cx={cx} cy="340" r="4"
                />
              ))}
              <rect x="794" y="410" width="56" height="72" fill="#17131f" stroke="#943a5e" strokeWidth="2" />
              <rect x="802" y="418" width="40" height="42" fill="#6132c4" />
              <rect x="814" y="430" width="16" height="10" fill="#141418" />
              <rect x="816" y="440" width="12" height="8" fill="#fef5f0" />
              <rect x="870" y="410" width="56" height="72" fill="#17131f" stroke="#943a5e" strokeWidth="2" />
              <rect x="878" y="418" width="40" height="42" fill="#1a5c38" />
              <rect x="888" y="430" width="20" height="12" fill="#8fce5a" />
              <rect x="838" y="500" width="48" height="60" fill="#6d1f3d" />
            </Building>

            {/* Prefeitura (easter egg → admin) */}
            <Building label="Prefeitura" onActivate={() => router.push("/admin")}>
              <path d="M950 486 L979 464 L1008 486 Z" fill="#3f3f4a" />
              <rect x="958" y="486" width="42" height="74" fill="#565664" />
              <rect x="972" y="522" width="16" height="38" fill="#2c2c36" />
              <line x1="979" y1="464" x2="979" y2="442" stroke="#2f2f3a" strokeWidth="3" />
              <rect x="979" y="442" width="16" height="10" fill="#ff4f9d" />
            </Building>

            {/* Salao Personagem → character builder */}
            <Building label="Salao Personagem — crie seu personagem" onActivate={() => router.push("/personagem")}>
              <rect className="town__wall town__wall--salao" x="1020" y="390" width="140" height="170" />
              <rect x="1012" y="378" width="156" height="14" fill="#0a4a36" />
              <rect x="1032" y="404" width="116" height="30" rx="4" fill="#E1F5EE" />
              <text
                className={pixelFont.className}
                x="1090" y="421" fontSize="9" fill="#085041"
                textAnchor="middle" dominantBaseline="middle"
              >
                PERSONAGEM
              </text>
              <rect className="town__window" x="1040" y="448" width="44" height="52" />
              <rect className="town__window" x="1096" y="448" width="44" height="52" />
              <rect x="1062" y="506" width="40" height="54" fill="#0F6E56" />
            </Building>

            {/* bandeirinhas */}
            <g className="town__flags">
              <path d="M240 306 Q355 330 470 266" fill="none" stroke="#d0c8e8" strokeWidth="2" />
              {[
                [274.5, 311.3, "#ff4f9d"], [309, 312.4, "#42d9cf"], [355, 308, "#ffd95e"],
                [401, 296.4, "#8d5dff"], [435.5, 283.3, "#ff4f9d"],
              ].map(([x, y, c], i) => (
                <path key={i} d={`M${(x as number) - 7} ${y} L${(x as number) + 7} ${y} L${x} ${(y as number) + 14} Z`} fill={c as string} />
              ))}
              <path d="M730 270 Q840 350 964 344" fill="none" stroke="#d0c8e8" strokeWidth="2" />
              {[
                [785.9, 304.7, "#42d9cf"], [831.8, 324.7, "#ffd95e"], [878.9, 337.7, "#ff4f9d"],
              ].map(([x, y, c], i) => (
                <path key={i} d={`M${(x as number) - 7} ${y} L${(x as number) + 7} ${y} L${x} ${(y as number) + 14} Z`} fill={c as string} />
              ))}
            </g>

            {/* bushes */}
            <g className="town__bush">
              <circle cx="16" cy="544" r="20" />
              <circle cx="38" cy="550" r="14" />
              <circle cx="1178" cy="546" r="20" />
              <circle cx="1156" cy="552" r="13" />
            </g>

            {/* sidewalk + street */}
            <rect className="town__sidewalk" x="0" y="560" width="1200" height="24" />
            <rect className="town__street" x="0" y="584" width="1200" height="56" />
            {[40, 190, 340, 490, 640, 790, 940, 1090].map((x) => (
              <rect key={x} className="town__dash" x={x} y="608" width="48" height="5" />
            ))}
          </svg>

          {/* walking citizens (HTML layer over the street) */}
          <div className="town__street-chars" aria-hidden>
            {walkers.map((w) => (
              <TownWalker key={w.id} walker={w} isMe={myId !== null && w.id === myId} />
            ))}
          </div>

        </div>
      </div>

      {/* status chip (outside the scroll area so it stays visible on mobile) */}
      <div className={`town__status ${pixelFont.className}`}>
        <span className={`status-dot status-dot--${liveStatus}`} aria-hidden="true" />
        {isNight ? "AO VIVO" : "OFFLINE"}
      </div>
    </section>
  );
}
