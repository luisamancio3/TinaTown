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

/* ── object palettes ─────────────────────────────────────── */
const CIG_PAPER = "#f5f0e8";
const CIG_FILTER = "#d4883c";
const CIG_TIP = "#ff4a2a";
const CIG_ASH = "#888888";

const GOLD_BODY = "#ffd700";
const GOLD_FILTER = "#c8a020";

const BROC_STEM = "#4a7a30";
const BROC_TOP = "#2d6b1e";
const BROC_DETAIL = "#3a8a28";

const BOTTLE_BODY = "#a0d4f0";
const BOTTLE_CAP = "#2060c0";
const BOTTLE_LABEL = "#ffffff";

/* ── scene palette ───────────────────────────────────────── */
const SKY = "#1a1530";
const SKY_LO = "#241e3a";
const BRICK = "#6a3a2a";
const BRICK_DK = "#4a2a1e";
const MORTAR = "#4a2a1e";
const GROUND = "#3a3530";
const GROUND_DK = "#2a2520";
const LAMP_POLE = "#555555";
const LAMP_LIGHT = "rgba(255,220,140,0.3)";
const LAMP_GLOW = "rgba(255,200,100,0.12)";

/* ── game constants ──────────────────────────────────────── */
const MAX_LIVES = 3;
const TINA_SPEED = 60;
const BASE_FALL_SPEED = 30;
const FALL_SPEED_INC = 2; /* per 5 points */
const MAX_FALL_SPEED = 60;
const BASE_SPAWN_INTERVAL = 1.5;
const MIN_SPAWN_INTERVAL = 0.5;
const TINA_Y = 68; /* Tina's top Y */
const TINA_W = 10; /* Tina width */
const CATCH_Y_RANGE = 5; /* vertical range for catch */
const CATCH_X_RANGE = 6; /* horizontal range for catch */
const PLAY_LEFT = 6;
const PLAY_RIGHT = W - 6;

type GameState = "idle" | "playing" | "game_over";
type ItemType = "cigarette" | "golden" | "broccoli" | "water";
type Expression = "normal" | "happy" | "disgusted";

interface FallingItem {
  type: ItemType;
  x: number;
  y: number;
  active: boolean;
}

interface SmokePuff {
  x: number;
  y: number;
  progress: number;
}

