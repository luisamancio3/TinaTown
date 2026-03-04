"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ── virtual canvas size ─────────────────────────────────── */
const W = 160;
const H = 90;

/* ── Tina palette (same as other games) ──────────────────── */
const T_SKIN = "#fef5f0";
const T_SKIN_SH = "#f5e4da";
const T_HAIR = "#141418";
const T_HAIR_DK = "#0a0a0e";
const T_HAIR_HL = "#2a2a32";
const T_SHIRT = "#f0f0f5";
const T_SHIRT_SH = "#d2d2dc";
const T_SHORTS = "#2d2d2d";
const T_LIPS = "#e8a0a0";
const T_EYE = "#2d6b3f";
const T_BLUSH = "rgba(255,160,160,0.35)";

/* ── Lito palette (moreno, buzz-cut) ─────────────────────── */
const L_SKIN = "#c89070";
const L_SKIN_SH = "#b07858";
const L_HAIR = "#2a1a0a";
const L_TANK = "#2a2a3a";
const L_TANK_SH = "#1e1e2a";
const L_SHORTS = "#2a2a3a";
const L_EYE = "#3a2a1a";
const L_BROW = "#1a0e04";
const L_LIPS = "#a07060";

/* ── ring / scene colors ─────────────────────────────────── */
const ARENA_BG = "#0a0a14";
const SPOTLIGHT = "rgba(255,240,200,0.06)";
const ROPE_RED = "#cc3333";
const ROPE_DARK = "#991a1a";
const POST_MAIN = "#d4a830";
const POST_DARK = "#a88020";
const MAT_MAIN = "#c8b898";
const MAT_DARK = "#b8a880";
const MAT_LINE = "#a89878";
const APRON = "#1a1430";

const FLASH_COLOR = "#fff8d0";

/* ── game states ─────────────────────────────────────────── */
type GameState =
  | "idle"
  | "tina_punching"
  | "lito_hit"
  | "lito_punching"
  | "tina_knocked_out"
  | "game_over";

/* ── helpers ──────────────────────────────────────────────── */
function r(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
) {
  ctx.fillStyle = fill;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.min(Math.max(t, 0), 1);
}

/* ── boxing ring background ──────────────────────────────── */
function drawBackground(ctx: CanvasRenderingContext2D) {
  /* dark arena */
  r(ctx, 0, 0, W, H, ARENA_BG);

  /* spotlight glow */
  r(ctx, 40, 0, 80, 35, SPOTLIGHT);
  r(ctx, 50, 0, 60, 20, SPOTLIGHT);

  /* ring apron (sides below mat) */
  r(ctx, 8, 58, 144, 32, APRON);

  /* ring mat (floor) */
  r(ctx, 10, 42, 140, 18, MAT_MAIN);
  r(ctx, 10, 56, 140, 4, MAT_DARK);
  /* center line */
  r(ctx, 79, 44, 2, 14, MAT_LINE);
  /* mat edge highlight */
  r(ctx, 10, 42, 140, 1, "#d8c8a8");

  /* corner posts */
  r(ctx, 10, 28, 4, 32, POST_MAIN);
  r(ctx, 10, 28, 4, 2, "#e8c050");
  r(ctx, 12, 30, 2, 28, POST_DARK);
  r(ctx, 146, 28, 4, 32, POST_MAIN);
  r(ctx, 146, 28, 4, 2, "#e8c050");
  r(ctx, 146, 30, 2, 28, POST_DARK);

  /* ropes (3 horizontal) */
  for (let i = 0; i < 3; i++) {
    const ry = 32 + i * 5;
    r(ctx, 14, ry, 132, 2, ROPE_RED);
    r(ctx, 14, ry + 2, 132, 1, ROPE_DARK);
  }

  /* bottom rope highlight */
  r(ctx, 14, 32, 132, 1, "#e04040");
}

/* ──────────────────────────────────────────────────────────
   TINA — left side, facing right
   Base position: x=25, y=32 (feet on mat ~y=60)
   ────────────────────────────────────────────────────────── */
const TX = 25;
const TY = 32;

