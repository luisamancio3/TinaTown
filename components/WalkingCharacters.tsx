"use client";

import { forwardRef, useEffect, useState } from "react";
import { Press_Start_2P } from "next/font/google";
import {
  deriveCharacterColors,
  type HumanColors,
  type CharacterStyle,
  type HairStyle,
  type Accessory,
} from "@/lib/colors";

const pixelFont = Press_Start_2P({ weight: "400", subsets: ["latin"], display: "swap" });

const PIXEL = 4;
const CAT_W = 5;
const CAT_H = 6;
const HUMAN_W = 7;
const HUMAN_H = 10;

/* ── default Fruttinha colors (matches original hardcoded values) ── */
const DEFAULT_HUMAN_COLORS: HumanColors = {
  skin: "#fef5f0",
  skinShadow: "#f5e4da",
  hair: "#141418",
  hairDark: "#0a0a0e",
  hairHighlight: "#2a2a32",
  shirt: "#f0f0f5",
  shirtShadow: "#d2d2dc",
  pants: "#2d2d2d",
  lips: "#e8a0a0",
  eyeIris: "#2d6b3f",
  blush: "rgba(255,160,160,0.35)",
};

/** Simple pixel-art white cat (side view), 2 frames for walk bob */
function PixelCat({ frame }: { frame: 0 | 1 }) {
  const bob = frame === 1 ? 1 : 0;
  return (
    <svg
      width={CAT_W * PIXEL}
      height={CAT_H * PIXEL}
      viewBox={`0 0 ${CAT_W * PIXEL} ${CAT_H * PIXEL}`}
      className="walking-char__sprite walking-char__sprite--cat"
      style={{ imageRendering: "pixelated" }}
    >
      <rect x={PIXEL} y={PIXEL * (2 + bob)} width={PIXEL * 2} height={PIXEL * 2} fill="#fff" />
      <rect x={PIXEL * 2} y={PIXEL * (0 + bob)} width={PIXEL * 2} height={PIXEL * 2} fill="#fff" />
      <path d={`M ${PIXEL * 2} ${PIXEL * (0 + bob)} L ${PIXEL * 1.5} ${2} L ${PIXEL} ${PIXEL * (0 + bob)} Z`} fill="#fff" />
      <path d={`M ${PIXEL * 3} ${PIXEL * (0 + bob)} L ${PIXEL * 3.5} ${2} L ${PIXEL * 4} ${PIXEL * (0 + bob)} Z`} fill="#fff" />
      <rect x={0} y={PIXEL * (3 + bob)} width={PIXEL} height={PIXEL} fill="#fff" />
      <rect x={PIXEL * 2 + 2} y={PIXEL * (1 + bob)} width={2} height={2} fill="#333" />
      <rect x={PIXEL * 3} y={PIXEL * (1.5 + bob)} width={2} height={1} fill="#ffb3c6" />
    </svg>
  );
}

/** Pixel rect helper */
function P({ x, y, w = 1, h = 1, fill }: { x: number; y: number; w?: number; h?: number; fill: string }) {
  return <rect x={x * PIXEL} y={y * PIXEL} width={w * PIXEL} height={h * PIXEL} fill={fill} />;
}

/* ── hair renderers (back = behind body, top = over head) ── */