/* ── helpers ──────────────────────────────────────────────── */
function r(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  fill: string,
) {
  ctx.fillStyle = fill;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

/* ── background ──────────────────────────────────────────── */
function drawBackground(ctx: CanvasRenderingContext2D) {
  /* sky */
  r(ctx, 0, 0, W, 30, SKY);
  r(ctx, 0, 25, W, 10, SKY_LO);

  /* stars */
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  const stars = [
    [12, 4], [35, 8], [58, 3], [90, 6], [115, 10], [140, 5],
    [25, 14], [70, 12], [105, 2], [130, 15], [48, 7], [82, 4],
  ];
  for (const [sx, sy] of stars) {
    ctx.fillRect(sx, sy, 1, 1);
  }

  /* brick wall (upper half) */
  for (let row = 0; row < 8; row++) {
    const by = 10 + row * 4;
    const offset = row % 2 === 0 ? 0 : 5;
    for (let col = -1; col < 18; col++) {
      const bx = offset + col * 10;
      r(ctx, bx, by, 9, 3, BRICK);
      r(ctx, bx + 1, by + 1, 7, 1, BRICK_DK);
      /* mortar gaps */
      r(ctx, bx + 9, by, 1, 4, MORTAR);
    }
    /* horizontal mortar */
    r(ctx, 0, by + 3, W, 1, MORTAR);
  }

  /* ground */
  r(ctx, 0, 72, W, 18, GROUND);
  r(ctx, 0, 72, W, 1, GROUND_DK);

  /* gutter line */
  r(ctx, 0, 73, W, 1, GROUND_DK);

  /* ground details */
  for (let i = 0; i < 8; i++) {
    const gx = (i * 23 + 5) % W;
    r(ctx, gx, 74 + (i % 3) * 3, 2, 1, GROUND_DK);
  }

  /* dumpster (right side) */
  r(ctx, W - 22, 60, 18, 12, "#3a5540");
  r(ctx, W - 22, 60, 18, 2, "#4a6a50");
  r(ctx, W - 21, 62, 1, 8, "#2e4432");
  r(ctx, W - 14, 56, 14, 4, "#4a6a50"); /* lid */
  r(ctx, W - 14, 56, 14, 1, "#5a7a60");

  /* streetlamp (left side) */
  r(ctx, 14, 8, 2, 64, LAMP_POLE);
  r(ctx, 11, 6, 8, 3, "#444");
  r(ctx, 12, 6, 6, 2, "#666");

  /* lamp glow */
  ctx.fillStyle = LAMP_GLOW;
  ctx.fillRect(6, 8, 18, 20);
  ctx.fillStyle = LAMP_LIGHT;
  ctx.fillRect(10, 8, 10, 10);

  /* lamp bulb */
  r(ctx, 13, 6, 4, 2, "#ffe880");
}

/* ── Tina (front-facing, arms out to sides) ──────────────── */
function drawTina(
  ctx: CanvasRenderingContext2D,
  x: number,
  frame: 0 | 1,
  expression: Expression,
) {
  const y = TINA_Y;
  const b = frame === 1 ? 0.5 : 0;

  /* hair back */
  r(ctx, x - 1, y + 1 + b, 12, 6, T_HAIR);
  r(ctx, x - 1, y + 5 + b, 3, 10, T_HAIR);
  r(ctx, x + 8, y + 5 + b, 3, 10, T_HAIR);
  r(ctx, x - 1, y + 8 + b, 2, 6, T_HAIR_DK);
  r(ctx, x + 9, y + 8 + b, 2, 6, T_HAIR_DK);

  /* body */
  r(ctx, x + 2, y + 8 + b, 6, 6, T_SHIRT);
  r(ctx, x + 3, y + 10 + b, 4, 4, T_SHIRT_SH);

  /* pants */
  r(ctx, x + 2, y + 14 + b, 6, 2, T_SHORTS);

  /* legs */
  if (frame === 0) {
    r(ctx, x + 3, y + 16 + b, 2, 3, T_SKIN);
    r(ctx, x + 5, y + 16 + b, 2, 3, T_SKIN);
    r(ctx, x + 2, y + 18 + b, 3, 1, T_SHORTS);
    r(ctx, x + 5, y + 18 + b, 3, 1, T_SHORTS);
  } else {
    r(ctx, x + 2, y + 16 + b, 2, 3, T_SKIN);
    r(ctx, x + 6, y + 16 + b, 2, 3, T_SKIN);
    r(ctx, x + 1, y + 18 + b, 3, 1, T_SHORTS);
    r(ctx, x + 6, y + 18 + b, 3, 1, T_SHORTS);
  }

  /* arms out to sides */
  r(ctx, x - 1, y + 8 + b, 3, 1, T_SHIRT);
  r(ctx, x + 8, y + 8 + b, 3, 1, T_SHIRT);
  r(ctx, x - 2, y + 9 + b, 2, 2, T_SKIN);
  r(ctx, x + 10, y + 9 + b, 2, 2, T_SKIN);

  /* neck */
  r(ctx, x + 4, y + 7 + b, 2, 1, T_SKIN);

  /* head */
  r(ctx, x + 1, y + 1 + b, 8, 6, T_SKIN);
  r(ctx, x + 1, y + 5.5 + b, 8, 1, T_SKIN_SH);

  /* hair top */
  r(ctx, x, y + b, 10, 2, T_HAIR);
  r(ctx, x, y + 1 + b, 2, 2, T_HAIR);
  r(ctx, x + 8, y + 1 + b, 2, 2, T_HAIR);
  r(ctx, x + 2, y + 1 + b, 2, 1, T_HAIR_DK);
  r(ctx, x + 5, y + 0.5 + b, 3, 1, T_HAIR_HL);

  /* eyes */
  if (expression === "disgusted") {
    /* squinty eyes */
    r(ctx, x + 3, y + 3.5 + b, 1.5, 0.5, T_EYE);
    r(ctx, x + 6, y + 3.5 + b, 1.5, 0.5, T_EYE);
    /* frown eyebrows */
    r(ctx, x + 2.5, y + 2.5 + b, 2, 0.5, T_HAIR);
    r(ctx, x + 6, y + 2.5 + b, 2, 0.5, T_HAIR);
  } else {
    r(ctx, x + 3, y + 3 + b, 1.5, 1.5, T_EYE);
    r(ctx, x + 6, y + 3 + b, 1.5, 1.5, T_EYE);
    /* eyebrows */
    r(ctx, x + 3, y + 2 + b, 2, 0.5, T_HAIR);
    r(ctx, x + 6, y + 2 + b, 2, 0.5, T_HAIR);
  }

  /* blush */
  r(ctx, x + 2, y + 4.5 + b, 1.5, 0.8, T_BLUSH);
  r(ctx, x + 7, y + 4.5 + b, 1.5, 0.8, T_BLUSH);

  /* mouth */
  if (expression === "happy") {
    /* big smile */
    r(ctx, x + 4, y + 5.5 + b, 3, 1, T_LIPS);
    r(ctx, x + 4.5, y + 6 + b, 2, 0.5, T_LIPS);
  } else if (expression === "disgusted") {
    /* tongue out / yuck */
    r(ctx, x + 4, y + 5.5 + b, 3, 0.5, T_LIPS);
    r(ctx, x + 5, y + 6 + b, 1, 1, "#e87070"); /* tongue */
  } else {
    /* slight smile */
    r(ctx, x + 4, y + 5.5 + b, 3, 0.5, T_LIPS);
  }
}

/* ── falling cigarette ───────────────────────────────────── */
function drawCigarette(ctx: CanvasRenderingContext2D, x: number, y: number) {
  /* paper body */
  r(ctx, x, y, 7, 2, CIG_PAPER);
  /* filter */
  r(ctx, x + 7, y, 3, 2, CIG_FILTER);
  /* lit tip */
  r(ctx, x - 1, y, 1, 2, CIG_TIP);
  r(ctx, x - 1, y - 0.5, 1, 0.5, CIG_ASH);
  /* smoke wisp */
  ctx.fillStyle = "rgba(200,200,220,0.3)";
  ctx.fillRect(x - 2, y - 2, 1, 1);
  ctx.fillRect(x - 3, y - 3, 1, 1);
}

/* ── golden cigarette ────────────────────────────────────── */
function drawGoldenCig(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  time: number,
) {
  /* gold body */
  r(ctx, x, y, 7, 2, GOLD_BODY);
  /* filter */
  r(ctx, x + 7, y, 3, 2, GOLD_FILTER);
  /* tip glow */
  r(ctx, x - 1, y, 1, 2, "#ffaa00");
  /* sparkles (animated) */
  const t = time * 4;
  ctx.fillStyle = "#fff";
  const s1x = x + 2 + Math.sin(t) * 2;
  const s1y = y - 2 + Math.cos(t * 1.3) * 1;
  ctx.fillRect(Math.round(s1x), Math.round(s1y), 1, 1);
  const s2x = x + 6 + Math.sin(t + 2) * 2;
  const s2y = y - 1 + Math.cos(t * 0.9 + 1) * 1;
  ctx.fillRect(Math.round(s2x), Math.round(s2y), 1, 1);
}

/* ── broccoli ────────────────────────────────────────────── */
function drawBroccoli(ctx: CanvasRenderingContext2D, x: number, y: number) {
  /* stem */
  r(ctx, x + 2, y + 3, 2, 4, BROC_STEM);
  /* florets (top cluster) */
  r(ctx, x, y, 6, 4, BROC_TOP);
  r(ctx, x + 1, y - 1, 4, 2, BROC_TOP);
  /* detail bumps */
  r(ctx, x + 1, y + 1, 1, 1, BROC_DETAIL);
  r(ctx, x + 3, y, 1, 1, BROC_DETAIL);
  r(ctx, x + 4, y + 2, 1, 1, BROC_DETAIL);
}

/* ── water bottle ────────────────────────────────────────── */
function drawWaterBottle(ctx: CanvasRenderingContext2D, x: number, y: number) {
  /* body */
  r(ctx, x + 1, y + 2, 4, 6, BOTTLE_BODY);
  /* cap */
  r(ctx, x + 2, y, 2, 2, BOTTLE_CAP);
  /* label */
  r(ctx, x + 1, y + 4, 4, 2, BOTTLE_LABEL);
  /* water shine */
  r(ctx, x + 2, y + 3, 1, 3, "rgba(255,255,255,0.3)");
}

/* ── smoke puff effect ───────────────────────────────────── */
function drawSmokePuff(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  progress: number,
) {
  if (progress < 0 || progress >= 1) return;
  const alpha = 1 - progress;
  const rise = progress * 8;
  ctx.globalAlpha = alpha * 0.5;
  ctx.fillStyle = "#ddd";
  const py = y - rise;
  ctx.fillRect(Math.round(x - 1), Math.round(py), 3, 2);
  ctx.fillRect(Math.round(x), Math.round(py - 1), 2, 1);
  ctx.fillRect(Math.round(x - 2), Math.round(py + 1), 2, 1);
  ctx.globalAlpha = 1;
}

/* ── draw life icons (mini cigarettes) ───────────────────── */
function drawLifeIcon(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
) {
  r(ctx, x, y, 5, 1.5, CIG_PAPER);
  r(ctx, x + 5, y, 2, 1.5, CIG_FILTER);
  r(ctx, x - 0.5, y, 0.5, 1.5, CIG_TIP);
}

/* ── idle smoke curl ─────────────────────────────────────── */
function drawSmokeCurl(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  time: number,
) {
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = "#bbb";
  for (let i = 0; i < 5; i++) {
    const t = time * 1.2 + i * 0.6;
    const sx = x + Math.sin(t) * 2;
    const sy = y - i * 3 - (time * 3 % 15);
    if (sy > y - 18 && sy < y) {
      ctx.fillRect(Math.round(sx), Math.round(sy), 1, 1);
    }
  }
  ctx.globalAlpha = 1;
}

/* ── component ───────────────────────────────────────────── */
export function ChuvaDecigarroGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgCacheRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);
  const prevTimeRef = useRef(0);
  const mountedRef = useRef(true);

  /* game logic refs */
  const stateRef = useRef<GameState>("idle");
  const scoreRef = useRef(0);
  const livesRef = useRef(MAX_LIVES);
  const tinaXRef = useRef(W / 2 - TINA_W / 2);
  const tinaFrameRef = useRef<0 | 1>(0);
  const tinaFrameTimerRef = useRef(0);
  const expressionRef = useRef<Expression>("normal");
  const expressionTimerRef = useRef(0);

  /* movement keys */
  const keysRef = useRef({ left: false, right: false });

  /* items */
  const itemsRef = useRef<FallingItem[]>([]);
  const spawnTimerRef = useRef(0);

  /* effects */
  const puffsRef = useRef<SmokePuff[]>([]);
  const flashRef = useRef(0); /* red flash countdown */

  /* UI state */
  const [uiState, setUiState] = useState<GameState>("idle");
  const [uiScore, setUiScore] = useState(0);
  const [uiLives, setUiLives] = useState(MAX_LIVES);
  const [highScore, setHighScore] = useState(0);
  const [nickname, setNickname] = useState("");
  const [scoreSaved, setScoreSaved] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem("chuva-de-cigarro-high");
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

  /* keyboard input */
  useEffect(() => {
    function onDown(e: KeyboardEvent) {
      if (stateRef.current !== "playing") return;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        keysRef.current.left = true;
        e.preventDefault();
      }
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        keysRef.current.right = true;
        e.preventDefault();
      }
    }
    function onUp(e: KeyboardEvent) {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        keysRef.current.left = false;
      }
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        keysRef.current.right = false;
      }
    }
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, []);

  /* canvas tap → move Tina */
  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (stateRef.current !== "playing") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (W / rect.width);
    /* move toward tap X */
    tinaXRef.current = clamp(mx - TINA_W / 2, PLAY_LEFT, PLAY_RIGHT - TINA_W);
  }, []);

  /* spawn logic */
  function spawnItem() {
    const score = scoreRef.current;
    const rand = Math.random();
    const badChance = score >= 15 ? 0.25 : 0.15;
    const goldenChance = 0.10;

    let type: ItemType;
    if (rand < goldenChance) {
      type = "golden";
    } else if (rand < goldenChance + badChance) {
      type = Math.random() < 0.5 ? "broccoli" : "water";
    } else {
      type = "cigarette";
    }

    const x = PLAY_LEFT + Math.random() * (PLAY_RIGHT - PLAY_LEFT - 10);
    itemsRef.current.push({ type, x, y: -8, active: true });
  }

  function getMaxItems() {
    const score = scoreRef.current;
    if (score >= 20) return 4;
    if (score >= 10) return 3;
    return 2;
  }

  function getFallSpeed() {
    const score = scoreRef.current;
    return Math.min(BASE_FALL_SPEED + Math.floor(score / 5) * FALL_SPEED_INC, MAX_FALL_SPEED);
  }

  function getSpawnInterval() {
    const score = scoreRef.current;
    return Math.max(BASE_SPAWN_INTERVAL - Math.floor(score / 5) * 0.12, MIN_SPAWN_INTERVAL);
  }

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
        /* === Tina movement === */
        const keys = keysRef.current;
        let moving = false;
        if (keys.left) {
          tinaXRef.current -= TINA_SPEED * dt;
          moving = true;
        }
        if (keys.right) {
          tinaXRef.current += TINA_SPEED * dt;
          moving = true;
        }
        tinaXRef.current = clamp(tinaXRef.current, PLAY_LEFT, PLAY_RIGHT - TINA_W);

        /* walk frame */
        if (moving) {
          tinaFrameTimerRef.current += dt;
          if (tinaFrameTimerRef.current >= 0.15) {
            tinaFrameTimerRef.current = 0;
            tinaFrameRef.current = tinaFrameRef.current === 0 ? 1 : 0;
          }
        } else {
          tinaFrameRef.current = 0;
          tinaFrameTimerRef.current = 0;
        }

        /* expression timer */
        if (expressionTimerRef.current > 0) {
          expressionTimerRef.current -= dt;
          if (expressionTimerRef.current <= 0) {
            expressionRef.current = "normal";
          }
        }

        /* flash timer */
        if (flashRef.current > 0) {
          flashRef.current -= dt;
        }

        /* === spawning === */
        spawnTimerRef.current -= dt;
        const activeItems = itemsRef.current.filter((i) => i.active).length;
        if (spawnTimerRef.current <= 0 && activeItems < getMaxItems()) {
          spawnItem();
          spawnTimerRef.current = getSpawnInterval();
        }

        /* === fall & collision === */
        const fallSpeed = getFallSpeed();
        const tinaCenterX = tinaXRef.current + TINA_W / 2;

        for (const item of itemsRef.current) {
          if (!item.active) continue;
          item.y += fallSpeed * dt;

          /* catch collision */
          const itemCX = item.x + 5; /* approx center of item */
          const dx = Math.abs(itemCX - tinaCenterX);
          const inCatchZone = item.y + 4 >= TINA_Y && item.y <= TINA_Y + CATCH_Y_RANGE;

          if (inCatchZone && dx < CATCH_X_RANGE) {
            item.active = false;

            if (item.type === "cigarette") {
              scoreRef.current += 1;
              setUiScore(scoreRef.current);
              expressionRef.current = "happy";
              expressionTimerRef.current = 0.3;
              puffsRef.current.push({ x: tinaCenterX, y: TINA_Y, progress: 0 });
            } else if (item.type === "golden") {
              scoreRef.current += 3;
              setUiScore(scoreRef.current);
              expressionRef.current = "happy";
              expressionTimerRef.current = 0.5;
              puffsRef.current.push(
                { x: tinaCenterX - 3, y: TINA_Y, progress: 0 },
                { x: tinaCenterX + 3, y: TINA_Y - 2, progress: -0.1 },
              );
            } else {
              /* broccoli or water → lose life */
              livesRef.current -= 1;
              setUiLives(livesRef.current);
              expressionRef.current = "disgusted";
              expressionTimerRef.current = 0.5;
              flashRef.current = 0.3;

              if (livesRef.current <= 0) {
                stateRef.current = "game_over";
                setUiState("game_over");
                const count = scoreRef.current;
                setHighScore((prev) => {
                  const best = Math.max(prev, count);
                  try { localStorage.setItem("chuva-de-cigarro-high", String(best)); } catch { /* noop */ }
                  return best;
                });
              }
            }
            continue;
          }

          /* off screen → remove */
          if (item.y > H + 10) {
            item.active = false;
          }
        }

        /* clean up inactive items */
        itemsRef.current = itemsRef.current.filter((i) => i.active);

        /* === smoke puffs === */
        for (const p of puffsRef.current) {
          p.progress += dt * 1.5;
        }
        puffsRef.current = puffsRef.current.filter((p) => p.progress < 1);
      }

      /* ── draw ── */
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (canvas && ctx) {
        ctx.clearRect(0, 0, W, H);
        if (bgCacheRef.current) ctx.drawImage(bgCacheRef.current, 0, 0);

        if (state === "playing" || state === "game_over") {
          /* draw falling items */
          for (const item of itemsRef.current) {
            if (!item.active) continue;
            switch (item.type) {
              case "cigarette":
                drawCigarette(ctx, item.x, item.y);
                break;
              case "golden":
                drawGoldenCig(ctx, item.x, item.y, time / 1000);
                break;
              case "broccoli":
                drawBroccoli(ctx, item.x, item.y);
                break;
              case "water":
                drawWaterBottle(ctx, item.x, item.y);
                break;
            }
          }

          /* draw Tina */
          drawTina(ctx, tinaXRef.current, tinaFrameRef.current, expressionRef.current);

          /* draw smoke puffs */
          for (const p of puffsRef.current) {
            if (p.progress >= 0) {
              drawSmokePuff(ctx, p.x, p.y, p.progress);
            }
          }

          /* red flash overlay */
          if (flashRef.current > 0) {
            ctx.fillStyle = `rgba(255,60,60,${flashRef.current * 0.4})`;
            ctx.fillRect(0, 0, W, H);
          }

          /* draw life icons in top-right */
          for (let i = 0; i < livesRef.current; i++) {
            drawLifeIcon(ctx, W - 10 - i * 10, 3);
          }
        }

        /* idle scene */
        if (state === "idle") {
          const idleT = time / 1000;

          /* Tina standing center with cigarette in mouth */
          drawTina(ctx, W / 2 - TINA_W / 2, 0, "happy");

          /* cigarette in mouth */
          const tx = W / 2 + 2;
          const ty = TINA_Y + 5.5;
          r(ctx, tx, ty, 5, 1, CIG_PAPER);
          r(ctx, tx + 5, ty, 2, 1, CIG_FILTER);
          r(ctx, tx - 0.5, ty, 0.5, 1, CIG_TIP);

          /* smoke curling up from cigarette */
          drawSmokeCurl(ctx, tx, ty - 2, idleT);

          /* scattered cigarettes on ground */
          r(ctx, 30, 80, 5, 1, CIG_PAPER);
          r(ctx, 35, 80, 2, 1, CIG_FILTER);
          r(ctx, 100, 82, 5, 1, CIG_PAPER);
          r(ctx, 105, 82, 2, 1, CIG_FILTER);
          r(ctx, 55, 84, 5, 1, CIG_PAPER);
          r(ctx, 60, 84, 2, 1, CIG_FILTER);

          /* a couple items floating as preview */
          const floatY1 = 20 + Math.sin(idleT * 1.5) * 4;
          const floatY2 = 35 + Math.sin(idleT * 1.2 + 1) * 3;
          const floatY3 = 15 + Math.sin(idleT * 1.8 + 2) * 3;
          drawCigarette(ctx, 40, floatY1);
          drawCigarette(ctx, 100, floatY2);
          drawGoldenCig(ctx, 70, floatY3, idleT);
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
    livesRef.current = MAX_LIVES;
    tinaXRef.current = W / 2 - TINA_W / 2;
    tinaFrameRef.current = 0;
    expressionRef.current = "normal";
    expressionTimerRef.current = 0;
    itemsRef.current = [];
    puffsRef.current = [];
    spawnTimerRef.current = 0.5; /* first spawn quickly */
    flashRef.current = 0;
    keysRef.current = { left: false, right: false };
    prevTimeRef.current = 0;
    setUiScore(0);
    setUiLives(MAX_LIVES);
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
      body: JSON.stringify({ game: "chuva-de-cigarro", name, score: uiScore }),
    }).catch(() => { /* silent fail */ });
  }

  return (
    <div className="chuva-de-cigarro">
      <div className="chuva-de-cigarro__canvas-wrap">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="chuva-de-cigarro__canvas"
          onClick={handleClick}
          style={{ cursor: uiState === "playing" ? "pointer" : "default" }}
        />

        {/* HUD */}
        {uiState === "playing" && (
          <div className="chuva-de-cigarro__hud">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={uiScore}
                className="chip"
                initial={{ scale: 1.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                Cigarros: {uiScore}
              </motion.div>
            </AnimatePresence>
            <div className="chip" style={{ display: "flex", gap: "0.2rem", alignItems: "center" }}>
              {Array.from({ length: MAX_LIVES }).map((_, i) => (
                <span
                  key={i}
                  style={{
                    opacity: i < uiLives ? 1 : 0.25,
                    fontSize: "0.7rem",
                  }}
                >
                  🚬
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Game Over Overlay */}
        <AnimatePresence>
          {uiState === "game_over" && (
            <motion.div
              className="chuva-de-cigarro__overlay"
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
                Fim de jogo!
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{ margin: "0 0 0.15rem", color: "#b9b2d9" }}
              >
                Cigarros:{" "}
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

      {/* Controls hint + Start button */}
      {uiState === "idle" && (
        <div className="chuva-de-cigarro__controls">
          <motion.button
            className="btn btn--primary"
            onClick={startGame}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
          >
            Jogar!
          </motion.button>
          <p className="helper-text" style={{ marginTop: "0.4rem", fontSize: "0.75rem" }}>
            Use ← → ou toque para mover
          </p>
        </div>
      )}

      {/* Controls hint during gameplay */}
      {uiState === "playing" && (
        <div className="chuva-de-cigarro__controls">
          <p className="helper-text" style={{ fontSize: "0.7rem", opacity: 0.6 }}>
            ← → / A D / Toque para mover
          </p>
        </div>
      )}
    </div>
  );
}
