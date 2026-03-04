"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ── Tina with Hammer (SVG pixel art) ──────────────────── */
const PX = 4; /* pixel size */

function TinaHammer({ swinging }: { swinging: boolean }) {
  return (
    <div className="tina-hammer" aria-hidden>
      <svg
        width={12 * PX}
        height={14 * PX}
        viewBox={`0 0 ${12 * PX} ${14 * PX}`}
        style={{ imageRendering: "pixelated", overflow: "visible" }}
      >
        {/* ── Hammer (on right arm, animated via CSS) ── */}
        <g
          className={swinging ? "tina-hammer__swing" : "tina-hammer__idle"}
          style={{ transformOrigin: `${7 * PX}px ${6 * PX}px` }}
        >
          {/* handle */}
          <rect x={7 * PX} y={2.5 * PX} width={PX * 0.75} height={PX * 4} fill="#8b6914" />
          <rect x={7.75 * PX} y={2.5 * PX} width={PX * 0.25} height={PX * 4} fill="#6b5010" />
          {/* head */}
          <rect x={5.5 * PX} y={1 * PX} width={PX * 4} height={PX * 2} fill="#888" />
          <rect x={5.5 * PX} y={1 * PX} width={PX * 4} height={PX * 0.5} fill="#aaa" />
          <rect x={5.5 * PX} y={2.5 * PX} width={PX * 4} height={PX * 0.5} fill="#666" />
        </g>

        {/* ── Hair back ── */}
        <rect x={1.5 * PX} y={3 * PX} width={PX} height={PX * 6} fill="#141418" />
        <rect x={1.5 * PX} y={5 * PX} width={PX * 0.5} height={PX * 4} fill="#0a0a0e" />

        {/* ── Body ── */}
        <rect x={3 * PX} y={7.5 * PX} width={PX * 2} height={PX * 3} fill="#f0f0f5" />
        <rect x={3.5 * PX} y={8.5 * PX} width={PX} height={PX * 2} fill="#d2d2dc" />

        {/* ── Pants ── */}
        <rect x={3 * PX} y={10.5 * PX} width={PX * 2} height={PX} fill="#2d2d2d" />

        {/* ── Legs ── */}
        <rect x={3.5 * PX} y={11.5 * PX} width={PX} height={PX * 2} fill="#fef5f0" />

        {/* ── Left arm (at side) ── */}
        <rect x={2.25 * PX} y={7.5 * PX} width={PX * 0.75} height={PX * 2} fill="#f0f0f5" />
        <rect x={2 * PX} y={9 * PX} width={PX * 0.75} height={PX} fill="#fef5f0" />

        {/* ── Right arm (holding hammer) ── */}
        <rect x={5 * PX} y={7.5 * PX} width={PX * 0.75} height={PX * 1.5} fill="#f0f0f5" />
        <rect x={5.5 * PX} y={6 * PX} width={PX * 0.75} height={PX * 1.5} fill="#f0f0f5" />
        {/* hand gripping handle */}
        <rect x={6.5 * PX} y={5.5 * PX} width={PX} height={PX} fill="#fef5f0" />

        {/* ── Neck ── */}
        <rect x={4 * PX} y={7 * PX} width={PX} height={PX * 0.5} fill="#fef5f0" />

        {/* ── Head ── */}
        <rect x={3 * PX} y={4 * PX} width={PX * 3} height={PX * 3} fill="#fef5f0" />
        <rect x={3 * PX} y={6.5 * PX} width={PX * 3} height={PX * 0.5} fill="#f5e4da" />

        {/* ── Hair top ── */}
        <rect x={2 * PX} y={3.25 * PX} width={PX * 4} height={PX * 0.75} fill="#141418" />
        <rect x={2 * PX} y={3.5 * PX} width={PX} height={PX * 1.5} fill="#141418" />
        <rect x={2.5 * PX} y={4 * PX} width={PX * 0.5} height={PX * 2} fill="#141418" />
        <rect x={4.5 * PX} y={4 * PX} width={PX * 1.5} height={PX * 0.5} fill="#141418" />
        <rect x={5 * PX} y={4 * PX} width={PX} height={PX * 0.25} fill="#2a2a32" />

        {/* ── Eye ── */}
        <rect x={5 * PX} y={5 * PX} width={3} height={3} fill="#2d6b3f" />
        <rect x={5 * PX - 0.5} y={4.9 * PX} width={4} height={1} fill="#141418" />

        {/* ── Blush ── */}
        <rect x={5 * PX} y={5.75 * PX} width={PX * 0.75} height={PX * 0.4} fill="rgba(255,160,160,0.35)" />

        {/* ── Lips ── */}
        <rect x={5.25 * PX} y={6.25 * PX} width={PX * 0.75} height={PX * 0.25} fill="#e8a0a0" rx={0.5} />
      </svg>
    </div>
  );
}