function HairBack({ hs, b, c }: { hs: HairStyle; b: number; c: HumanColors }) {
  switch (hs) {
    case "longo":
      return (
        <>
          <P x={1} y={0.75 + b} w={1} h={9} fill={c.hair} />
          <P x={1} y={3 + b} w={0.5} h={7} fill={c.hairDark} />
          <P x={1.5} y={5 + b} w={0.5} h={5} fill={c.hairHighlight} />
        </>
      );
    case "curto":
      return (
        <>
          <P x={1} y={0.75 + b} w={1} h={3} fill={c.hair} />
          <P x={1} y={2 + b} w={0.5} h={1.5} fill={c.hairDark} />
        </>
      );
    case "rabo":
      return (
        <>
          <P x={1} y={0.75 + b} w={1} h={2.5} fill={c.hair} />
          <P x={1} y={2 + b} w={0.5} h={1} fill={c.hairDark} />
          {/* ponytail hanging down from tie */}
          <P x={0.25} y={3.25 + b} w={0.75} h={4.5} fill={c.hair} />
          <P x={0.25} y={4 + b} w={0.4} h={3.5} fill={c.hairDark} />
          <P x={0.75} y={5 + b} w={0.25} h={2.5} fill={c.hairHighlight} />
        </>
      );
    case "moicano":
      return null;
    case "afro":
      return (
        <>
          <P x={0.5} y={0 + b} w={1.5} h={4.5} fill={c.hair} />
          <P x={0.5} y={1 + b} w={0.5} h={3} fill={c.hairDark} />
        </>
      );
    case "careca":
      return null;
  }
}

function HairTop({ hs, b, c }: { hs: HairStyle; b: number; c: HumanColors }) {
  switch (hs) {
    case "longo":
      return (
        <>
          <P x={1.5} y={0.25 + b} w={3.5} h={0.75} fill={c.hair} />
          <P x={1.5} y={0.5 + b} w={1} h={1} fill={c.hair} />
          <P x={3.5} y={1 + b} w={1.5} h={0.5} fill={c.hair} />
          <P x={4} y={1 + b} w={1} h={0.25} fill={c.hairHighlight} />
          <P x={2} y={0.75 + b} w={0.5} h={1.5} fill={c.hair} />
          <P x={2} y={2.5 + b} w={0.5} h={1.5} fill={c.hairDark} />
        </>
      );
    case "curto":
      return (
        <>
          <P x={1.5} y={0.25 + b} w={3.5} h={0.75} fill={c.hair} />
          <P x={1.5} y={0.5 + b} w={1} h={1} fill={c.hair} />
          <P x={2} y={0.75 + b} w={0.5} h={1} fill={c.hair} />
          <P x={3.5} y={1 + b} w={1.5} h={0.35} fill={c.hair} />
          <P x={4} y={1 + b} w={0.75} h={0.2} fill={c.hairHighlight} />
        </>
      );
    case "rabo":
      return (
        <>
          <P x={1.5} y={0.25 + b} w={3.5} h={0.75} fill={c.hair} />
          <P x={1.5} y={0.5 + b} w={1} h={1} fill={c.hair} />
          <P x={2} y={0.75 + b} w={0.5} h={1} fill={c.hair} />
          <P x={3.5} y={1 + b} w={1.5} h={0.35} fill={c.hair} />
          {/* hair tie */}
          <P x={1} y={2.75 + b} w={0.5} h={0.5} fill={c.hairHighlight} />
        </>
      );
    case "moicano":
      return (
        <>
          {/* tall mohawk spike */}
          <P x={2.5} y={-0.5 + b} w={1.5} h={1.75} fill={c.hair} />
          <P x={3} y={-0.5 + b} w={0.75} h={0.5} fill={c.hairHighlight} />
          {/* connect to head */}
          <P x={2.5} y={0.75 + b} w={1.5} h={0.5} fill={c.hair} />
        </>
      );
    case "afro":
      return (
        <>
          {/* big round puff above and around head */}
          <P x={1} y={-0.5 + b} w={4.5} h={1.5} fill={c.hair} />
          <P x={2} y={-0.75 + b} w={2.5} h={0.5} fill={c.hairHighlight} />
          {/* side puff front */}
          <P x={4.5} y={0.5 + b} w={1} h={2} fill={c.hair} />
          {/* side puff back */}
          <P x={1} y={0.5 + b} w={1} h={1} fill={c.hair} />
        </>
      );
    case "careca":
      return null;
  }
}

/* ── accessory renderer (on top of everything) ───────────── */

