"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ── virtual canvas size ─────────────────────────────────── */
const W = 160;
const H = 90;

/* ── palette (matches WalkingCharacters Fruttinha) ───────── */
const SKIN = "#fef5f0";
const SKIN_SHADOW = "#f5e4da";
const HAIR = "#141418";
const HAIR_DARK = "#0a0a0e";
const HAIR_HIGHLIGHT = "#2a2a32";
const SHIRT = "#f0f0f5";
const SHIRT_SHADOW = "#d2d2dc";
const SKIRT = "#f0f0f5";
const SKIRT_SHADOW = "#d2d2dc";
const LIPS = "#e8a0a0";
const EYE_IRIS = "#2d6b3f";
const BLUSH = "rgba(255,160,160,0.35)";

/* ── bedroom scene colors ────────────────────────────────── */
const WALL_UPPER = "#342648";
const WALL_LOWER = "#2a1e3a";
const FLOOR_MAIN = "#6b4422";
const FLOOR_DARK = "#5c3a1e";
const FLOOR_PLANK = "#7a5030";
const BED_FRAME = "#5c3a1e";
const BED_BLANKET = "#c060a0";
const BED_BLANKET_DK = "#a04888";
const BED_PILLOW = "#f0e0f0";
const WIN_FRAME = "#4a3860";
const NIGHT_SKY = "#0a0820";
const CURTAIN = "#c060a0";
const RUG_EDGE = "#6a3d88";
const RUG_MAIN = "#8050a0";
const RUG_CENTER = "#9a68b8";
const STAR_COLOR = "#f0d060";

/* ── game states ─────────────────────────────────────────── */
type GameState = "idle" | "spinning" | "falling" | "game_over";

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

/* ── bedroom background ──────────────────────────────────── */
function drawBackground(ctx: CanvasRenderingContext2D) {
  /* wall */
  r(ctx, 0, 0, W, 30, WALL_UPPER);
  r(ctx, 0, 30, W, 32, WALL_LOWER);

  /* floor — wooden planks */
  r(ctx, 0, 62, W, 28, FLOOR_MAIN);
  r(ctx, 0, 62, W, 1, FLOOR_PLANK);
  for (let py = 68; py < H; py += 6) r(ctx, 0, py, W, 1, FLOOR_DARK);
  for (let px = 0; px < W; px += 22) r(ctx, px, 62, 1, 28, FLOOR_DARK);

  /* window — left wall */
  r(ctx, 12, 8, 30, 30, WIN_FRAME);
  r(ctx, 14, 10, 26, 26, NIGHT_SKY);
  /* stars */
  r(ctx, 17, 14, 1, 1, "#fff");
  r(ctx, 24, 18, 1, 1, "#fff");
  r(ctx, 32, 12, 1, 1, "#fff");
  r(ctx, 20, 26, 1, 1, "#fff");
  r(ctx, 36, 24, 1, 1, "#fff");
  r(ctx, 28, 30, 1, 1, "#fff");
  /* moon */
  r(ctx, 30, 14, 4, 4, "#f0e8d0");
  r(ctx, 31, 13, 3, 1, "#f0e8d0");
  /* cross bars */
  r(ctx, 14, 22, 26, 1, WIN_FRAME);
  r(ctx, 26, 10, 1, 26, WIN_FRAME);
  /* curtains */
  r(ctx, 10, 6, 4, 34, CURTAIN);
  r(ctx, 40, 6, 4, 34, CURTAIN);
  r(ctx, 10, 6, 34, 3, CURTAIN);

  /* bed — right side */
  r(ctx, 116, 42, 40, 20, BED_FRAME);
  r(ctx, 116, 40, 40, 3, BED_FRAME);
  r(ctx, 117, 43, 38, 6, "#f0e0e8");
  r(ctx, 117, 48, 38, 12, BED_BLANKET);
  r(ctx, 117, 56, 38, 4, BED_BLANKET_DK);
  r(ctx, 120, 43, 12, 5, BED_PILLOW);
  r(ctx, 121, 42, 10, 1, BED_PILLOW);

  /* rug — center floor */
  r(ctx, 52, 68, 56, 16, RUG_EDGE);
  r(ctx, 54, 70, 52, 12, RUG_MAIN);
  r(ctx, 60, 73, 40, 6, RUG_CENTER);
}