function drawTinaIdle(ctx: CanvasRenderingContext2D) {
  const x = TX, y = TY;

  /* hair back */
  r(ctx, x + 1, y, 12, 14, T_HAIR);
  r(ctx, x, y + 2, 14, 10, T_HAIR);
  r(ctx, x, y + 12, 4, 8, T_HAIR);
  r(ctx, x, y + 14, 3, 6, T_HAIR_DK);

  /* head */
  r(ctx, x + 2, y + 2, 10, 10, T_SKIN);
  r(ctx, x + 2, y + 10, 10, 2, T_SKIN_SH);

  /* hair top & bangs */
  r(ctx, x + 1, y, 12, 4, T_HAIR);
  r(ctx, x + 2, y + 1, 3, 1, T_HAIR_HL);
  r(ctx, x + 1, y + 2, 2, 10, T_HAIR);
  r(ctx, x + 2, y + 3, 4, 2, T_HAIR);

  /* eyes (facing right) */
  r(ctx, x + 5, y + 6, 2, 2, "#fff");
  r(ctx, x + 6, y + 6, 1, 2, T_EYE);
  r(ctx, x + 5, y + 5, 3, 1, T_HAIR);
  r(ctx, x + 9, y + 6, 2, 2, "#fff");
  r(ctx, x + 10, y + 6, 1, 2, T_EYE);
  r(ctx, x + 9, y + 5, 3, 1, T_HAIR);

  /* blush & lips */
  r(ctx, x + 4, y + 8, 2, 1, T_BLUSH);
  r(ctx, x + 10, y + 8, 2, 1, T_BLUSH);
  r(ctx, x + 7, y + 9, 3, 1, T_LIPS);

  /* neck */
  r(ctx, x + 5, y + 12, 4, 2, T_SKIN);

  /* body / shirt */
  r(ctx, x + 2, y + 14, 10, 6, T_SHIRT);
  r(ctx, x + 2, y + 18, 10, 2, T_SHIRT_SH);

  /* left arm — fist up (guard) */
  r(ctx, x + 1, y + 12, 2, 4, T_SHIRT);
  r(ctx, x, y + 11, 3, 2, T_SKIN);
  /* right arm — fist forward */
  r(ctx, x + 11, y + 13, 2, 4, T_SHIRT);
  r(ctx, x + 12, y + 12, 3, 2, T_SKIN);

  /* shorts */
  r(ctx, x + 3, y + 20, 8, 3, T_SHORTS);

  /* legs */
  r(ctx, x + 3, y + 23, 3, 4, T_SKIN);
  r(ctx, x + 8, y + 23, 3, 4, T_SKIN);
  r(ctx, x + 2, y + 26, 4, 2, "#2d2d2d");
  r(ctx, x + 8, y + 26, 4, 2, "#2d2d2d");
}