function AccessoryLayer({ acc, b, c }: { acc: Accessory; b: number; c: HumanColors }) {
  switch (acc) {
    case "nenhum":
      return null;
    case "oculos":
      return (
        <>
          {/* glasses frame around eye */}
          <rect
            x={PIXEL * 3.7}
            y={PIXEL * (1.6 + b)}
            width={PIXEL * 1.3}
            height={PIXEL * 0.9}
            fill="none"
            stroke="#2d2d2d"
            strokeWidth={0.8}
            rx={0.5}
          />
          {/* arm going back */}
          <rect x={PIXEL * 2.5} y={PIXEL * (1.85 + b)} width={PIXEL * 1.2} height={0.8} fill="#2d2d2d" />
        </>
      );
    case "laco":
      return (
        <>
          {/* bow – left wing */}
          <P x={2.5} y={-0.1 + b} w={0.7} h={0.4} fill={c.shirt} />
          {/* bow – right wing */}
          <P x={3.5} y={-0.1 + b} w={0.7} h={0.4} fill={c.shirt} />
          {/* bow – center knot */}
          <P x={3.1} y={-0.15 + b} w={0.5} h={0.5} fill={c.shirtShadow} />
        </>
      );
    case "bone":
      return (
        <>
          {/* cap crown */}
          <P x={1.5} y={0.1 + b} w={3.5} h={0.65} fill={c.shirt} />
          {/* bill extending forward */}
          <P x={4} y={0.55 + b} w={1.5} h={0.35} fill={c.shirt} />
          <P x={4} y={0.55 + b} w={1.5} h={0.15} fill={c.shirtShadow} />
        </>
      );
    case "bandana":
      return (
        <>
          {/* headband across forehead */}
          <P x={1.5} y={0.85 + b} w={3.5} h={0.35} fill={c.shirt} />
          <P x={1.5} y={1.05 + b} w={3.5} h={0.15} fill={c.shirtShadow} />
        </>
      );
  }
}

/**
 * Parameterized pixel human sprite (side-view, facing right).
 * When no colors prop is given, renders as Fruttinha (original design).
 * Grid: 7×10 pixels.
 */
export const PixelHuman = forwardRef<
  SVGSVGElement,
  {
    frame: 0 | 1;
    colors?: HumanColors;
    style?: CharacterStyle;
    hairStyle?: HairStyle;
    accessory?: Accessory;
  }
>(function PixelHuman(
  { frame, colors, style: charStyle = "feminino", hairStyle = "longo", accessory = "nenhum" },
  ref,
) {
  const c = colors ?? DEFAULT_HUMAN_COLORS;
  const b = frame === 1 ? 0.25 : 0;
  const isFem = charStyle === "feminino";
  const hs = hairStyle;
  const acc = accessory;

  return (
    <svg
      ref={ref}
      width={HUMAN_W * PIXEL}
      height={HUMAN_H * PIXEL}
      viewBox={`0 0 ${HUMAN_W * PIXEL} ${HUMAN_H * PIXEL}`}
      className="walking-char__sprite walking-char__sprite--human"
      style={{ imageRendering: "pixelated" }}
    >
      {/* ===== HAIR – back (behind body) ===== */}
      <HairBack hs={hs} b={b} c={c} />

      {/* ===== BODY – shirt ===== */}
      <P x={2} y={4 + b} w={2} h={3} fill={c.shirt} />
      <P x={2.5} y={5 + b} w={1} h={2} fill={c.shirtShadow} />

      {/* ===== PANTS ===== */}
      <P x={2} y={7 + b} w={2} h={1} fill={c.pants} />

      {/* ===== LEGS ===== */}
      {frame === 0 ? (
        <P x={2.5} y={8 + b} w={1} h={2} fill={c.skin} />
      ) : (
        <>
          <P x={2} y={8 + b} w={1} h={1.5} fill={c.skin} />
          <P x={3} y={8 + b} w={1} h={2} fill={c.skin} />
        </>
      )}

      {/* ===== NECK ===== */}
      <P x={3} y={3.5 + b} w={1} h={0.5} fill={c.skin} />

      {/* ===== HEAD – side profile ===== */}
      <P x={2} y={1 + b} w={3} h={2.5} fill={c.skin} />

      {/* ===== HAIR – top and bangs ===== */}
      <HairTop hs={hs} b={b} c={c} />

      {/* ===== EYE ===== */}
      <rect x={PIXEL * 4} y={PIXEL * (1.85 + b)} width={3} height={3} fill={c.eyeIris} />
      {/* Eyelash (thicker for female) */}
      <rect
        x={PIXEL * 4 - 0.5}
        y={PIXEL * (1.8 + b)}
        width={4}
        height={isFem ? 1 : 0.5}
        fill={hs === "careca" ? "#333" : c.hair}
      />

      {/* ===== BLUSH (female only) ===== */}
      {isFem && <P x={4} y={2.5 + b} w={0.75} h={0.4} fill={c.blush} />}

      {/* ===== LIPS ===== */}
      <rect
        x={PIXEL * 4.25}
        y={PIXEL * (3 + b)}
        width={PIXEL * 0.75}
        height={PIXEL * 0.25}
        fill={isFem ? c.lips : c.skinShadow}
        rx={0.5}
      />

      {/* ===== ARM ===== */}
      {frame === 0 ? (
        <P x={4} y={4.5 + b} w={0.5} h={2} fill={c.skin} />
      ) : (
        <P x={4} y={4 + b} w={0.5} h={2.5} fill={c.skin} />
      )}

      {/* ===== ACCESSORY (on top) ===== */}
      <AccessoryLayer acc={acc} b={b} c={c} />
    </svg>
  );
});