/* ── virtual canvas size ─────────────────────────────────── */
const W = 160;
const H = 90;

/* ── Bruken palette (white male) ─────────────────────────── */
const B_SKIN = "#fef5f0";
const B_SKIN_SH = "#f0ddd0";
const B_HAIR = "#3b2816";
const B_HAIR_DK = "#2a1a0a";
const B_EYE = "#4a3728";
const B_BROW = "#2a1a0a";
const B_LIPS = "#d8a090";

/* ── scene colors ────────────────────────────────────────── */
const BG_DARK = "#0a0a14";
const GROUND = "#1a1520";
const GROUND_LIGHT = "#241e30";
const HOLE_OUTER = "#0a0610";
const HOLE_INNER = "#050308";
const BONK_STAR = "#f0d060";

/* ── hole grid layout (3×3) ──────────────────────────────── */
const COLS = 3;
const HOLE_W = 24;
const HOLE_H = 8;
const GRID_X = 26; /* left margin */
const GRID_Y = 28; /* top margin */
const GAP_X = 18;
const GAP_Y = 14;

function holePos(index: number): { cx: number; cy: number } {
  const col = index % COLS;
  const row = Math.floor(index / COLS);
  return {
    cx: GRID_X + col * (HOLE_W + GAP_X) + HOLE_W / 2,
    cy: GRID_Y + row * (HOLE_H + GAP_Y) + HOLE_H / 2,
  };
}

/* ── game states ─────────────────────────────────────────── */
type GameState = "idle" | "playing" | "game_over";

const MAX_MISSES = 3;
const BASE_SHOW_TIME = 1.2; /* seconds bruken is visible initially */
const MIN_SHOW_TIME = 0.4; /* fastest */
const SPEED_FACTOR = 0.06; /* seconds removed per score */

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

/* ── background ──────────────────────────────────────────── */
function drawBackground(ctx: CanvasRenderingContext2D) {
  /* sky / dark bg */
  r(ctx, 0, 0, W, H, BG_DARK);

  /* ground */
  r(ctx, 0, 20, W, 70, GROUND);
  r(ctx, 0, 20, W, 2, GROUND_LIGHT);

  /* draw 9 holes */
  for (let i = 0; i < 9; i++) {
    const { cx, cy } = holePos(i);
    /* outer shadow */
    r(ctx, cx - HOLE_W / 2 - 1, cy - HOLE_H / 2 - 1, HOLE_W + 2, HOLE_H + 2, HOLE_OUTER);
    /* inner */
    r(ctx, cx - HOLE_W / 2, cy - HOLE_H / 2, HOLE_W, HOLE_H, HOLE_INNER);
    /* rim highlight */
    r(ctx, cx - HOLE_W / 2, cy - HOLE_H / 2, HOLE_W, 1, GROUND_LIGHT);
  }
}

/* ── Bruken's head (pixel art, popping up) ───────────────── */
function drawBrukenHead(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  pop: number, /* 0 = hidden, 1 = fully popped */
) {
  if (pop <= 0) return;

  const headH = 14;
  const headW = 12;
  /* head rises from hole center — offset by pop */
  const rise = pop * (headH + 2);
  const hx = cx - headW / 2;
  const hy = cy - rise;

  /* clip to only show above hole — save and clip */
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, W, cy - HOLE_H / 2);
  ctx.clip();

  /* hair (short, on top) */
  r(ctx, hx, hy, headW, 4, B_HAIR);
  r(ctx, hx - 1, hy + 1, headW + 2, 3, B_HAIR);
  r(ctx, hx + 2, hy, 3, 1, B_HAIR_DK);

  /* head / face */
  r(ctx, hx + 1, hy + 3, headW - 2, 10, B_SKIN);
  r(ctx, hx + 1, hy + 11, headW - 2, 2, B_SKIN_SH);

  /* eyebrows */
  r(ctx, hx + 2, hy + 5, 3, 1, B_BROW);
  r(ctx, hx + 7, hy + 5, 3, 1, B_BROW);

  /* eyes */
  r(ctx, hx + 3, hy + 6, 2, 2, "#fff");
  r(ctx, hx + 4, hy + 6, 1, 2, B_EYE);
  r(ctx, hx + 7, hy + 6, 2, 2, "#fff");
  r(ctx, hx + 8, hy + 6, 1, 2, B_EYE);

  /* mouth */
  r(ctx, hx + 4, hy + 10, 4, 1, B_LIPS);

  /* ears */
  r(ctx, hx, hy + 5, 1, 3, B_SKIN_SH);
  r(ctx, hx + headW - 1, hy + 5, 1, 3, B_SKIN_SH);

  ctx.restore();
}