function drawTinaPunching(ctx: CanvasRenderingContext2D, progress: number) {
  const x = TX, y = TY;
  /* body leans forward */
  const leanX = progress < 0.5 ? lerp(0, 4, progress / 0.5) : lerp(4, 0, (progress - 0.5) / 0.5);
  const punchExtend = progress < 0.4 ? lerp(0, 16, progress / 0.4) : lerp(16, 0, (progress - 0.4) / 0.6);

  /* hair back */
  r(ctx, x + 1 + leanX * 0.3, y, 12, 14, T_HAIR);
  r(ctx, x + leanX * 0.3, y + 2, 14, 10, T_HAIR);
  r(ctx, x + leanX * 0.2, y + 12, 4, 8, T_HAIR);

  /* head */
  r(ctx, x + 2 + leanX * 0.5, y + 2, 10, 10, T_SKIN);
  r(ctx, x + 2 + leanX * 0.5, y + 10, 10, 2, T_SKIN_SH);

  /* hair top */
  r(ctx, x + 1 + leanX * 0.3, y, 12, 4, T_HAIR);
  r(ctx, x + 1 + leanX * 0.3, y + 2, 2, 10, T_HAIR);
  r(ctx, x + 2 + leanX * 0.3, y + 3, 4, 2, T_HAIR);

  /* eyes (determined) */
  r(ctx, x + 5 + leanX * 0.5, y + 6, 2, 2, "#fff");
  r(ctx, x + 6 + leanX * 0.5, y + 6, 1, 2, T_EYE);
  r(ctx, x + 5 + leanX * 0.5, y + 5, 3, 1, T_HAIR);
  r(ctx, x + 9 + leanX * 0.5, y + 6, 2, 2, "#fff");
  r(ctx, x + 10 + leanX * 0.5, y + 6, 1, 2, T_EYE);
  r(ctx, x + 9 + leanX * 0.5, y + 5, 3, 1, T_HAIR);

  /* blush & lips */
  r(ctx, x + 4 + leanX * 0.5, y + 8, 2, 1, T_BLUSH);
  r(ctx, x + 10 + leanX * 0.5, y + 8, 2, 1, T_BLUSH);
  r(ctx, x + 7 + leanX * 0.5, y + 9, 3, 1, T_LIPS);

  /* neck */
  r(ctx, x + 5 + leanX * 0.4, y + 12, 4, 2, T_SKIN);

  /* body */
  r(ctx, x + 2 + leanX * 0.3, y + 14, 10, 6, T_SHIRT);
  r(ctx, x + 2 + leanX * 0.3, y + 18, 10, 2, T_SHIRT_SH);

  /* left arm guard */
  r(ctx, x + 1 + leanX * 0.2, y + 12, 2, 4, T_SHIRT);
  r(ctx, x + leanX * 0.2, y + 11, 3, 2, T_SKIN);

  /* right arm — PUNCHING forward */
  const armX = x + 12 + punchExtend;
  r(ctx, x + 11 + leanX * 0.3, y + 14, punchExtend + 3, 2, T_SHIRT);
  r(ctx, armX, y + 13, 4, 3, T_SKIN);

  /* shorts & legs */
  r(ctx, x + 3, y + 20, 8, 3, T_SHORTS);
  r(ctx, x + 3, y + 23, 3, 4, T_SKIN);
  r(ctx, x + 8, y + 23, 3, 4, T_SKIN);
  r(ctx, x + 2, y + 26, 4, 2, "#2d2d2d");
  r(ctx, x + 8, y + 26, 4, 2, "#2d2d2d");
}

