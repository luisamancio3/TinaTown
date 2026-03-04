"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ── virtual canvas size ─────────────────────────────────── */
const W = 160;
const H = 90;

/* ── Tina palette ────────────────────────────────────────── */
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

/* ── Lucas Inutilismo palette ────────────────────────────── */
const L_SKIN = "#fef5f0";
const L_SKIN_SH = "#f0ddd0";
const L_HAIR = "#3b2816";
const L_HAIR_DK = "#2a1a0a";
const L_EYE = "#4a3728";
const L_BROW = "#2a1a0a";
const L_LIPS = "#d8a090";
const L_PIERCING = "#c0c0c0";
const L_SHIRT = "#2a4a6a";
const L_SHIRT_SH = "#1e3a52";
const L_PANTS = "#2d2d2d";

/* ── scene colors ────────────────────────────────────────── */
const SKY = "#4a8ac0";
const SKY_LO = "#6aa8d8";
const GRASS = "#3a8830";
const GRASS_LT = "#4aa040";
const GRASS_DK = "#2e7028";
const TREE_TRUNK = "#5c3a1e";
const TREE_LEAVES = "#2e7028";
const TREE_LEAVES_LT = "#3a8830";
const FENCE = "#a08060";
const FENCE_DK = "#806040";

/* ── game constants ──────────────────────────────────────── */
const GAME_TIME = 30; /* seconds */
const TINA_SPEED = 40;
const LUCAS_BASE_SPEED = 25;
const LUCAS_SPEED_PER_KISS = 2;
const LUCAS_FLEE_DIST = 30;
const LUCAS_FLEE_MULT = 1.5;
const KISS_DIST = 8;
const KISS_INVULN = 0.5; /* seconds of invulnerability after kiss */

/* ── play area bounds (characters stay on grass) ─────────── */
const PLAY_LEFT = 8;
const PLAY_RIGHT = W - 8;
const PLAY_TOP = 34;
const PLAY_BOTTOM = H - 6;

type GameState = "idle" | "playing" | "game_over";