/* ── character: idle (standing on rug) ────────────────────── */
function drawTinaIdle(ctx: CanvasRenderingContext2D) {
  const x = 73;
  const y = 46;

  /* hair back */
  r(ctx, x + 1, y, 12, 14, HAIR);
  r(ctx, x, y + 2, 14, 10, HAIR);
  r(ctx, x + 10, y + 12, 4, 8, HAIR);
  r(ctx, x + 11, y + 14, 3, 6, HAIR_DARK);

  /* head */
  r(ctx, x + 2, y + 2, 10, 10, SKIN);
  r(ctx, x + 2, y + 10, 10, 2, SKIN_SHADOW);

  /* hair top & bangs */
  r(ctx, x + 1, y, 12, 4, HAIR);
  r(ctx, x + 2, y + 1, 3, 1, HAIR_HIGHLIGHT);
  r(ctx, x + 1, y + 2, 2, 10, HAIR);
  r(ctx, x + 2, y + 3, 4, 2, HAIR);
  r(ctx, x + 2, y + 4, 3, 1, HAIR_DARK);

  /* eyes */
  r(ctx, x + 4, y + 6, 2, 2, "#fff");
  r(ctx, x + 5, y + 6, 1, 2, EYE_IRIS);
  r(ctx, x + 4, y + 5, 3, 1, HAIR);
  r(ctx, x + 8, y + 6, 2, 2, "#fff");
  r(ctx, x + 9, y + 6, 1, 2, EYE_IRIS);
  r(ctx, x + 8, y + 5, 3, 1, HAIR);

  /* blush & lips */
  r(ctx, x + 3, y + 8, 2, 1, BLUSH);
  r(ctx, x + 9, y + 8, 2, 1, BLUSH);
  r(ctx, x + 6, y + 9, 3, 1, LIPS);

  /* neck */
  r(ctx, x + 5, y + 12, 4, 2, SKIN);

  /* body / shirt */
  r(ctx, x + 2, y + 14, 10, 5, SHIRT);
  r(ctx, x + 2, y + 18, 10, 1, SHIRT_SHADOW);

  /* arms at sides */
  r(ctx, x + 1, y + 14, 2, 6, SHIRT);
  r(ctx, x, y + 19, 2, 2, SKIN);
  r(ctx, x + 11, y + 14, 2, 6, SHIRT);
  r(ctx, x + 12, y + 19, 2, 2, SKIN);

  /* white skirt */
  r(ctx, x + 1, y + 19, 12, 6, SKIRT);
  r(ctx, x, y + 21, 14, 4, SKIRT);
  r(ctx, x, y + 23, 14, 2, SKIRT_SHADOW);

  /* legs */
  r(ctx, x + 3, y + 25, 3, 4, SKIN);
  r(ctx, x + 8, y + 25, 3, 4, SKIN);

  /* shoes */
  r(ctx, x + 2, y + 28, 4, 2, "#2d2d2d");
  r(ctx, x + 8, y + 28, 4, 2, "#2d2d2d");
}