function drawTinaKnockedOut(ctx: CanvasRenderingContext2D, progress: number) {
  const x = TX, y = TY;
  const swayPhase = Math.min(progress / 0.35, 1);
  const fallPhase = progress > 0.35 ? (progress - 0.35) / 0.65 : 0;

  const swayX = swayPhase < 1 ? Math.sin(swayPhase * Math.PI * 4) * 3 : 0;
  const recoilX = -fallPhase * 12;
  const bodyDrop = fallPhase * 14;
  const headDrop = fallPhase * 18;
  const ox = swayX + recoilX;

  /* hair */
  r(ctx, x + 1 + ox, y + headDrop, 12, 14, T_HAIR);
  r(ctx, x + ox, y + 2 + headDrop, 14, 10, T_HAIR);
  r(ctx, x + ox, y + 12 + headDrop, 4, Math.max(2, 8 - headDrop * 0.3), T_HAIR);

  /* head */
  r(ctx, x + 2 + ox, y + 2 + headDrop, 10, 10, T_SKIN);
  r(ctx, x + 2 + ox, y + 10 + headDrop, 10, 2, T_SKIN_SH);

  /* hair top */
  r(ctx, x + 1 + ox, y + headDrop, 12, 4, T_HAIR);
  r(ctx, x + 1 + ox, y + 2 + headDrop, 2, 10, T_HAIR);

  /* X eyes */
  const ex = x + ox;
  const ey = y + 6 + headDrop;
  r(ctx, ex + 5, ey, 1, 1, T_HAIR);
  r(ctx, ex + 7, ey, 1, 1, T_HAIR);
  r(ctx, ex + 6, ey + 1, 1, 1, T_HAIR);
  r(ctx, ex + 5, ey + 2, 1, 1, T_HAIR);
  r(ctx, ex + 7, ey + 2, 1, 1, T_HAIR);
  r(ctx, ex + 9, ey, 1, 1, T_HAIR);
  r(ctx, ex + 11, ey, 1, 1, T_HAIR);
  r(ctx, ex + 10, ey + 1, 1, 1, T_HAIR);
  r(ctx, ex + 9, ey + 2, 1, 1, T_HAIR);
  r(ctx, ex + 11, ey + 2, 1, 1, T_HAIR);

  /* blush intense */
  r(ctx, ex + 4, y + 8 + headDrop, 2, 1, "rgba(255,120,120,0.6)");
  r(ctx, ex + 10, y + 8 + headDrop, 2, 1, "rgba(255,120,120,0.6)");
  r(ctx, ex + 7, y + 9 + headDrop, 3, 1, T_LIPS);

  /* neck & body */
  const bt = recoilX * 0.5;
  r(ctx, x + 5 + swayX + bt, y + 12 + bodyDrop * 0.5, 4, 2, T_SKIN);
  r(ctx, x + 2 + swayX + bt * 0.5, y + 14 + bodyDrop * 0.3, 10, 6, T_SHIRT);
  r(ctx, x + 2 + swayX + bt * 0.5, y + 18 + bodyDrop * 0.3, 10, 2, T_SHIRT_SH);

  /* arms floppy */
  r(ctx, x + 1 + swayX + bt * 0.5, y + 14 + bodyDrop * 0.3, 2, 6, T_SHIRT);
  r(ctx, x + swayX + bt * 0.5, y + 19 + bodyDrop * 0.3, 2, 2, T_SKIN);
  r(ctx, x + 11 + swayX + bt * 0.5, y + 14 + bodyDrop * 0.3, 2, 6, T_SHIRT);
  r(ctx, x + 12 + swayX + bt * 0.5, y + 19 + bodyDrop * 0.3, 2, 2, T_SKIN);

  /* shorts & legs */
  r(ctx, x + 3 + swayX * 0.3, y + 20 + bodyDrop * 0.2, 8, 3, T_SHORTS);
  r(ctx, x + 3 + swayX * 0.2, y + 23 + bodyDrop * 0.1, 3, 4, T_SKIN);
  r(ctx, x + 8 + swayX * 0.2, y + 23 + bodyDrop * 0.1, 3, 4, T_SKIN);
  r(ctx, x + 2, y + 26, 4, 2, "#2d2d2d");
  r(ctx, x + 8, y + 26, 4, 2, "#2d2d2d");

  /* dizzy stars */
  if (progress < 0.85) {
    for (let i = 0; i < 3; i++) {
      const sa = progress * Math.PI * 8 + (i * Math.PI * 2) / 3;
      const sx = x + 7 + ox + Math.cos(sa) * 10;
      const sy = y - 2 + headDrop + Math.sin(sa) * 5;
      ctx.globalAlpha = 1 - progress;
      r(ctx, sx, sy, 2, 2, "#f0d060");
      ctx.globalAlpha = 1;
    }
  }
}

/* ──────────────────────────────────────────────────────────
   LITO — right side, facing left
   Base position: x=105, y=32
   ────────────────────────────────────────────────────────── */
const LX = 105;
const LY = 32;

function drawLitoIdle(ctx: CanvasRenderingContext2D) {
  const x = LX, y = LY;

  /* buzz-cut hair (very short, just a cap) */
  r(ctx, x + 1, y + 1, 12, 3, L_HAIR);
  r(ctx, x, y + 2, 14, 2, L_HAIR);

  /* head */
  r(ctx, x + 1, y + 3, 12, 10, L_SKIN);
  r(ctx, x + 1, y + 11, 12, 2, L_SKIN_SH);

  /* eyebrows (thick) */
  r(ctx, x + 3, y + 5, 3, 1, L_BROW);
  r(ctx, x + 8, y + 5, 3, 1, L_BROW);

  /* eyes (facing left) */
  r(ctx, x + 3, y + 6, 2, 2, "#fff");
  r(ctx, x + 3, y + 6, 1, 2, L_EYE);
  r(ctx, x + 9, y + 6, 2, 2, "#fff");
  r(ctx, x + 9, y + 6, 1, 2, L_EYE);

  /* mouth */
  r(ctx, x + 5, y + 10, 4, 1, L_LIPS);

  /* neck (thicker) */
  r(ctx, x + 4, y + 13, 6, 2, L_SKIN);

  /* body / tank top (broader) */
  r(ctx, x + 1, y + 15, 12, 6, L_TANK);
  r(ctx, x + 1, y + 19, 12, 2, L_TANK_SH);

  /* left arm — fist forward (guard) */
  r(ctx, x - 1, y + 13, 2, 4, L_TANK);
  r(ctx, x - 3, y + 12, 3, 3, L_SKIN);
  /* right arm — fist up (guard) */
  r(ctx, x + 13, y + 13, 2, 4, L_TANK);
  r(ctx, x + 13, y + 12, 3, 2, L_SKIN);

  /* shorts */
  r(ctx, x + 2, y + 21, 10, 3, L_SHORTS);

  /* legs */
  r(ctx, x + 3, y + 24, 3, 4, L_SKIN);
  r(ctx, x + 8, y + 24, 3, 4, L_SKIN);
  r(ctx, x + 2, y + 27, 4, 2, "#222");
  r(ctx, x + 8, y + 27, 4, 2, "#222");
}