/* ── helpers ──────────────────────────────────────────────── */
function r(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  fill: string,
) {
  ctx.fillStyle = fill;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function dist(ax: number, ay: number, bx: number, by: number) {
  const dx = ax - bx;
  const dy = ay - by;
  return Math.sqrt(dx * dx + dy * dy);
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

/* ── background ──────────────────────────────────────────── */
function drawBackground(ctx: CanvasRenderingContext2D) {
  /* sky gradient */
  r(ctx, 0, 0, W, 20, SKY);
  r(ctx, 0, 20, W, 12, SKY_LO);

  /* clouds */
  r(ctx, 20, 6, 16, 4, "rgba(255,255,255,0.5)");
  r(ctx, 22, 4, 12, 3, "rgba(255,255,255,0.5)");
  r(ctx, 100, 10, 20, 4, "rgba(255,255,255,0.4)");
  r(ctx, 103, 8, 14, 3, "rgba(255,255,255,0.4)");
  r(ctx, 60, 3, 12, 3, "rgba(255,255,255,0.3)");

  /* grass */
  r(ctx, 0, 30, W, 60, GRASS);
  r(ctx, 0, 30, W, 2, GRASS_LT);

  /* grass variation */
  for (let i = 0; i < 20; i++) {
    const gx = (i * 29 + 7) % W;
    const gy = 34 + ((i * 17 + 3) % 50);
    r(ctx, gx, gy, 1, 2, GRASS_DK);
  }
  for (let i = 0; i < 12; i++) {
    const gx = (i * 37 + 13) % W;
    const gy = 32 + ((i * 23 + 11) % 52);
    r(ctx, gx, gy, 1, 1, GRASS_LT);
  }

  /* fence across the back */
  const fy = 28;
  for (let fx = 4; fx < W - 4; fx += 12) {
    r(ctx, fx, fy - 6, 2, 10, FENCE);
    r(ctx, fx + 1, fy - 6, 1, 10, FENCE_DK);
  }
  r(ctx, 4, fy - 3, W - 8, 2, FENCE);
  r(ctx, 4, fy + 1, W - 8, 2, FENCE);

  /* trees (left and right) */
  /* left tree */
  r(ctx, 4, 30, 3, 12, TREE_TRUNK);
  r(ctx, -2, 14, 14, 16, TREE_LEAVES);
  r(ctx, 0, 12, 10, 6, TREE_LEAVES);
  r(ctx, 2, 16, 8, 4, TREE_LEAVES_LT);

  /* right tree */
  r(ctx, W - 7, 28, 3, 14, TREE_TRUNK);
  r(ctx, W - 14, 14, 16, 16, TREE_LEAVES);
  r(ctx, W - 12, 12, 12, 6, TREE_LEAVES);
  r(ctx, W - 10, 16, 8, 4, TREE_LEAVES_LT);

  /* small bush center */
  r(ctx, 72, 32, 16, 6, TREE_LEAVES);
  r(ctx, 74, 30, 12, 4, TREE_LEAVES_LT);
}

/* ── Tina (full body, side-view pixel art) ───────────────── */
function drawTina(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  frame: 0 | 1,
  facingRight: boolean,
) {
  ctx.save();
  if (!facingRight) {
    ctx.translate(x + 7, 0);
    ctx.scale(-1, 1);
    x = 0;
  }

  const b = frame === 1 ? 0.5 : 0;

  /* hair back */
  r(ctx, x, y + 1 + b, 2, 16, T_HAIR);
  r(ctx, x, y + 5 + b, 1, 12, T_HAIR_DK);

  /* body */
  r(ctx, x + 3, y + 8 + b, 4, 6, T_SHIRT);
  r(ctx, x + 4, y + 10 + b, 2, 4, T_SHIRT_SH);

  /* pants */
  r(ctx, x + 3, y + 14 + b, 4, 2, T_SHORTS);

  /* legs */
  if (frame === 0) {
    r(ctx, x + 4, y + 16 + b, 2, 3, T_SKIN);
    r(ctx, x + 3, y + 18 + b, 3, 1, T_SHORTS);
  } else {
    r(ctx, x + 3, y + 16 + b, 2, 2, T_SKIN);
    r(ctx, x + 5, y + 16 + b, 2, 3, T_SKIN);
    r(ctx, x + 2, y + 17 + b, 2, 1, T_SHORTS);
    r(ctx, x + 5, y + 18 + b, 2, 1, T_SHORTS);
  }

  /* left arm */
  r(ctx, x + 2, y + 8 + b, 1, 4, T_SHIRT);
  r(ctx, x + 1, y + 11 + b, 2, 2, T_SKIN);

  /* right arm */
  r(ctx, x + 7, y + 8 + b, 1, 4, T_SHIRT);
  r(ctx, x + 7, y + 11 + b, 2, 2, T_SKIN);

  /* neck */
  r(ctx, x + 4, y + 7 + b, 2, 1, T_SKIN);

  /* head */
  r(ctx, x + 2, y + 1 + b, 6, 6, T_SKIN);
  r(ctx, x + 2, y + 5.5 + b, 6, 1, T_SKIN_SH);

  /* hair top */
  r(ctx, x + 1, y + b, 7, 2, T_HAIR);
  r(ctx, x + 1, y + 1 + b, 2, 3, T_HAIR);
  r(ctx, x + 3, y + 1 + b, 1, 3, T_HAIR_DK);
  r(ctx, x + 5, y + 0.5 + b, 2, 1, T_HAIR_HL);

  /* eye */
  r(ctx, x + 6, y + 3 + b, 1.5, 1.5, T_EYE);
  r(ctx, x + 6, y + 2.5 + b, 2, 0.5, T_HAIR);

  /* blush */
  r(ctx, x + 6, y + 4.5 + b, 1.5, 0.8, T_BLUSH);

  /* lips */
  r(ctx, x + 6, y + 5.5 + b, 1.5, 0.5, T_LIPS);

  ctx.restore();
}

/* ── Lucas Inutilismo (full body, side-view pixel art) ──── */
function drawLucas(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  frame: 0 | 1,
  facingRight: boolean,
  surprised: boolean,
) {
  ctx.save();
  if (!facingRight) {
    ctx.translate(x + 7, 0);
    ctx.scale(-1, 1);
    x = 0;
  }

  const b = frame === 1 ? 0.5 : 0;

  /* body */
  r(ctx, x + 3, y + 8 + b, 4, 6, L_SHIRT);
  r(ctx, x + 4, y + 10 + b, 2, 4, L_SHIRT_SH);

  /* pants */
  r(ctx, x + 3, y + 14 + b, 4, 2, L_PANTS);

  /* legs */
  if (frame === 0) {
    r(ctx, x + 4, y + 16 + b, 2, 3, L_SKIN);
    r(ctx, x + 3, y + 18 + b, 3, 1, "#222");
  } else {
    r(ctx, x + 3, y + 16 + b, 2, 2, L_SKIN);
    r(ctx, x + 5, y + 16 + b, 2, 3, L_SKIN);
    r(ctx, x + 2, y + 17 + b, 2, 1, "#222");
    r(ctx, x + 5, y + 18 + b, 2, 1, "#222");
  }

  /* left arm */
  r(ctx, x + 2, y + 8 + b, 1, 4, L_SHIRT);
  r(ctx, x + 1, y + 11 + b, 2, 2, L_SKIN);

  /* right arm */
  r(ctx, x + 7, y + 8 + b, 1, 4, L_SHIRT);
  r(ctx, x + 7, y + 11 + b, 2, 2, L_SKIN);

  /* neck */
  r(ctx, x + 4, y + 7 + b, 2, 1, L_SKIN);

  /* head */
  r(ctx, x + 2, y + 1 + b, 6, 6, L_SKIN);
  r(ctx, x + 2, y + 5.5 + b, 6, 1, L_SKIN_SH);

  /* hair (styled/spiked — short with upward spikes) */
  r(ctx, x + 1, y + b, 7, 2, L_HAIR);
  r(ctx, x + 1, y + 1 + b, 1, 1, L_HAIR);
  r(ctx, x + 3, y - 0.5 + b, 2, 1, L_HAIR); /* spike */
  r(ctx, x + 5.5, y - 0.5 + b, 1.5, 1, L_HAIR); /* spike */
  r(ctx, x + 4, y + b, 1, 0.5, L_HAIR_DK);

  /* eyebrows */
  r(ctx, x + 5, y + 2.5 + b, 2.5, 0.5, L_BROW);

  /* eye */
  r(ctx, x + 5.5, y + 3 + b, 1.5, 1.5, "#fff");
  r(ctx, x + 6.5, y + 3 + b, 0.5, 1.5, L_EYE);

  /* mouth */
  if (surprised) {
    /* open mouth */
    r(ctx, x + 5.5, y + 5.5 + b, 1.5, 1, "#4a2020");
    r(ctx, x + 5.5, y + 5.5 + b, 1.5, 0.3, "#fff");
    /* sweat drop */
    r(ctx, x + 8, y + 2 + b, 1, 1.5, "rgba(100,180,255,0.7)");
  } else {
    r(ctx, x + 5.5, y + 5.5 + b, 2, 0.5, L_LIPS);
  }

  /* piercing — silver dot on ear */
  r(ctx, x + 1, y + 3.5 + b, 1, 1, L_PIERCING);
  /* lip piercing — small dot below lip */
  r(ctx, x + 6, y + 6.2 + b, 0.5, 0.5, L_PIERCING);

  /* ears */
  r(ctx, x + 1, y + 3 + b, 1, 2, L_SKIN_SH);

  ctx.restore();
}

/* ── heart effect ────────────────────────────────────────── */
function drawHeart(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  progress: number, /* 0→1 */
) {
  if (progress >= 1) return;
  const t = progress;
  ctx.globalAlpha = 1 - t;
  const hy = y - t * 12;
  /* simple pixel heart shape */
  ctx.fillStyle = "#ff4f6a";
  /* top bumps */
  r(ctx, x - 2, hy, 2, 2, "#ff4f6a");
  r(ctx, x + 1, hy, 2, 2, "#ff4f6a");
  /* body */
  r(ctx, x - 3, hy + 1, 7, 2, "#ff4f6a");
  /* bottom point */
  r(ctx, x - 2, hy + 3, 5, 1, "#ff4f6a");
  r(ctx, x - 1, hy + 4, 3, 1, "#ff4f6a");
  r(ctx, x, hy + 5, 1, 1, "#ff4f6a");
  ctx.globalAlpha = 1;
}

/* ── component ───────────────────────────────────────────── */
export function TinaKissGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgCacheRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);
  const prevTimeRef = useRef(0);
  const mountedRef = useRef(true);

  /* game logic refs */
  const stateRef = useRef<GameState>("idle");
  const scoreRef = useRef(0);
  const timerRef = useRef(GAME_TIME);

  /* Tina refs */
  const tinaXRef = useRef(30);
  const tinaYRef = useRef(55);
  const tinaTargetXRef = useRef(30);
  const tinaTargetYRef = useRef(55);
  const tinaFrameRef = useRef<0 | 1>(0);
  const tinaFacingRef = useRef(true); /* true = right */
  const tinaFrameTimerRef = useRef(0);
  const tinaMovingRef = useRef(false);

  /* Lucas refs */
  const lucasXRef = useRef(120);
  const lucasYRef = useRef(50);
  const lucasVxRef = useRef(15);
  const lucasVyRef = useRef(10);
  const lucasDirTimerRef = useRef(2);
  const lucasFrameRef = useRef<0 | 1>(0);
  const lucasFacingRef = useRef(false); /* false = left */
  const lucasFrameTimerRef = useRef(0);
  const lucasSurprisedRef = useRef(0); /* countdown */
  const lucasInvulnRef = useRef(0); /* invulnerability timer */

  /* effects */
  type HeartEffect = { x: number; y: number; progress: number };
  const heartsRef = useRef<HeartEffect[]>([]);

  /* UI state */
  const [uiState, setUiState] = useState<GameState>("idle");
  const [uiScore, setUiScore] = useState(0);
  const [uiTimer, setUiTimer] = useState(GAME_TIME);
  const [highScore, setHighScore] = useState(0);
  const [nickname, setNickname] = useState("");
  const [scoreSaved, setScoreSaved] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem("tina-kiss-high");
      if (s) setHighScore(parseInt(s, 10));
      const n = localStorage.getItem("arcade-nickname");
      if (n) setNickname(n);
    } catch { /* noop */ }
  }, []);

  /* cache background */
  useEffect(() => {
    const off = document.createElement("canvas");
    off.width = W;
    off.height = H;
    const c = off.getContext("2d");
    if (c) drawBackground(c);
    bgCacheRef.current = off;
  }, []);

  /* canvas click → direct Tina */
  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (stateRef.current !== "playing") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    tinaTargetXRef.current = clamp(mx, PLAY_LEFT, PLAY_RIGHT);
    tinaTargetYRef.current = clamp(my, PLAY_TOP, PLAY_BOTTOM);
    tinaMovingRef.current = true;
  }, []);

  /* RAF loop */
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

      const dt = Math.min((time - prevTimeRef.current) / 1000, 0.1);
      prevTimeRef.current = time;

      const state = stateRef.current;

      /* ── game logic ── */
      if (state === "playing") {
        /* countdown timer */
        timerRef.current -= dt;
        const displayTime = Math.max(0, Math.ceil(timerRef.current));
        setUiTimer(displayTime);

        if (timerRef.current <= 0) {
          stateRef.current = "game_over";
          setUiState("game_over");
          const count = scoreRef.current;
          setHighScore((prev) => {
            const best = Math.max(prev, count);
            try { localStorage.setItem("tina-kiss-high", String(best)); } catch { /* noop */ }
            return best;
          });
        }

        /* === Tina movement === */
        const tdx = tinaTargetXRef.current - tinaXRef.current;
        const tdy = tinaTargetYRef.current - tinaYRef.current;
        const tDist = Math.sqrt(tdx * tdx + tdy * tdy);

        if (tDist > 2 && tinaMovingRef.current) {
          const move = TINA_SPEED * dt;
          if (move >= tDist) {
            tinaXRef.current = tinaTargetXRef.current;
            tinaYRef.current = tinaTargetYRef.current;
            tinaMovingRef.current = false;
          } else {
            tinaXRef.current += (tdx / tDist) * move;
            tinaYRef.current += (tdy / tDist) * move;
          }
          tinaFacingRef.current = tdx >= 0;

          /* walk frame */
          tinaFrameTimerRef.current += dt;
          if (tinaFrameTimerRef.current >= 0.2) {
            tinaFrameTimerRef.current = 0;
            tinaFrameRef.current = tinaFrameRef.current === 0 ? 1 : 0;
          }
        } else {
          tinaMovingRef.current = false;
          tinaFrameRef.current = 0;
        }

        /* === Lucas AI === */
        const lucasSpeed = LUCAS_BASE_SPEED + scoreRef.current * LUCAS_SPEED_PER_KISS;
        const distToTina = dist(lucasXRef.current, lucasYRef.current, tinaXRef.current, tinaYRef.current);

        /* flee behavior */
        if (distToTina < LUCAS_FLEE_DIST) {
          const fleeDx = lucasXRef.current - tinaXRef.current;
          const fleeDy = lucasYRef.current - tinaYRef.current;
          const fleeDist = Math.sqrt(fleeDx * fleeDx + fleeDy * fleeDy) || 1;
          lucasVxRef.current = (fleeDx / fleeDist) * lucasSpeed * LUCAS_FLEE_MULT;
          lucasVyRef.current = (fleeDy / fleeDist) * lucasSpeed * LUCAS_FLEE_MULT;
        } else {
          /* random direction change */
          lucasDirTimerRef.current -= dt;
          if (lucasDirTimerRef.current <= 0) {
            lucasDirTimerRef.current = 1 + Math.random() * 2;
            const angle = Math.random() * Math.PI * 2;
            lucasVxRef.current = Math.cos(angle) * lucasSpeed;
            lucasVyRef.current = Math.sin(angle) * lucasSpeed;
          }
        }

        /* move Lucas */
        lucasXRef.current += lucasVxRef.current * dt;
        lucasYRef.current += lucasVyRef.current * dt;

        /* bounce off walls */
        if (lucasXRef.current < PLAY_LEFT) {
          lucasXRef.current = PLAY_LEFT;
          lucasVxRef.current = Math.abs(lucasVxRef.current);
        }
        if (lucasXRef.current > PLAY_RIGHT - 10) {
          lucasXRef.current = PLAY_RIGHT - 10;
          lucasVxRef.current = -Math.abs(lucasVxRef.current);
        }
        if (lucasYRef.current < PLAY_TOP) {
          lucasYRef.current = PLAY_TOP;
          lucasVyRef.current = Math.abs(lucasVyRef.current);
        }
        if (lucasYRef.current > PLAY_BOTTOM - 19) {
          lucasYRef.current = PLAY_BOTTOM - 19;
          lucasVyRef.current = -Math.abs(lucasVyRef.current);
        }

        /* Lucas facing direction based on velocity */
        if (Math.abs(lucasVxRef.current) > 1) {
          lucasFacingRef.current = lucasVxRef.current > 0;
        }

        /* Lucas walk frame */
        lucasFrameTimerRef.current += dt;
        if (lucasFrameTimerRef.current >= 0.2) {
          lucasFrameTimerRef.current = 0;
          lucasFrameRef.current = lucasFrameRef.current === 0 ? 1 : 0;
        }

        /* Lucas surprised countdown */
        if (lucasSurprisedRef.current > 0) {
          lucasSurprisedRef.current -= dt;
        }

        /* Lucas invulnerability */
        if (lucasInvulnRef.current > 0) {
          lucasInvulnRef.current -= dt;
        }

        /* === Kiss collision === */
        const kissDist = dist(
          tinaXRef.current + 4, tinaYRef.current + 10,
          lucasXRef.current + 4, lucasYRef.current + 10,
        );
        if (kissDist < KISS_DIST && lucasInvulnRef.current <= 0) {
          /* KISS! */
          scoreRef.current += 1;
          setUiScore(scoreRef.current);
          lucasSurprisedRef.current = 0.6;
          lucasInvulnRef.current = KISS_INVULN;

          /* spawn hearts */
          const hx = (tinaXRef.current + lucasXRef.current) / 2 + 4;
          const hy2 = Math.min(tinaYRef.current, lucasYRef.current);
          heartsRef.current.push(
            { x: hx, y: hy2, progress: 0 },
            { x: hx - 4, y: hy2 + 2, progress: -0.1 },
            { x: hx + 5, y: hy2 + 1, progress: -0.2 },
          );

          /* teleport Lucas to distant position */
          let nx: number, ny: number;
          do {
            nx = PLAY_LEFT + Math.random() * (PLAY_RIGHT - PLAY_LEFT - 10);
            ny = PLAY_TOP + Math.random() * (PLAY_BOTTOM - PLAY_TOP - 19);
          } while (dist(nx, ny, tinaXRef.current, tinaYRef.current) < 50);
          lucasXRef.current = nx;
          lucasYRef.current = ny;

          /* random new direction */
          const angle = Math.random() * Math.PI * 2;
          const spd = LUCAS_BASE_SPEED + scoreRef.current * LUCAS_SPEED_PER_KISS;
          lucasVxRef.current = Math.cos(angle) * spd;
          lucasVyRef.current = Math.sin(angle) * spd;
        }

        /* === hearts animation === */
        for (const h of heartsRef.current) {
          h.progress += dt * 1.2;
        }
        heartsRef.current = heartsRef.current.filter((h) => h.progress < 1);
      }

      /* ── draw ── */
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (canvas && ctx) {
        ctx.clearRect(0, 0, W, H);
        if (bgCacheRef.current) ctx.drawImage(bgCacheRef.current, 0, 0);

        if (state === "playing" || state === "game_over") {
          /* draw Lucas (behind or in front based on Y) */
          const lucasBehind = lucasYRef.current < tinaYRef.current;

          if (lucasBehind) {
            drawLucas(ctx, lucasXRef.current, lucasYRef.current, lucasFrameRef.current, lucasFacingRef.current, lucasSurprisedRef.current > 0);
            drawTina(ctx, tinaXRef.current, tinaYRef.current, tinaFrameRef.current, tinaFacingRef.current);
          } else {
            drawTina(ctx, tinaXRef.current, tinaYRef.current, tinaFrameRef.current, tinaFacingRef.current);
            drawLucas(ctx, lucasXRef.current, lucasYRef.current, lucasFrameRef.current, lucasFacingRef.current, lucasSurprisedRef.current > 0);
          }

          /* draw hearts */
          for (const h of heartsRef.current) {
            if (h.progress >= 0) {
              drawHeart(ctx, h.x, h.y, h.progress);
            }
          }
        }

        /* idle scene */
        if (state === "idle") {
          /* Tina standing left, Lucas standing right */
          drawTina(ctx, 50, 50, 0, true);
          drawLucas(ctx, 95, 50, 0, false, false);

          /* floating hearts near Tina */
          const idleT = time / 1000;
          const heartY1 = 42 + Math.sin(idleT * 2) * 3;
          const heartY2 = 44 + Math.sin(idleT * 2 + 1.5) * 2;
          drawHeart(ctx, 62, heartY1, 0);
          drawHeart(ctx, 58, heartY2, 0);

          /* sweat on Lucas */
          const sweatY = 48 + Math.sin(idleT * 3) * 1;
          r(ctx, 104, sweatY, 1, 1.5, "rgba(100,180,255,0.6)");
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

  function startGame() {
    scoreRef.current = 0;
    timerRef.current = GAME_TIME;
    tinaXRef.current = 30;
    tinaYRef.current = 55;
    tinaTargetXRef.current = 30;
    tinaTargetYRef.current = 55;
    tinaMovingRef.current = false;
    tinaFrameRef.current = 0;
    lucasXRef.current = 120;
    lucasYRef.current = 50;
    lucasVxRef.current = 15;
    lucasVyRef.current = 10;
    lucasDirTimerRef.current = 2;
    lucasSurprisedRef.current = 0;
    lucasInvulnRef.current = 0;
    heartsRef.current = [];
    prevTimeRef.current = 0;
    setUiScore(0);
    setUiTimer(GAME_TIME);
    setScoreSaved(false);
    stateRef.current = "playing";
    setUiState("playing");
  }

  function saveScore() {
    if (!nickname.trim() || scoreSaved) return;
    const name = nickname.trim().slice(0, 12);
    try { localStorage.setItem("arcade-nickname", name); } catch { /* noop */ }
    setScoreSaved(true);
    fetch("/api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ game: "tina-kiss", name, score: uiScore }),
    }).catch(() => { /* silent fail */ });
  }

  return (
    <div className="tina-kiss">
      <div className="tina-kiss__canvas-wrap">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="tina-kiss__canvas"
          onClick={handleClick}
          style={{ cursor: uiState === "playing" ? "crosshair" : "default" }}
        />

        {/* HUD */}
        {uiState === "playing" && (
          <div className="tina-kiss__hud">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={uiScore}
                className="chip"
                initial={{ scale: 1.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                Beijos: {uiScore}
              </motion.div>
            </AnimatePresence>
            <div className="chip" style={{ color: uiTimer <= 5 ? "#ff5f73" : undefined }}>
              {uiTimer}s
            </div>
          </div>
        )}

        {/* Game Over Overlay */}
        <AnimatePresence>
          {uiState === "game_over" && (
            <motion.div
              className="tina-kiss__overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <motion.h2
                initial={{ scale: 0.6, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.15 }}
                style={{ margin: "0 0 0.3rem", fontSize: "1.4rem", color: "#ff4f9d" }}
              >
                Tempo esgotado!
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{ margin: "0 0 0.15rem", color: "#b9b2d9" }}
              >
                Beijos:{" "}
                <strong style={{ color: "#f7f4ff" }}>{uiScore}</strong>
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{ margin: "0 0 0.8rem", color: "#b9b2d9", fontSize: "0.85rem" }}
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
                onClick={startGame}
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
      </div>

      {/* Start button */}
      {uiState === "idle" && (
        <div className="tina-kiss__controls">
          <motion.button
            className="btn btn--primary"
            onClick={startGame}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
          >
            Jogar!
          </motion.button>
        </div>
      )}
    </div>
  );
}