/* ── character: spinning ─────────────────────────────────── */
function drawTinaSpinning(
  ctx: CanvasRenderingContext2D,
  progress: number,
  spinCount: number,
) {
  const x = 73;
  const y = 46;

  /* oscillating values for spin feel */
  const angle = progress * Math.PI * 2;
  const hairShift = Math.sin(angle) * 3;
  const bodyBob = Math.sin(angle * 2) * 1;
  const skirtFlare = 4;

  /* hair back — shifts with spin */
  r(ctx, x + 1 + hairShift, y + bodyBob, 12, 14, HAIR);
  r(ctx, x + hairShift, y + 2 + bodyBob, 14, 10, HAIR);
  /* flowing hair tail */
  r(ctx, x + 10 + hairShift * 1.5, y + 12 + bodyBob, 5, 8, HAIR);
  r(ctx, x + 11 + hairShift * 1.5, y + 14 + bodyBob, 4, 6, HAIR_DARK);

  /* head */
  r(ctx, x + 2, y + 2 + bodyBob, 10, 10, SKIN);
  r(ctx, x + 2, y + 10 + bodyBob, 10, 2, SKIN_SHADOW);

  /* hair top */
  r(ctx, x + 1 + hairShift * 0.3, y + bodyBob, 12, 4, HAIR);
  r(ctx, x + 1 + hairShift * 0.3, y + 2 + bodyBob, 2, 10, HAIR);
  r(ctx, x + 2 + hairShift * 0.3, y + 3 + bodyBob, 4, 2, HAIR);

  /* face visible based on rotation */
  const facing = Math.cos(angle);
  if (facing > -0.2) {
    const alpha = Math.min(1, (facing + 0.2) / 0.7);
    ctx.globalAlpha = alpha;
    /* eyes */
    r(ctx, x + 4, y + 6 + bodyBob, 2, 2, "#fff");
    r(ctx, x + 5, y + 6 + bodyBob, 1, 2, EYE_IRIS);
    r(ctx, x + 4, y + 5 + bodyBob, 3, 1, HAIR);
    r(ctx, x + 8, y + 6 + bodyBob, 2, 2, "#fff");
    r(ctx, x + 9, y + 6 + bodyBob, 1, 2, EYE_IRIS);
    r(ctx, x + 8, y + 5 + bodyBob, 3, 1, HAIR);
    /* blush & lips */
    r(ctx, x + 3, y + 8 + bodyBob, 2, 1, BLUSH);
    r(ctx, x + 9, y + 8 + bodyBob, 2, 1, BLUSH);
    r(ctx, x + 6, y + 9 + bodyBob, 3, 1, LIPS);
    ctx.globalAlpha = 1;
  }

  /* neck */
  r(ctx, x + 5, y + 12 + bodyBob, 4, 2, SKIN);

  /* body / shirt */
  r(ctx, x + 2, y + 14 + bodyBob, 10, 5, SHIRT);
  r(ctx, x + 2, y + 18 + bodyBob, 10, 1, SHIRT_SHADOW);

  /* arms stretched out */
  const armWave = Math.sin(angle * 2) * 1;
  /* left arm */
  r(ctx, x - 5, y + 14 + armWave, 7, 2, SHIRT);
  r(ctx, x - 7, y + 14 + armWave, 3, 2, SKIN);
  /* right arm */
  r(ctx, x + 12, y + 14 - armWave, 7, 2, SHIRT);
  r(ctx, x + 18, y + 14 - armWave, 3, 2, SKIN);

  /* flared skirt */
  r(ctx, x + 1 - skirtFlare, y + 19, 12 + skirtFlare * 2, 6, SKIRT);
  r(ctx, x - skirtFlare, y + 21, 14 + skirtFlare * 2, 4, SKIRT);
  r(ctx, x - skirtFlare, y + 23, 14 + skirtFlare * 2, 2, SKIRT_SHADOW);

  /* legs */
  r(ctx, x + 3, y + 25, 3, 4, SKIN);
  r(ctx, x + 8, y + 25, 3, 4, SKIN);
  r(ctx, x + 2, y + 28, 4, 2, "#2d2d2d");
  r(ctx, x + 8, y + 28, 4, 2, "#2d2d2d");

  /* dizzy spiral particles */
  const numSpirals = Math.min(spinCount, 6);
  for (let i = 0; i < numSpirals; i++) {
    const sa = progress * Math.PI * 4 + (i * Math.PI * 2) / numSpirals;
    const dist = 14 + i * 2;
    const sx = x + 7 + Math.cos(sa) * dist;
    const sy = y + 8 + Math.sin(sa) * (dist * 0.45);
    ctx.globalAlpha = 0.5 + Math.sin(progress * Math.PI * 3 + i) * 0.3;
    r(ctx, sx, sy, 2, 2, STAR_COLOR);
    r(ctx, sx + 1, sy - 1, 1, 1, "#fff");
    ctx.globalAlpha = 1;
  }
}