function drawLitoHit(ctx: CanvasRenderingContext2D, progress: number) {
  const x = LX, y = LY;
  /* recoil: head snaps right, body shifts right, then recovers */
  const hitPeak = progress < 0.3 ? progress / 0.3 : 1 - (progress - 0.3) / 0.7;
  const recoilX = hitPeak * 6;
  const headSnap = hitPeak * 3;

  /* buzz-cut */
  r(ctx, x + 1 + recoilX + headSnap * 0.5, y + 1, 12, 3, L_HAIR);
  r(ctx, x + recoilX + headSnap * 0.5, y + 2, 14, 2, L_HAIR);

  /* head (snaps further right) */
  r(ctx, x + 1 + recoilX + headSnap, y + 3, 12, 10, L_SKIN);
  r(ctx, x + 1 + recoilX + headSnap, y + 11, 12, 2, L_SKIN_SH);

  /* eyebrows */
  r(ctx, x + 3 + recoilX + headSnap, y + 5, 3, 1, L_BROW);
  r(ctx, x + 8 + recoilX + headSnap, y + 5, 3, 1, L_BROW);

  /* eyes (squinting from hit) */
  if (hitPeak > 0.5) {
    r(ctx, x + 3 + recoilX + headSnap, y + 7, 3, 1, L_EYE);
    r(ctx, x + 9 + recoilX + headSnap, y + 7, 3, 1, L_EYE);
  } else {
    r(ctx, x + 3 + recoilX + headSnap, y + 6, 2, 2, "#fff");
    r(ctx, x + 3 + recoilX + headSnap, y + 6, 1, 2, L_EYE);
    r(ctx, x + 9 + recoilX + headSnap, y + 6, 2, 2, "#fff");
    r(ctx, x + 9 + recoilX + headSnap, y + 6, 1, 2, L_EYE);
  }

  /* mouth (grimace) */
  r(ctx, x + 5 + recoilX + headSnap, y + 10, 4, 1, "#c06050");

  /* neck */
  r(ctx, x + 4 + recoilX * 0.6, y + 13, 6, 2, L_SKIN);

  /* body */
  r(ctx, x + 1 + recoilX * 0.4, y + 15, 12, 6, L_TANK);
  r(ctx, x + 1 + recoilX * 0.4, y + 19, 12, 2, L_TANK_SH);

  /* arms drop slightly */
  r(ctx, x - 1 + recoilX * 0.3, y + 15, 2, 4, L_TANK);
  r(ctx, x - 3 + recoilX * 0.3, y + 15, 3, 3, L_SKIN);
  r(ctx, x + 13 + recoilX * 0.3, y + 15, 2, 4, L_TANK);
  r(ctx, x + 13 + recoilX * 0.3, y + 15, 3, 2, L_SKIN);

  /* shorts & legs */
  r(ctx, x + 2, y + 21, 10, 3, L_SHORTS);
  r(ctx, x + 3, y + 24, 3, 4, L_SKIN);
  r(ctx, x + 8, y + 24, 3, 4, L_SKIN);
  r(ctx, x + 2, y + 27, 4, 2, "#222");
  r(ctx, x + 8, y + 27, 4, 2, "#222");
}

