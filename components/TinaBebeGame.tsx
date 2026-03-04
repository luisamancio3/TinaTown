"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ── virtual canvas size ─────────────────────────────────── */
const W = 160;
const H = 90;
const PX = 2;

/* ── palette (matches WalkingCharacters Fruttinha) ───────── */
const SKIN = "#fef5f0";
const SKIN_SHADOW = "#f5e4da";
const HAIR = "#141418";
const HAIR_DARK = "#0a0a0e";
const HAIR_HIGHLIGHT = "#2a2a32";
const SHIRT = "#f0f0f5";
const SHIRT_SHADOW = "#d2d2dc";
const LIPS = "#e8a0a0";
const EYE_IRIS = "#2d6b3f";
const BLUSH = "rgba(255,160,160,0.35)";

/* bar scene colors */
const WALL = "#1a1520";
const WALL_LIGHT = "#241e30";
const SHELF_WOOD = "#5c3a1e";
const SHELF_DARK = "#4a2e15";
const COUNTER_TOP = "#6b4422";
const COUNTER_FRONT = "#5c3a1e";
const COUNTER_DARK = "#4a2e15";
const STOOL_COLOR = "#3d2a14";
const STOOL_SEAT = "#5c3a1e";
const GLASS_COLOR = "rgba(200,220,255,0.55)";
const GLASS_LIQUID = "#ff4f9d";

const BOTTLES = ["#ff4f9d", "#8d5dff", "#42d9cf", "#f5a623", "#ff5f73"];

/* ── game states ─────────────────────────────────────────── */
type GameState = "idle" | "serving" | "drinking" | "passing_out" | "game_over";

/* ── helpers ──────────────────────────────────────────────── */
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.min(Math.max(t, 0), 1);
}