type CharacterKind = "human" | "cat";

interface WalkingCharProps {
  kind: CharacterKind;
  name: string;
  colors?: HumanColors;
  charStyle?: CharacterStyle;
  hairStyle?: HairStyle;
  accessory?: Accessory;
}

function WalkingChar({ kind, name, colors, charStyle, hairStyle, accessory }: WalkingCharProps) {
  const [frame, setFrame] = useState<0 | 1>(0);

  useEffect(() => {
    const t = setInterval(() => setFrame((f) => (f === 0 ? 1 : 0)), 200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="walking-char" aria-hidden>
      <div className="walking-char__sprite-wrap">
        {kind === "human" ? (
          <PixelHuman
            frame={frame}
            colors={colors}
            style={charStyle}
            hairStyle={hairStyle}
            accessory={accessory}
          />
        ) : (
          <PixelCat frame={frame} />
        )}
      </div>
      <span className={`walking-char__title ${pixelFont.className}`}>{name}</span>
    </div>
  );
}

/* ── user character type from API ─────────────────────────── */
type UserCharacter = {
  id: string;
  name: string;
  skin: string;
  hair: string;
  shirt: string;
  pants: string;
  eye?: string;
  style?: CharacterStyle;
  hairStyle?: HairStyle;
  accessory?: Accessory;
};

export function WalkingCharacters() {
  const [userChars, setUserChars] = useState<UserCharacter[]>([]);

  useEffect(() => {
    fetch("/api/characters")
      .then((r) => r.json())
      .then((data) => {
        const chars: UserCharacter[] = data.characters || [];
        /* randomly pick up to 12 if there are more */
        const shuffled = chars.sort(() => Math.random() - 0.5);
        setUserChars(shuffled.slice(0, 12));
      })
      .catch(() => {
        /* graceful fallback — just show defaults */
      });
  }, []);

  /* scale animation duration based on character count */
  const totalChars = 3 + userChars.length;
  const duration = Math.max(25, Math.round(totalChars * 5));

  return (
    <div className="walking-characters" role="presentation">
      <div className="walking-characters__track">
        <div
          className="walking-characters__row"
          style={{ animationDuration: `${duration}s` }}
        >
          <WalkingChar kind="cat" name="Yuri alberto" />
          <WalkingChar kind="cat" name="Safira" />
          <WalkingChar kind="human" name="Fruttinha" />
          {userChars.map((ch) => (
            <WalkingChar
              key={ch.id}
              kind="human"
              name={ch.name}
              colors={deriveCharacterColors(ch)}
              charStyle={ch.style || "feminino"}
              hairStyle={ch.hairStyle || "longo"}
              accessory={ch.accessory || "nenhum"}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