function drawLitoPunching(ctx: CanvasRenderingContext2D, progress: number) {
  const x = LX, y = LY;
  /* wind-up then punch left */
  const windUp = progress < 0.35 ? progress / 0.35 : 0;
  const punch = progress >= 0.35 && progress < 0.7 ? (progress - 0.35) / 0.35 : 0;
  const recover = progress >= 0.7 ? (progress - 0.7) / 0.3 : 0;

  const leanX = windUp * 3 - punch * 6 + recover * 3;
  const punchExtend = punch * 20 - recover * 20;

  /* buzz-cut */
  r(ctx, x + 1 + leanX * 0.3, y + 1, 12, 3, L_HAIR);
  r(ctx, x + leanX * 0.3, y + 2, 14, 2, L_HAIR);

  /* head */
  r(ctx, x + 1 + leanX * 0.5, y + 3, 12, 10, L_SKIN);
  r(ctx, x + 1 + leanX * 0.5, y + 11, 12, 2, L_SKIN_SH);

  /* eyebrows (angry) */
  r(ctx, x + 3 + leanX * 0.5, y + 5, 3, 1, L_BROW);
  r(ctx, x + 4 + leanX * 0.5, y + 4, 2, 1, L_BROW);
  r(ctx, x + 8 + leanX * 0.5, y + 5, 3, 1, L_BROW);
  r(ctx, x + 8 + leanX * 0.5, y + 4, 2, 1, L_BROW);

  /* eyes (determined) */
  r(ctx, x + 3 + leanX * 0.5, y + 6, 2, 2, "#fff");
  r(ctx, x + 3 + leanX * 0.5, y + 6, 1, 2, L_EYE);
  r(ctx, x + 9 + leanX * 0.5, y + 6, 2, 2, "#fff");
  r(ctx, x + 9 + leanX * 0.5, y + 6, 1, 2, L_EYE);

  /* mouth (yelling) */
  r(ctx, x + 5 + leanX * 0.5, y + 10, 4, 2, "#8a5040");

  /* neck */
  r(ctx, x + 4 + leanX * 0.4, y + 13, 6, 2, L_SKIN);

  /* body */
  r(ctx, x + 1 + leanX * 0.3, y + 15, 12, 6, L_TANK);
  r(ctx, x + 1 + leanX * 0.3, y + 19, 12, 2, L_TANK_SH);

  /* left arm — PUNCHING LEFT */
  const fistX = x - 2 - punchExtend;
  r(ctx, fistX, y + 14, Math.max(0, x + 1 + leanX * 0.3 - fistX), 2, L_TANK);
  r(ctx, fistX - 3, y + 13, 4, 3, L_SKIN);

  /* right arm (guard) */
  r(ctx, x + 13 + leanX * 0.2, y + 13, 2, 4, L_TANK);
  r(ctx, x + 13 + leanX * 0.2, y + 12, 3, 2, L_SKIN);

  /* shorts & legs */
  r(ctx, x + 2, y + 21, 10, 3, L_SHORTS);
  r(ctx, x + 3, y + 24, 3, 4, L_SKIN);
  r(ctx, x + 8, y + 24, 3, 4, L_SKIN);
  r(ctx, x + 2, y + 27, 4, 2, "#222");
  r(ctx, x + 8, y + 27, 4, 2, "#222");
}

/* ── impact flash ────────────────────────────────────────── */
function drawImpact(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  progress: number,
) {
  if (progress > 0.6) return;
  const t = progress / 0.6;
  const size = lerp(2, 8, t);
  ctx.globalAlpha = 1 - t;
  r(ctx, cx - size / 2, cy - 1, size, 2, FLASH_COLOR);
  r(ctx, cx - 1, cy - size / 2, 2, size, FLASH_COLOR);
  /* diagonal rays */
  const d = size * 0.6;
  r(ctx, cx - d / 2, cy - d / 2, 2, 2, FLASH_COLOR);
  r(ctx, cx + d / 2 - 1, cy - d / 2, 2, 2, FLASH_COLOR);
  r(ctx, cx - d / 2, cy + d / 2 - 1, 2, 2, FLASH_COLOR);
  r(ctx, cx + d / 2 - 1, cy + d / 2 - 1, 2, 2, FLASH_COLOR);
  ctx.globalAlpha = 1;
}