/* ── character: falling ──────────────────────────────────── */
function drawTinaFalling(ctx: CanvasRenderingContext2D, progress: number) {
  const x = 73;
  const y = 46;
  const swayPhase = Math.min(progress / 0.35, 1);
  const fallPhase = progress > 0.35 ? (progress - 0.35) / 0.65 : 0;

  const swayX = swayPhase < 1 ? Math.sin(swayPhase * Math.PI * 5) * 4 : 0;
  const tiltX = fallPhase * 10;
  const bodyDrop = fallPhase * 12;
  const headDrop = fallPhase * 16;

  const ox = swayX + tiltX;

  /* hair back */
  r(ctx, x + 1 + ox, y + headDrop, 12, 14, HAIR);
  r(ctx, x + ox, y + 2 + headDrop, 14, 10, HAIR);
  r(ctx, x + 10 + ox, y + 12 + headDrop, 4, Math.max(2, 8 - headDrop * 0.3), HAIR);

  /* head */
  r(ctx, x + 2 + ox, y + 2 + headDrop, 10, 10, SKIN);
  r(ctx, x + 2 + ox, y + 10 + headDrop, 10, 2, SKIN_SHADOW);

  /* hair top */
  r(ctx, x + 1 + ox, y + headDrop, 12, 4, HAIR);
  r(ctx, x + 1 + ox, y + 2 + headDrop, 2, 10, HAIR);
  r(ctx, x + 2 + ox, y + 3 + headDrop, 4, 2, HAIR);

  /* spiral / X eyes */
  const ex = x + ox;
  const ey = y + 6 + headDrop;
  r(ctx, ex + 4, ey, 1, 1, HAIR);
  r(ctx, ex + 6, ey, 1, 1, HAIR);
  r(ctx, ex + 5, ey + 1, 1, 1, HAIR);
  r(ctx, ex + 4, ey + 2, 1, 1, HAIR);
  r(ctx, ex + 6, ey + 2, 1, 1, HAIR);
  r(ctx, ex + 8, ey, 1, 1, HAIR);
  r(ctx, ex + 10, ey, 1, 1, HAIR);
  r(ctx, ex + 9, ey + 1, 1, 1, HAIR);
  r(ctx, ex + 8, ey + 2, 1, 1, HAIR);
  r(ctx, ex + 10, ey + 2, 1, 1, HAIR);

  /* blush (intense) & lips */
  r(ctx, ex + 3, y + 8 + headDrop, 2, 1, "rgba(255,120,120,0.6)");
  r(ctx, ex + 9, y + 8 + headDrop, 2, 1, "rgba(255,120,120,0.6)");
  r(ctx, ex + 6, y + 9 + headDrop, 3, 1, LIPS);
  /* drool if slumped */
  if (fallPhase > 0.5)
    r(ctx, ex + 7, y + 10 + headDrop, 1, 1, LIPS);

  /* neck & body */
  const bt = tiltX * 0.6;
  r(ctx, x + 5 + swayX + bt, y + 12 + bodyDrop * 0.5, 4, 2, SKIN);
  r(ctx, x + 2 + swayX + bt * 0.5, y + 14 + bodyDrop * 0.3, 10, 5, SHIRT);
  r(ctx, x + 2 + swayX + bt * 0.5, y + 18 + bodyDrop * 0.3, 10, 1, SHIRT_SHADOW);

  /* arms (floppy) */
  r(ctx, x + 1 + swayX + bt * 0.5, y + 14 + bodyDrop * 0.3, 2, 6, SHIRT);
  r(ctx, x + swayX + bt * 0.5, y + 19 + bodyDrop * 0.3, 2, 2, SKIN);
  r(ctx, x + 11 + swayX + bt * 0.5, y + 14 + bodyDrop * 0.3, 2, 6, SHIRT);
  r(ctx, x + 12 + swayX + bt * 0.5, y + 19 + bodyDrop * 0.3, 2, 2, SKIN);

  /* skirt */
  r(ctx, x + 1 + swayX * 0.5, y + 19 + bodyDrop * 0.2, 12, 6, SKIRT);
  r(ctx, x + swayX * 0.5, y + 21 + bodyDrop * 0.2, 14, 4, SKIRT);
  r(ctx, x + swayX * 0.5, y + 23 + bodyDrop * 0.2, 14, 2, SKIRT_SHADOW);

  /* legs */
  r(ctx, x + 3, y + 25 + bodyDrop * 0.05, 3, 4, SKIN);
  r(ctx, x + 8, y + 25 + bodyDrop * 0.05, 3, 4, SKIN);
  r(ctx, x + 2, y + 28 + bodyDrop * 0.02, 4, 2, "#2d2d2d");
  r(ctx, x + 8, y + 28 + bodyDrop * 0.02, 4, 2, "#2d2d2d");

  /* floating dizzy stars */
  if (progress < 0.8) {
    for (let i = 0; i < 3; i++) {
      const sa = progress * Math.PI * 8 + (i * Math.PI * 2) / 3;
      const sx = x + 7 + ox + Math.cos(sa) * 10;
      const sy = y - 2 + headDrop + Math.sin(sa) * 5;
      ctx.globalAlpha = 1 - progress;
      r(ctx, sx, sy, 2, 2, STAR_COLOR);
      ctx.globalAlpha = 1;
    }
  }
}