function r(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fill: string) {
  ctx.fillStyle = fill;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

/* ── drawing functions ───────────────────────────────────── */

function drawBackground(ctx: CanvasRenderingContext2D) {
  r(ctx, 0, 0, W, H, WALL);
  r(ctx, 40, 5, 80, 35, WALL_LIGHT);

  // back shelf
  r(ctx, 20, 14, 120, PX, SHELF_WOOD);
  r(ctx, 20, 14 + PX, 120, 1, SHELF_DARK);

  // bottles on shelf
  for (let i = 0; i < BOTTLES.length; i++) {
    const bx = 28 + i * 22;
    r(ctx, bx, 6, 4, 8, BOTTLES[i]);
    r(ctx, bx + 1, 4, 2, 3, BOTTLES[i]);
    r(ctx, bx + 3, 7, 1, 4, "rgba(255,255,255,0.25)");
  }

  // second shelf
  r(ctx, 30, 28, 100, PX, SHELF_WOOD);
  r(ctx, 30, 28 + PX, 100, 1, SHELF_DARK);
  for (let i = 0; i < 3; i++) {
    const bx = 45 + i * 28;
    r(ctx, bx, 21, 5, 7, BOTTLES[(i + 2) % BOTTLES.length]);
    r(ctx, bx + 1, 19, 3, 3, BOTTLES[(i + 2) % BOTTLES.length]);
    r(ctx, bx + 4, 22, 1, 4, "rgba(255,255,255,0.2)");
  }

  // counter
  r(ctx, 0, 54, W, 4, COUNTER_TOP);
  r(ctx, 0, 58, W, 32, COUNTER_FRONT);
  r(ctx, 0, 86, W, 4, COUNTER_DARK);
  r(ctx, 0, 54, W, 1, "rgba(255,255,255,0.12)");

  // stool
  r(ctx, 118, 62, PX, 18, STOOL_COLOR);
  r(ctx, 130, 62, PX, 18, STOOL_COLOR);
  r(ctx, 116, 60, 18, 3, STOOL_SEAT);
  r(ctx, 116, 60, 18, 1, "rgba(255,255,255,0.1)");
  r(ctx, 118, 72, 14, PX, STOOL_COLOR);
}

function drawTinaIdle(ctx: CanvasRenderingContext2D) {
  const x = 119, y = 36;

  // hair back
  r(ctx, x + 1, y, 12, 14, HAIR);
  r(ctx, x, y + 2, 14, 10, HAIR);
  r(ctx, x + 10, y + 12, 4, 12, HAIR);
  r(ctx, x + 11, y + 14, 3, 10, HAIR_DARK);

  // head
  r(ctx, x + 2, y + 2, 10, 10, SKIN);
  r(ctx, x + 2, y + 10, 10, 2, SKIN_SHADOW);

  // hair top & bangs
  r(ctx, x + 1, y, 12, 4, HAIR);
  r(ctx, x + 2, y + 1, 3, 1, HAIR_HIGHLIGHT);
  r(ctx, x + 1, y + 2, 2, 10, HAIR);
  r(ctx, x + 2, y + 3, 4, 2, HAIR);
  r(ctx, x + 2, y + 4, 3, 1, HAIR_DARK);

  // eyes
  r(ctx, x + 4, y + 6, 2, 2, "#fff");
  r(ctx, x + 5, y + 6, 1, 2, EYE_IRIS);
  r(ctx, x + 4, y + 5, 3, 1, HAIR);
  r(ctx, x + 8, y + 6, 2, 2, "#fff");
  r(ctx, x + 9, y + 6, 1, 2, EYE_IRIS);
  r(ctx, x + 8, y + 5, 3, 1, HAIR);

  // blush & lips
  r(ctx, x + 3, y + 8, 2, 1, BLUSH);
  r(ctx, x + 9, y + 8, 2, 1, BLUSH);
  r(ctx, x + 6, y + 9, 3, 1, LIPS);

  // neck
  r(ctx, x + 5, y + 12, 4, 2, SKIN);

  // body
  r(ctx, x + 2, y + 14, 10, 8, SHIRT);
  r(ctx, x + 2, y + 20, 10, 2, SHIRT_SHADOW);

  // arms
  r(ctx, x + 1, y + 15, 2, 6, SHIRT);
  r(ctx, x, y + 20, 2, 2, SKIN);
  r(ctx, x + 11, y + 15, 2, 6, SHIRT);
  r(ctx, x + 11, y + 20, 2, 2, SKIN);

  // legs
  r(ctx, x + 3, y + 22, 4, 2, "#2d2d2d");
  r(ctx, x + 7, y + 22, 4, 2, "#2d2d2d");
  r(ctx, x + 2, y + 24, 3, 2, SKIN);
  r(ctx, x + 8, y + 24, 3, 2, SKIN);
}

function drawTinaDrinking(ctx: CanvasRenderingContext2D, progress: number) {
  const x = 119, y = 36;
  const armLift = progress < 0.4 ? progress / 0.4 : progress < 0.7 ? 1 : 1 - (progress - 0.7) / 0.3;
  const tilt = progress > 0.3 && progress < 0.7 ? Math.min((progress - 0.3) / 0.2, 1) : 0;
  const headTilt = tilt * -1;

  // hair back
  r(ctx, x + 1, y, 12, 14, HAIR);
  r(ctx, x, y + 2, 14, 10, HAIR);
  r(ctx, x + 10, y + 12, 4, 12, HAIR);
  r(ctx, x + 11, y + 14, 3, 10, HAIR_DARK);

  // head
  r(ctx, x + 2, y + 2 + headTilt, 10, 10, SKIN);
  r(ctx, x + 2, y + 10 + headTilt, 10, 2, SKIN_SHADOW);

  // hair top
  r(ctx, x + 1, y + headTilt, 12, 4, HAIR);
  r(ctx, x + 2, y + 1 + headTilt, 3, 1, HAIR_HIGHLIGHT);
  r(ctx, x + 1, y + 2 + headTilt, 2, 10, HAIR);
  r(ctx, x + 2, y + 3 + headTilt, 4, 2, HAIR);
  r(ctx, x + 2, y + 4 + headTilt, 3, 1, HAIR_DARK);

  // eyes
  if (tilt > 0.5) {
    r(ctx, x + 4, y + 6 + headTilt, 3, 1, HAIR);
    r(ctx, x + 8, y + 6 + headTilt, 3, 1, HAIR);
  } else {
    r(ctx, x + 4, y + 6 + headTilt, 2, 2, "#fff");
    r(ctx, x + 5, y + 6 + headTilt, 1, 2, EYE_IRIS);
    r(ctx, x + 4, y + 5 + headTilt, 3, 1, HAIR);
    r(ctx, x + 8, y + 6 + headTilt, 2, 2, "#fff");
    r(ctx, x + 9, y + 6 + headTilt, 1, 2, EYE_IRIS);
    r(ctx, x + 8, y + 5 + headTilt, 3, 1, HAIR);
  }

  r(ctx, x + 3, y + 8 + headTilt, 2, 1, BLUSH);
  r(ctx, x + 9, y + 8 + headTilt, 2, 1, BLUSH);
  r(ctx, x + 6, y + 9 + headTilt, 3, 1, LIPS);

  // neck
  r(ctx, x + 5, y + 12, 4, 2, SKIN);

  // body
  r(ctx, x + 2, y + 14, 10, 8, SHIRT);
  r(ctx, x + 2, y + 20, 10, 2, SHIRT_SHADOW);

  // left arm + glass
  const armY = lerp(y + 15, y + 6, armLift);
  r(ctx, x + 1, armY, 2, 6, SHIRT);
  r(ctx, x, armY + 5, 2, 2, SKIN);
  const glassY = armY + 2;
  const glassX = x - 1;
  if (tilt > 0) {
    r(ctx, glassX - 1, glassY, 4, 5, GLASS_COLOR);
    const liquidH = Math.max(0, 3 - Math.floor(tilt * 3));
    if (liquidH > 0) r(ctx, glassX, glassY + (5 - liquidH), 2, liquidH, GLASS_LIQUID);
  } else {
    r(ctx, glassX, glassY, 3, 5, GLASS_COLOR);
    r(ctx, glassX + 1, glassY + 1, 1, 3, GLASS_LIQUID);
  }

  // right arm
  r(ctx, x + 11, y + 15, 2, 6, SHIRT);
  r(ctx, x + 11, y + 20, 2, 2, SKIN);

  // legs
  r(ctx, x + 3, y + 22, 4, 2, "#2d2d2d");
  r(ctx, x + 7, y + 22, 4, 2, "#2d2d2d");
  r(ctx, x + 2, y + 24, 3, 2, SKIN);
  r(ctx, x + 8, y + 24, 3, 2, SKIN);
}

function drawTinaPassingOut(ctx: CanvasRenderingContext2D, progress: number) {
  const x = 119, y = 36;
  const swayPhase = Math.min(progress / 0.4, 1);
  const slumpPhase = progress > 0.4 ? (progress - 0.4) / 0.6 : 0;
  const swayX = swayPhase < 1 ? Math.sin(swayPhase * Math.PI * 3) * 2 : 0;
  const bodyDropY = slumpPhase * 10;
  const headDropY = slumpPhase * 16;
  const eyeClose = Math.min(progress * 2, 1);

  // hair back
  r(ctx, x + 1 + swayX, y + headDropY, 12, 14, HAIR);
  r(ctx, x + swayX, y + 2 + headDropY, 14, 10, HAIR);
  r(ctx, x + 10 + swayX, y + 12 + headDropY, 4, Math.max(2, 12 - headDropY * 0.3), HAIR);

  // head
  r(ctx, x + 2 + swayX, y + 2 + headDropY, 10, 10, SKIN);
  r(ctx, x + 2 + swayX, y + 10 + headDropY, 10, 2, SKIN_SHADOW);

  // hair top
  r(ctx, x + 1 + swayX, y + headDropY, 12, 4, HAIR);
  r(ctx, x + 1 + swayX, y + 2 + headDropY, 2, 10, HAIR);
  r(ctx, x + 2 + swayX, y + 3 + headDropY, 4, 2, HAIR);

  // eyes
  if (eyeClose > 0.7) {
    r(ctx, x + 4 + swayX, y + 7 + headDropY, 3, 1, HAIR);
    r(ctx, x + 8 + swayX, y + 7 + headDropY, 3, 1, HAIR);
  } else if (eyeClose > 0.3) {
    r(ctx, x + 4 + swayX, y + 6 + headDropY, 2, 1, "#fff");
    r(ctx, x + 5 + swayX, y + 6 + headDropY, 1, 1, EYE_IRIS);
    r(ctx, x + 4 + swayX, y + 5 + headDropY, 3, 1, HAIR);
    r(ctx, x + 8 + swayX, y + 6 + headDropY, 2, 1, "#fff");
    r(ctx, x + 9 + swayX, y + 6 + headDropY, 1, 1, EYE_IRIS);
    r(ctx, x + 8 + swayX, y + 5 + headDropY, 3, 1, HAIR);
  } else {
    r(ctx, x + 4 + swayX, y + 6 + headDropY, 2, 2, "#fff");
    r(ctx, x + 5 + swayX, y + 6 + headDropY, 1, 2, EYE_IRIS);
    r(ctx, x + 4 + swayX, y + 5 + headDropY, 3, 1, HAIR);
    r(ctx, x + 8 + swayX, y + 6 + headDropY, 2, 2, "#fff");
    r(ctx, x + 9 + swayX, y + 6 + headDropY, 1, 2, EYE_IRIS);
    r(ctx, x + 8 + swayX, y + 5 + headDropY, 3, 1, HAIR);
  }

  // blush & lips
  r(ctx, x + 3 + swayX, y + 8 + headDropY, 2, 1, "rgba(255,120,120,0.5)");
  r(ctx, x + 9 + swayX, y + 8 + headDropY, 2, 1, "rgba(255,120,120,0.5)");
  r(ctx, x + 6 + swayX, y + 9 + headDropY, 3, 1, LIPS);
  if (slumpPhase > 0.5) r(ctx, x + 7 + swayX, y + 10 + headDropY, 1, 1, LIPS);

  // neck & body
  r(ctx, x + 5 + swayX, y + 12 + bodyDropY * 0.6, 4, 2, SKIN);
  r(ctx, x + 2 + swayX, y + 14 + bodyDropY * 0.3, 10, 8, SHIRT);
  r(ctx, x + 2 + swayX, y + 20 + bodyDropY * 0.2, 10, 2, SHIRT_SHADOW);

  // arms
  r(ctx, x + 1 + swayX, y + 15 + bodyDropY * 0.3, 2, 6, SHIRT);
  r(ctx, x + swayX, y + 20 + bodyDropY * 0.2, 2, 2, SKIN);
  r(ctx, x + 11 + swayX, y + 15 + bodyDropY * 0.3, 2, 6, SHIRT);
  r(ctx, x + 11 + swayX, y + 20 + bodyDropY * 0.2, 2, 2, SKIN);

  // legs
  r(ctx, x + 3, y + 22, 4, 2, "#2d2d2d");
  r(ctx, x + 7, y + 22, 4, 2, "#2d2d2d");
  r(ctx, x + 2, y + 24, 3, 2, SKIN);
  r(ctx, x + 8, y + 24, 3, 2, SKIN);
}

function drawBartenderHand(ctx: CanvasRenderingContext2D, progress: number) {
  let handX: number;
  if (progress < 0.4) {
    handX = lerp(-20, 80, progress / 0.4);
  } else if (progress < 0.6) {
    handX = 80;
  } else {
    handX = lerp(80, -20, (progress - 0.6) / 0.4);
  }

  r(ctx, handX - 18, 48, 20, 5, "#2a2a3a");
  r(ctx, handX, 47, 5, 6, "#e8cdb5");
  r(ctx, handX - 2, 47, 3, 6, "#fff");

  if (progress < 0.55) {
    r(ctx, handX + 3, 42, 4, 10, GLASS_COLOR);
    r(ctx, handX + 4, 44, 2, 6, GLASS_LIQUID);
    r(ctx, handX + 2, 42, 6, 1, "rgba(255,255,255,0.3)");
  }

  if (progress > 0.45) {
    ctx.globalAlpha = Math.min((progress - 0.45) / 0.1, 1);
    r(ctx, 104, 44, 4, 10, GLASS_COLOR);
    r(ctx, 105, 46, 2, 6, GLASS_LIQUID);
    r(ctx, 103, 44, 6, 1, "rgba(255,255,255,0.3)");
    ctx.globalAlpha = 1;
  }
}

/* ── component ────────────────────────────────────────────── */
export function TinaBebeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgCacheRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);
  const stateRef = useRef<GameState>("idle");
  const animRef = useRef(0);
  const drinksRef = useRef(0);
  const prevTimeRef = useRef(0);
  const mountedRef = useRef(true);

  /* React state — only for UI rendering */
  const [uiState, setUiState] = useState<GameState>("idle");
  const [uiDrinks, setUiDrinks] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [nickname, setNickname] = useState("");
  const [scoreSaved, setScoreSaved] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem("tina-bebe-high");
      if (s) setHighScore(parseInt(s, 10));
      const n = localStorage.getItem("arcade-nickname");
      if (n) setNickname(n);
    } catch { /* noop */ }
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

  /* Single stable RAF loop — NO dependencies, runs for component lifetime */
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

      // Cap dt to prevent huge jumps (e.g. after tab switch)
      const clampedDt = Math.min(dt, 0.1);

      const state = stateRef.current;

      /* ── advance animation ── */
      if (state === "serving") {
        animRef.current += clampedDt / 0.8;
        if (animRef.current >= 1) {
          animRef.current = 0;
          stateRef.current = "drinking";
          setUiState("drinking");
        }
      } else if (state === "drinking") {
        animRef.current += clampedDt / 1.0;
        if (animRef.current >= 1) {
          animRef.current = 0;
          const chance = Math.min(drinksRef.current * 0.10, 0.85);
          if (Math.random() < chance) {
            stateRef.current = "passing_out";
            setUiState("passing_out");
          } else {
            stateRef.current = "idle";
            setUiState("idle");
          }
        }
      } else if (state === "passing_out") {
        animRef.current += clampedDt / 1.3;
        if (animRef.current >= 1) {
          animRef.current = 1;
          stateRef.current = "game_over";
          setUiState("game_over");
          const count = drinksRef.current;
          setHighScore((prev) => {
            const best = Math.max(prev, count);
            try { localStorage.setItem("tina-bebe-high", String(best)); } catch { /* noop */ }
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
          case "serving":
            drawTinaIdle(ctx);
            drawBartenderHand(ctx, p);
            break;
          case "drinking":
            drawTinaDrinking(ctx, p);
            break;
          case "passing_out":
            drawTinaPassingOut(ctx, p);
            break;
          case "game_over":
            drawTinaPassingOut(ctx, 1);
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

  function serveDrink() {
    if (stateRef.current !== "idle") return;
    drinksRef.current += 1;
    setUiDrinks(drinksRef.current);
    animRef.current = 0;
    stateRef.current = "serving";
    setUiState("serving");
  }

  function restart() {
    drinksRef.current = 0;
    setUiDrinks(0);
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
      body: JSON.stringify({ game: "tina-bebe", name, score: uiDrinks }),
    }).catch(() => { /* silent fail */ });
  }

  const busy = uiState === "serving" || uiState === "drinking" || uiState === "passing_out";

  return (
    <div className="tina-bebe">
      <canvas ref={canvasRef} width={W} height={H} className="tina-bebe__canvas" />

      {/* HUD */}
      <div className="tina-bebe__hud">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={uiDrinks}
            className="chip"
            initial={{ scale: 1.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            Bebidas: {uiDrinks}
          </motion.div>
        </AnimatePresence>
        <div className="chip" style={{ opacity: 0.7 }}>
          Recorde: {highScore}
        </div>
      </div>

      {/* Game Over Overlay */}
      <AnimatePresence>
        {uiState === "game_over" && (
          <motion.div
            className="tina-bebe__overlay"
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
              Ela apagou!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{ margin: "0 0 0.15rem", color: "#b9b2d9" }}
            >
              Bebidas servidas: <strong style={{ color: "#f7f4ff" }}>{uiDrinks}</strong>
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
        <div className="tina-bebe__controls">
          <motion.button
            className="btn btn--primary"
            onClick={serveDrink}
            disabled={busy}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            style={{ opacity: busy ? 0.5 : 1 }}
          >
            Servir Drink
          </motion.button>
        </div>
      )}
    </div>
  );
}