/* ── component ───────────────────────────────────────────── */
export function SocoNaCaraGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgCacheRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);
  const stateRef = useRef<GameState>("idle");
  const animRef = useRef(0);
  const punchesRef = useRef(0);
  const prevTimeRef = useRef(0);
  const mountedRef = useRef(true);
  const willRetaliate = useRef(false);

  const [uiState, setUiState] = useState<GameState>("idle");
  const [uiPunches, setUiPunches] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [rage, setRage] = useState(0);
  const [nickname, setNickname] = useState("");
  const [scoreSaved, setScoreSaved] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem("soco-na-cara-high");
      if (s) setHighScore(parseInt(s, 10));
      const n = localStorage.getItem("arcade-nickname");
      if (n) setNickname(n);
    } catch {
      /* noop */
    }
  }, []);

  useEffect(() => {
    const off = document.createElement("canvas");
    off.width = W;
    off.height = H;
    const c = off.getContext("2d");
    if (c) drawBackground(c);
    bgCacheRef.current = off;
  }, []);

  /* Single stable RAF loop */
  useEffect(() => {
    mountedRef.current = true;
    prevTimeRef.current = 0;

    function tick(time: number) {
      if (!mountedRef.current) return;

      if (prevTimeRef.current === 0) {
        prevTimeRef.current = time;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const dt = (time - prevTimeRef.current) / 1000;
      prevTimeRef.current = time;
      const clampedDt = Math.min(dt, 0.1);

      const state = stateRef.current;

      /* ── advance animation ── */
      if (state === "tina_punching") {
        animRef.current += clampedDt / 0.5;
        if (animRef.current >= 1) {
          animRef.current = 0;
          stateRef.current = "lito_hit";
          setUiState("lito_hit");
        }
      } else if (state === "lito_hit") {
        animRef.current += clampedDt / 0.4;
        if (animRef.current >= 1) {
          animRef.current = 0;
          if (willRetaliate.current) {
            stateRef.current = "lito_punching";
            setUiState("lito_punching");
          } else {
            stateRef.current = "idle";
            setUiState("idle");
          }
        }
      } else if (state === "lito_punching") {
        animRef.current += clampedDt / 0.8;
        if (animRef.current >= 1) {
          animRef.current = 0;
          stateRef.current = "tina_knocked_out";
          setUiState("tina_knocked_out");
        }
      } else if (state === "tina_knocked_out") {
        animRef.current += clampedDt / 1.3;
        if (animRef.current >= 1) {
          animRef.current = 1;
          stateRef.current = "game_over";
          setUiState("game_over");
          const count = punchesRef.current;
          setHighScore((prev) => {
            const best = Math.max(prev, count);
            try {
              localStorage.setItem("soco-na-cara-high", String(best));
            } catch {
              /* noop */
            }
            return best;
          });
        }
      }

      /* ── draw ── */
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (canvas && ctx) {
        ctx.clearRect(0, 0, W, H);
        if (bgCacheRef.current) ctx.drawImage(bgCacheRef.current, 0, 0);

        const p = animRef.current;
        const s = stateRef.current;

        /* draw Tina */
        if (s === "idle" || s === "lito_hit") {
          drawTinaIdle(ctx);
        } else if (s === "tina_punching") {
          drawTinaPunching(ctx, p);
        } else if (s === "lito_punching") {
          drawTinaIdle(ctx);
        } else if (s === "tina_knocked_out" || s === "game_over") {
          drawTinaKnockedOut(ctx, Math.min(p, 1));
        }

        /* draw Lito */
        if (s === "idle" || s === "tina_punching") {
          drawLitoIdle(ctx);
        } else if (s === "lito_hit") {
          drawLitoHit(ctx, p);
        } else if (s === "lito_punching") {
          drawLitoPunching(ctx, p);
        } else if (s === "tina_knocked_out" || s === "game_over") {
          drawLitoIdle(ctx);
        }

        /* impact flash on Lito when Tina punches */
        if (s === "tina_punching" && p > 0.3 && p < 0.7) {
          drawImpact(ctx, LX - 2, LY + 8, (p - 0.3) / 0.4);
        }
        /* impact flash on Tina when Lito punches */
        if (s === "lito_punching" && p > 0.4 && p < 0.8) {
          drawImpact(ctx, TX + 14, TY + 8, (p - 0.4) / 0.4);
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      mountedRef.current = false;
      cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function punch() {
    if (stateRef.current !== "idle") return;
    punchesRef.current += 1;
    setUiPunches(punchesRef.current);
    const chance = Math.min(punchesRef.current * 0.08, 0.9);
    setRage(chance);
    willRetaliate.current = Math.random() < chance;
    animRef.current = 0;
    stateRef.current = "tina_punching";
    setUiState("tina_punching");
  }

  function restart() {
    punchesRef.current = 0;
    setUiPunches(0);
    setRage(0);
    willRetaliate.current = false;
    animRef.current = 0;
    stateRef.current = "idle";
    setUiState("idle");
    prevTimeRef.current = 0;
    setScoreSaved(false);
  }

  function saveScore() {
    if (!nickname.trim() || scoreSaved) return;
    const name = nickname.trim().slice(0, 12);
    try { localStorage.setItem("arcade-nickname", name); } catch { /* noop */ }
    setScoreSaved(true);
    fetch("/api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ game: "soco-na-cara", name, score: uiPunches }),
    }).catch(() => { /* silent fail */ });
  }

  const busy =
    uiState === "tina_punching" ||
    uiState === "lito_hit" ||
    uiState === "lito_punching" ||
    uiState === "tina_knocked_out";

  return (
    <div className="soco-na-cara">
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className="soco-na-cara__canvas"
      />

      {/* HUD */}
      <div className="soco-na-cara__hud">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={uiPunches}
            className="chip"
            initial={{ scale: 1.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            Socos: {uiPunches}
          </motion.div>
        </AnimatePresence>
        <div className="chip" style={{ opacity: 0.7 }}>
          Recorde: {highScore}
        </div>
      </div>

      {/* Rage bar */}
      <div className="soco-na-cara__rage-bar">
        <span className="soco-na-cara__rage-label">Raiva do Lito</span>
        <div className="soco-na-cara__rage-track">
          <motion.div
            className="soco-na-cara__rage-fill"
            animate={{ width: `${rage * 100}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          />
        </div>
      </div>

      {/* Game Over Overlay */}
      <AnimatePresence>
        {uiState === "game_over" && (
          <motion.div
            className="soco-na-cara__overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.h2
              initial={{ scale: 0.6, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                delay: 0.15,
              }}
              style={{
                margin: "0 0 0.3rem",
                fontSize: "1.4rem",
                color: "#ff5f73",
              }}
            >
              Lito revidou!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{ margin: "0 0 0.15rem", color: "#b9b2d9" }}
            >
              Socos dados:{" "}
              <strong style={{ color: "#f7f4ff" }}>{uiPunches}</strong>
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{
                margin: "0 0 0.8rem",
                color: "#b9b2d9",
                fontSize: "0.85rem",
              }}
            >
              Recorde pessoal: {highScore}
            </motion.p>
            <motion.div
              className="score-submit"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              {scoreSaved ? (
                <span className="score-submit__done">Salvo!</span>
              ) : (
                <>
                  <input
                    className="score-submit__input"
                    type="text"
                    maxLength={12}
                    placeholder="Seu nome"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveScore()}
                  />
                  <button
                    className="btn score-submit__btn"
                    onClick={saveScore}
                    disabled={!nickname.trim()}
                  >
                    Salvar
                  </button>
                </>
              )}
            </motion.div>
            <motion.button
              className="btn btn--primary"
              onClick={restart}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ delay: 0.55 }}
            >
              Jogar de Novo
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      {uiState !== "game_over" && (
        <div className="soco-na-cara__controls">
          <motion.button
            className="btn btn--primary"
            onClick={punch}
            disabled={busy}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            style={{ opacity: busy ? 0.5 : 1 }}
          >
            Socar!
          </motion.button>
        </div>
      )}
    </div>
  );
}