/* ── component ───────────────────────────────────────────── */
export function JequitinhaGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgCacheRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);
  const stateRef = useRef<GameState>("idle");
  const animRef = useRef(0);
  const spinsRef = useRef(0);
  const prevTimeRef = useRef(0);
  const mountedRef = useRef(true);

  /* React state — only for UI rendering */
  const [uiState, setUiState] = useState<GameState>("idle");
  const [uiSpins, setUiSpins] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [dizziness, setDizziness] = useState(0);
  const [nickname, setNickname] = useState("");
  const [scoreSaved, setScoreSaved] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem("jequitinha-high");
      if (s) setHighScore(parseInt(s, 10));
      const n = localStorage.getItem("arcade-nickname");
      if (n) setNickname(n);
    } catch {
      /* noop */
    }
  }, []);

  /* Cache background once */
  useEffect(() => {
    const off = document.createElement("canvas");
    off.width = W;
    off.height = H;
    const c = off.getContext("2d");
    if (c) drawBackground(c);
    bgCacheRef.current = off;
  }, []);

  /* Single stable RAF loop — NO dependencies */
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
      if (state === "spinning") {
        const dur = Math.max(0.6, 1.2 - spinsRef.current * 0.05);
        animRef.current += clampedDt / dur;
        if (animRef.current >= 1) {
          animRef.current = 0;
          const chance = Math.min(spinsRef.current * 0.08, 0.9);
          if (Math.random() < chance) {
            stateRef.current = "falling";
            setUiState("falling");
          } else {
            stateRef.current = "idle";
            setUiState("idle");
          }
        }
      } else if (state === "falling") {
        animRef.current += clampedDt / 1.5;
        if (animRef.current >= 1) {
          animRef.current = 1;
          stateRef.current = "game_over";
          setUiState("game_over");
          const count = spinsRef.current;
          setHighScore((prev) => {
            const best = Math.max(prev, count);
            try {
              localStorage.setItem("jequitinha-high", String(best));
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
        switch (stateRef.current) {
          case "idle":
            drawTinaIdle(ctx);
            break;
          case "spinning":
            drawTinaSpinning(ctx, p, spinsRef.current);
            break;
          case "falling":
            drawTinaFalling(ctx, p);
            break;
          case "game_over":
            drawTinaFalling(ctx, 1);
            break;
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

  function spin() {
    if (stateRef.current !== "idle") return;
    spinsRef.current += 1;
    setUiSpins(spinsRef.current);
    setDizziness(Math.min(spinsRef.current * 0.08, 0.9));
    animRef.current = 0;
    stateRef.current = "spinning";
    setUiState("spinning");
  }

  function restart() {
    spinsRef.current = 0;
    setUiSpins(0);
    setDizziness(0);
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
      body: JSON.stringify({ game: "jequitinha", name, score: uiSpins }),
    }).catch(() => { /* silent fail */ });
  }

  const busy = uiState === "spinning" || uiState === "falling";

  return (
    <div className="jequitinha">
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className="jequitinha__canvas"
      />

      {/* HUD */}
      <div className="jequitinha__hud">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={uiSpins}
            className="chip"
            initial={{ scale: 1.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            Giros: {uiSpins}
          </motion.div>
        </AnimatePresence>
        <div className="chip" style={{ opacity: 0.7 }}>
          Recorde: {highScore}
        </div>
      </div>

      {/* Dizziness bar */}
      <div className="jequitinha__dizzy-bar">
        <span className="jequitinha__dizzy-label">Tontura</span>
        <div className="jequitinha__dizzy-track">
          <motion.div
            className="jequitinha__dizzy-fill"
            animate={{ width: `${dizziness * 100}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          />
        </div>
      </div>

      {/* Game Over Overlay */}
      <AnimatePresence>
        {uiState === "game_over" && (
          <motion.div
            className="jequitinha__overlay"
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
                color: "#8d5dff",
              }}
            >
              Ela ficou tonta!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{ margin: "0 0 0.15rem", color: "#b9b2d9" }}
            >
              Giros completados:{" "}
              <strong style={{ color: "#f7f4ff" }}>{uiSpins}</strong>
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
        <div className="jequitinha__controls">
          <motion.button
            className="btn btn--primary"
            onClick={spin}
            disabled={busy}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            style={{ opacity: busy ? 0.5 : 1 }}
          >
            Girar!
          </motion.button>
        </div>
      )}
    </div>
  );
}