/* ── bonk / catch effect ─────────────────────────────────── */
function drawBonk(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  progress: number, /* 0→1 */
) {
  if (progress >= 1) return;
  const t = progress;
  const size = 4 + t * 8;
  ctx.globalAlpha = 1 - t;

  /* star burst */
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + t * Math.PI;
    const sx = cx + Math.cos(a) * size;
    const sy = cy - 8 + Math.sin(a) * size * 0.6;
    r(ctx, sx - 1, sy - 1, 2, 2, BONK_STAR);
  }
  /* center flash */
  r(ctx, cx - 2, cy - 10, 4, 4, "#fff");

  ctx.globalAlpha = 1;
}

/* ── miss X effect ───────────────────────────────────────── */
function drawMissX(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  progress: number,
) {
  if (progress >= 1) return;
  ctx.globalAlpha = 1 - progress;
  const y = cy - 10 - progress * 6;
  r(ctx, cx - 3, y, 2, 2, "#ff4040");
  r(ctx, cx + 1, y, 2, 2, "#ff4040");
  r(ctx, cx - 1, y + 2, 2, 2, "#ff4040");
  r(ctx, cx - 3, y + 4, 2, 2, "#ff4040");
  r(ctx, cx + 1, y + 4, 2, 2, "#ff4040");
  ctx.globalAlpha = 1;
}

/* ── component ───────────────────────────────────────────── */
export function PegueOBrukenGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgCacheRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);
  const prevTimeRef = useRef(0);
  const mountedRef = useRef(true);

  /* game logic refs */
  const stateRef = useRef<GameState>("idle");
  const scoreRef = useRef(0);
  const missesRef = useRef(0);
  const activeHoleRef = useRef(-1);
  const popRef = useRef(0); /* 0-1 pop progress */
  const popDirRef = useRef<"up" | "hold" | "down">("up");
  const holdTimerRef = useRef(0);
  const wasCaughtRef = useRef(false);
  const bonkRef = useRef({ active: false, hole: -1, progress: 0 });
  const missXRef = useRef({ active: false, hole: -1, progress: 0 });
  const cooldownRef = useRef(0);

  /* UI state */
  const [uiState, setUiState] = useState<GameState>("idle");
  const [uiScore, setUiScore] = useState(0);
  const [uiMisses, setUiMisses] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [nickname, setNickname] = useState("");
  const [scoreSaved, setScoreSaved] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem("pegue-o-bruken-high");
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

  /* pick next hole (avoid repeat) */
  function pickHole() {
    let next: number;
    do {
      next = Math.floor(Math.random() * 9);
    } while (next === activeHoleRef.current);
    return next;
  }

  /* how long Bruken stays visible */
  function getShowTime() {
    return Math.max(MIN_SHOW_TIME, BASE_SHOW_TIME - scoreRef.current * SPEED_FACTOR);
  }

  /* start new mole appearance */
  function spawnMole() {
    activeHoleRef.current = pickHole();
    popRef.current = 0;
    popDirRef.current = "up";
    holdTimerRef.current = 0;
    wasCaughtRef.current = false;
  }

  /* handle canvas click */
  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (stateRef.current !== "playing") return;
    if (activeHoleRef.current < 0) return;
    if (wasCaughtRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    const { cx, cy } = holePos(activeHoleRef.current);
    const dx = Math.abs(mx - cx);
    const dy = Math.abs(my - (cy - popRef.current * 14));

    /* generous hit box around head */
    if (dx < 16 && dy < 16 && popRef.current > 0.2) {
      /* CAUGHT! */
      wasCaughtRef.current = true;
      scoreRef.current += 1;
      setUiScore(scoreRef.current);
      bonkRef.current = { active: true, hole: activeHoleRef.current, progress: 0 };
      popDirRef.current = "down";
    }
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
        const popSpeed = 4; /* pop up/down speed */
        const showTime = getShowTime();

        if (activeHoleRef.current < 0) {
          /* cooldown between moles */
          cooldownRef.current -= dt;
          if (cooldownRef.current <= 0) {
            spawnMole();
          }
        } else {
          /* animate pop */
          if (popDirRef.current === "up") {
            popRef.current += dt * popSpeed;
            if (popRef.current >= 1) {
              popRef.current = 1;
              popDirRef.current = "hold";
              holdTimerRef.current = 0;
            }
          } else if (popDirRef.current === "hold") {
            holdTimerRef.current += dt;
            if (holdTimerRef.current >= showTime) {
              popDirRef.current = "down";
              if (!wasCaughtRef.current) {
                /* MISS — Bruken escaped */
                missesRef.current += 1;
                setUiMisses(missesRef.current);
                missXRef.current = { active: true, hole: activeHoleRef.current, progress: 0 };
              }
            }
          } else if (popDirRef.current === "down") {
            popRef.current -= dt * popSpeed;
            if (popRef.current <= 0) {
              popRef.current = 0;
              activeHoleRef.current = -1;
              cooldownRef.current = 0.3 + Math.random() * 0.3;

              /* check game over */
              if (missesRef.current >= MAX_MISSES) {
                stateRef.current = "game_over";
                setUiState("game_over");
                const count = scoreRef.current;
                setHighScore((prev) => {
                  const best = Math.max(prev, count);
                  try { localStorage.setItem("pegue-o-bruken-high", String(best)); } catch { /* noop */ }
                  return best;
                });
              }
            }
          }
        }

        /* advance bonk effect */
        if (bonkRef.current.active) {
          bonkRef.current.progress += dt * 3;
          if (bonkRef.current.progress >= 1) bonkRef.current.active = false;
        }
        /* advance miss X effect */
        if (missXRef.current.active) {
          missXRef.current.progress += dt * 2;
          if (missXRef.current.progress >= 1) missXRef.current.active = false;
        }
      }

      /* ── draw ── */
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (canvas && ctx) {
        ctx.clearRect(0, 0, W, H);
        if (bgCacheRef.current) ctx.drawImage(bgCacheRef.current, 0, 0);

        if (state === "playing" || state === "game_over") {
          /* draw Bruken in active hole */
          if (activeHoleRef.current >= 0 && popRef.current > 0) {
            const { cx, cy } = holePos(activeHoleRef.current);
            drawBrukenHead(ctx, cx, cy, popRef.current);
          }

          /* bonk effect */
          if (bonkRef.current.active) {
            const { cx, cy } = holePos(bonkRef.current.hole);
            drawBonk(ctx, cx, cy, bonkRef.current.progress);
          }

          /* miss X effect */
          if (missXRef.current.active) {
            const { cx, cy } = holePos(missXRef.current.hole);
            drawMissX(ctx, cx, cy, missXRef.current.progress);
          }
        }

        /* idle state — show Bruken peeking from center hole */
        if (state === "idle") {
          const { cx, cy } = holePos(4); /* center hole */
          const peekTime = time / 1000;
          const peek = 0.5 + Math.sin(peekTime * 2) * 0.3;
          drawBrukenHead(ctx, cx, cy, peek);
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
    missesRef.current = 0;
    activeHoleRef.current = -1;
    popRef.current = 0;
    wasCaughtRef.current = false;
    bonkRef.current = { active: false, hole: -1, progress: 0 };
    missXRef.current = { active: false, hole: -1, progress: 0 };
    cooldownRef.current = 0.5;
    prevTimeRef.current = 0;
    setUiScore(0);
    setUiMisses(0);
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
      body: JSON.stringify({ game: "pegue-o-bruken", name, score: uiScore }),
    }).catch(() => { /* silent fail */ });
  }

  return (
    <div className="pegue-o-bruken">
      <div className="pegue-o-bruken__game-area">
        {/* canvas + HUD + overlay wrapper */}
        <div className="pegue-o-bruken__canvas-wrap">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className="pegue-o-bruken__canvas"
            onClick={handleClick}
            style={{ cursor: uiState === "playing" ? "pointer" : "default" }}
          />

          {/* HUD */}
          {uiState === "playing" && (
            <div className="pegue-o-bruken__hud">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={uiScore}
                  className="chip"
                  initial={{ scale: 1.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  Pegos: {uiScore}
                </motion.div>
              </AnimatePresence>
              <div className="chip" style={{ opacity: 0.7 }}>
                {"X".repeat(uiMisses)}{"O".repeat(MAX_MISSES - uiMisses)}
              </div>
            </div>
          )}

          {/* Game Over Overlay */}
          <AnimatePresence>
            {uiState === "game_over" && (
              <motion.div
                className="pegue-o-bruken__overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <motion.h2
                  initial={{ scale: 0.6, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.15 }}
                  style={{ margin: "0 0 0.3rem", fontSize: "1.4rem", color: "#ff5f73" }}
                >
                  Bruken escapou!
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  style={{ margin: "0 0 0.15rem", color: "#b9b2d9" }}
                >
                  Pegos:{" "}
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

        {/* Tina with hammer */}
        <TinaHammer swinging={uiState === "playing"} />
      </div>

      {/* Start button */}
      {uiState === "idle" && (
        <div className="pegue-o-bruken__controls">
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
