"use client";

import { useEffect, useRef } from "react";

/* ── virtual canvas (same as games) ─────────────────────── */
const W = 160;
const H = 90;

/* ── shared helper ──────────────────────────────────────── */
function r(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  fill: string,
) {
  ctx.fillStyle = fill;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

/* ================================================================
   TINA BEBE — bar scene + Tina on stool
   ================================================================ */
const TB_WALL = "#1a1520";
const TB_WALL_LIGHT = "#241e30";
const TB_SHELF_WOOD = "#5c3a1e";
const TB_SHELF_DARK = "#4a2e15";
const TB_COUNTER_TOP = "#6b4422";
const TB_COUNTER_FRONT = "#5c3a1e";
const TB_COUNTER_DARK = "#4a2e15";
const TB_STOOL_COLOR = "#3d2a14";
const TB_STOOL_SEAT = "#5c3a1e";
const TB_BOTTLES = ["#ff4f9d", "#8d5dff", "#42d9cf", "#f5a623", "#ff5f73"];
const TB_GLASS_COLOR = "rgba(200,220,255,0.55)";
const TB_GLASS_LIQUID = "#ff4f9d";

/* Tina palette */
const SKIN = "#fef5f0";
const SKIN_SH = "#f5e4da";
const HAIR = "#141418";
const HAIR_DK = "#0a0a0e";
const HAIR_HL = "#2a2a32";
const SHIRT = "#f0f0f5";
const SHIRT_SH = "#d2d2dc";
const LIPS = "#e8a0a0";
const EYE = "#2d6b3f";
const BLUSH = "rgba(255,160,160,0.35)";

function drawTinaBebePreview(ctx: CanvasRenderingContext2D) {
  /* background */
  r(ctx, 0, 0, W, H, TB_WALL);
  r(ctx, 40, 5, 80, 35, TB_WALL_LIGHT);

  /* back shelf + bottles */
  r(ctx, 20, 14, 120, 2, TB_SHELF_WOOD);
  r(ctx, 20, 16, 120, 1, TB_SHELF_DARK);
  for (let i = 0; i < TB_BOTTLES.length; i++) {
    const bx = 28 + i * 22;
    r(ctx, bx, 6, 4, 8, TB_BOTTLES[i]);
    r(ctx, bx + 1, 4, 2, 3, TB_BOTTLES[i]);
    r(ctx, bx + 3, 7, 1, 4, "rgba(255,255,255,0.25)");
  }

  /* second shelf */
  r(ctx, 30, 28, 100, 2, TB_SHELF_WOOD);
  r(ctx, 30, 30, 100, 1, TB_SHELF_DARK);
  for (let i = 0; i < 3; i++) {
    const bx = 45 + i * 28;
    r(ctx, bx, 21, 5, 7, TB_BOTTLES[(i + 2) % TB_BOTTLES.length]);
    r(ctx, bx + 1, 19, 3, 3, TB_BOTTLES[(i + 2) % TB_BOTTLES.length]);
  }

  /* counter */
  r(ctx, 0, 54, W, 4, TB_COUNTER_TOP);
  r(ctx, 0, 58, W, 32, TB_COUNTER_FRONT);
  r(ctx, 0, 86, W, 4, TB_COUNTER_DARK);
  r(ctx, 0, 54, W, 1, "rgba(255,255,255,0.12)");

  /* stool */
  r(ctx, 118, 62, 2, 18, TB_STOOL_COLOR);
  r(ctx, 130, 62, 2, 18, TB_STOOL_COLOR);
  r(ctx, 116, 60, 18, 3, TB_STOOL_SEAT);
  r(ctx, 118, 72, 14, 2, TB_STOOL_COLOR);

  /* glass on counter */
  r(ctx, 97, 47, 6, 7, TB_GLASS_COLOR);
  r(ctx, 98, 49, 4, 4, TB_GLASS_LIQUID);

  /* Tina sitting */
  const x = 119, y = 36;
  r(ctx, x + 1, y, 12, 14, HAIR);
  r(ctx, x, y + 2, 14, 10, HAIR);
  r(ctx, x + 10, y + 12, 4, 12, HAIR);
  r(ctx, x + 11, y + 14, 3, 10, HAIR_DK);
  r(ctx, x + 2, y + 2, 10, 10, SKIN);
  r(ctx, x + 2, y + 10, 10, 2, SKIN_SH);
  r(ctx, x + 1, y, 12, 4, HAIR);
  r(ctx, x + 2, y + 1, 3, 1, HAIR_HL);
  r(ctx, x + 1, y + 2, 2, 10, HAIR);
  r(ctx, x + 2, y + 3, 4, 2, HAIR);
  r(ctx, x + 2, y + 4, 3, 1, HAIR_DK);
  r(ctx, x + 4, y + 6, 2, 2, "#fff");
  r(ctx, x + 5, y + 6, 1, 2, EYE);
  r(ctx, x + 4, y + 5, 3, 1, HAIR);
  r(ctx, x + 8, y + 6, 2, 2, "#fff");
  r(ctx, x + 9, y + 6, 1, 2, EYE);
  r(ctx, x + 8, y + 5, 3, 1, HAIR);
  r(ctx, x + 3, y + 8, 2, 1, BLUSH);
  r(ctx, x + 9, y + 8, 2, 1, BLUSH);
  r(ctx, x + 6, y + 9, 3, 1, LIPS);
  r(ctx, x + 5, y + 12, 4, 2, SKIN);
  r(ctx, x + 2, y + 14, 10, 8, SHIRT);
  r(ctx, x + 2, y + 20, 10, 2, SHIRT_SH);
}

/* ================================================================
   JEQUITINHA — bedroom scene + Tina standing
   ================================================================ */
const JQ_WALL_UP = "#342648";
const JQ_WALL_LO = "#2a1e3a";
const JQ_FLOOR = "#6b4422";
const JQ_FLOOR_DK = "#5c3a1e";
const JQ_FLOOR_PL = "#7a5030";
const JQ_BED_FR = "#5c3a1e";
const JQ_BED_BL = "#c060a0";
const JQ_BED_BL_DK = "#a04888";
const JQ_BED_PIL = "#f0e0f0";
const JQ_WIN_FR = "#4a3860";
const JQ_NIGHT = "#0a0820";
const JQ_CURTAIN = "#c060a0";
const JQ_RUG_EDGE = "#6a3d88";
const JQ_RUG_MAIN = "#8050a0";
const JQ_RUG_CTR = "#9a68b8";
const JQ_SKIRT = "#f0f0f5";
const JQ_SKIRT_SH = "#d2d2dc";

function drawJequitinhaPreview(ctx: CanvasRenderingContext2D) {
  /* walls */
  r(ctx, 0, 0, W, 30, JQ_WALL_UP);
  r(ctx, 0, 30, W, 32, JQ_WALL_LO);

  /* floor — wooden planks */
  r(ctx, 0, 62, W, 28, JQ_FLOOR);
  r(ctx, 0, 62, W, 1, JQ_FLOOR_PL);
  for (let py = 68; py < H; py += 6) r(ctx, 0, py, W, 1, JQ_FLOOR_DK);
  for (let px = 0; px < W; px += 22) r(ctx, px, 62, 1, 28, JQ_FLOOR_DK);

  /* window */
  r(ctx, 12, 8, 30, 30, JQ_WIN_FR);
  r(ctx, 14, 10, 26, 26, JQ_NIGHT);
  r(ctx, 17, 14, 1, 1, "#fff");
  r(ctx, 24, 18, 1, 1, "#fff");
  r(ctx, 32, 12, 1, 1, "#fff");
  r(ctx, 20, 26, 1, 1, "#fff");
  r(ctx, 36, 24, 1, 1, "#fff");
  r(ctx, 28, 30, 1, 1, "#fff");
  r(ctx, 30, 14, 4, 4, "#f0e8d0");
  r(ctx, 31, 13, 3, 1, "#f0e8d0");
  r(ctx, 14, 22, 26, 1, JQ_WIN_FR);
  r(ctx, 26, 10, 1, 26, JQ_WIN_FR);
  r(ctx, 10, 6, 4, 34, JQ_CURTAIN);
  r(ctx, 40, 6, 4, 34, JQ_CURTAIN);
  r(ctx, 10, 6, 34, 3, JQ_CURTAIN);

  /* bed */
  r(ctx, 116, 42, 40, 20, JQ_BED_FR);
  r(ctx, 116, 40, 40, 3, JQ_BED_FR);
  r(ctx, 117, 43, 38, 6, "#f0e0e8");
  r(ctx, 117, 48, 38, 12, JQ_BED_BL);
  r(ctx, 117, 56, 38, 4, JQ_BED_BL_DK);
  r(ctx, 120, 43, 12, 5, JQ_BED_PIL);
  r(ctx, 121, 42, 10, 1, JQ_BED_PIL);

  /* rug */
  r(ctx, 52, 68, 56, 16, JQ_RUG_EDGE);
  r(ctx, 54, 70, 52, 12, JQ_RUG_MAIN);
  r(ctx, 60, 73, 40, 6, JQ_RUG_CTR);

  /* Tina standing on rug */
  const x = 73, y = 46;
  r(ctx, x + 1, y, 12, 14, HAIR);
  r(ctx, x, y + 2, 14, 10, HAIR);
  r(ctx, x + 10, y + 12, 4, 8, HAIR);
  r(ctx, x + 11, y + 14, 3, 6, HAIR_DK);
  r(ctx, x + 2, y + 2, 10, 10, SKIN);
  r(ctx, x + 2, y + 10, 10, 2, SKIN_SH);
  r(ctx, x + 1, y, 12, 4, HAIR);
  r(ctx, x + 2, y + 1, 3, 1, HAIR_HL);
  r(ctx, x + 1, y + 2, 2, 10, HAIR);
  r(ctx, x + 2, y + 3, 4, 2, HAIR);
  r(ctx, x + 2, y + 4, 3, 1, HAIR_DK);
  r(ctx, x + 4, y + 6, 2, 2, "#fff");
  r(ctx, x + 5, y + 6, 1, 2, EYE);
  r(ctx, x + 4, y + 5, 3, 1, HAIR);
  r(ctx, x + 8, y + 6, 2, 2, "#fff");
  r(ctx, x + 9, y + 6, 1, 2, EYE);
  r(ctx, x + 8, y + 5, 3, 1, HAIR);
  r(ctx, x + 3, y + 8, 2, 1, BLUSH);
  r(ctx, x + 9, y + 8, 2, 1, BLUSH);
  r(ctx, x + 6, y + 9, 3, 1, LIPS);
  r(ctx, x + 5, y + 12, 4, 2, SKIN);
  r(ctx, x + 2, y + 14, 10, 5, SHIRT);
  r(ctx, x + 2, y + 18, 10, 1, SHIRT_SH);

  /* arms at sides */
  r(ctx, x, y + 14, 2, 5, SHIRT);
  r(ctx, x - 1, y + 18, 2, 3, SKIN);
  r(ctx, x + 12, y + 14, 2, 5, SHIRT);
  r(ctx, x + 13, y + 18, 2, 3, SKIN);

  /* skirt */
  r(ctx, x + 1, y + 19, 12, 5, JQ_SKIRT);
  r(ctx, x + 1, y + 22, 12, 2, JQ_SKIRT_SH);
  r(ctx, x, y + 20, 14, 3, JQ_SKIRT);

  /* legs */
  r(ctx, x + 3, y + 24, 3, 5, SKIN);
  r(ctx, x + 8, y + 24, 3, 5, SKIN);
  r(ctx, x + 2, y + 28, 4, 2, "#2d2d2d");
  r(ctx, x + 8, y + 28, 4, 2, "#2d2d2d");

  /* dizzy stars around head */
  r(ctx, x - 2, y - 1, 2, 2, "#f0d060");
  r(ctx, x + 14, y + 1, 2, 2, "#f0d060");
  r(ctx, x + 6, y - 4, 2, 2, "#f0d060");
}

/* ================================================================
   SOCO NA CARA — boxing ring + Tina & Lito
   ================================================================ */
const SC_ARENA = "#0a0a14";
const SC_SPOT = "rgba(255,240,200,0.06)";
const SC_ROPE = "#cc3333";
const SC_ROPE_DK = "#991a1a";
const SC_POST = "#d4a830";
const SC_POST_DK = "#a88020";
const SC_MAT = "#c8b898";
const SC_MAT_DK = "#b8a880";
const SC_MAT_LN = "#a89878";
const SC_APRON = "#1a1430";

/* Lito palette */
const L_SKIN = "#c89070";
const L_SKIN_SH = "#b07858";
const L_HAIR = "#2a1a0a";
const L_TANK = "#2a2a3a";
const L_TANK_SH = "#1e1e2a";
const L_SHORTS = "#2a2a3a";
const L_EYE = "#3a2a1a";
const L_BROW = "#1a0e04";
const L_LIPS = "#a07060";

function drawSocoNaCaraPreview(ctx: CanvasRenderingContext2D) {
  /* arena */
  r(ctx, 0, 0, W, H, SC_ARENA);
  r(ctx, 40, 0, 80, 35, SC_SPOT);
  r(ctx, 50, 0, 60, 20, SC_SPOT);

  /* ring */
  r(ctx, 8, 58, 144, 32, SC_APRON);
  r(ctx, 10, 42, 140, 18, SC_MAT);
  r(ctx, 10, 56, 140, 4, SC_MAT_DK);
  r(ctx, 79, 44, 2, 14, SC_MAT_LN);
  r(ctx, 10, 42, 140, 1, "#d8c8a8");

  /* corner posts */
  r(ctx, 10, 28, 4, 32, SC_POST);
  r(ctx, 10, 28, 4, 2, "#e8c050");
  r(ctx, 12, 30, 2, 28, SC_POST_DK);
  r(ctx, 146, 28, 4, 32, SC_POST);
  r(ctx, 146, 28, 4, 2, "#e8c050");
  r(ctx, 146, 30, 2, 28, SC_POST_DK);

  /* ropes */
  for (let i = 0; i < 3; i++) {
    const ry = 32 + i * 5;
    r(ctx, 14, ry, 132, 2, SC_ROPE);
    r(ctx, 14, ry + 2, 132, 1, SC_ROPE_DK);
  }
  r(ctx, 14, 32, 132, 1, "#e04040");

  /* ── Tina (left, facing right) ── */
  const tx = 25, ty = 32;
  r(ctx, tx + 1, ty, 12, 14, HAIR);
  r(ctx, tx, ty + 2, 14, 10, HAIR);
  r(ctx, tx, ty + 12, 4, 8, HAIR);
  r(ctx, tx, ty + 14, 3, 6, HAIR_DK);
  r(ctx, tx + 2, ty + 2, 10, 10, SKIN);
  r(ctx, tx + 2, ty + 10, 10, 2, SKIN_SH);
  r(ctx, tx + 1, ty, 12, 4, HAIR);
  r(ctx, tx + 2, ty + 1, 3, 1, HAIR_HL);
  r(ctx, tx + 1, ty + 2, 2, 10, HAIR);
  r(ctx, tx + 2, ty + 3, 4, 2, HAIR);
  r(ctx, tx + 5, ty + 6, 2, 2, "#fff");
  r(ctx, tx + 6, ty + 6, 1, 2, EYE);
  r(ctx, tx + 5, ty + 5, 3, 1, HAIR);
  r(ctx, tx + 9, ty + 6, 2, 2, "#fff");
  r(ctx, tx + 10, ty + 6, 1, 2, EYE);
  r(ctx, tx + 9, ty + 5, 3, 1, HAIR);
  r(ctx, tx + 4, ty + 8, 2, 1, BLUSH);
  r(ctx, tx + 10, ty + 8, 2, 1, BLUSH);
  r(ctx, tx + 7, ty + 9, 3, 1, LIPS);
  r(ctx, tx + 5, ty + 12, 4, 2, SKIN);
  r(ctx, tx + 2, ty + 14, 10, 6, SHIRT);
  r(ctx, tx + 2, ty + 18, 10, 2, SHIRT_SH);
  /* fists */
  r(ctx, tx + 1, ty + 12, 2, 4, SHIRT);
  r(ctx, tx, ty + 11, 3, 2, SKIN);
  r(ctx, tx + 11, ty + 13, 2, 4, SHIRT);
  r(ctx, tx + 12, ty + 12, 3, 2, SKIN);
  /* shorts + legs */
  r(ctx, tx + 3, ty + 20, 8, 3, "#2d2d2d");
  r(ctx, tx + 3, ty + 23, 3, 4, SKIN);
  r(ctx, tx + 8, ty + 23, 3, 4, SKIN);
  r(ctx, tx + 2, ty + 26, 4, 2, "#2d2d2d");
  r(ctx, tx + 8, ty + 26, 4, 2, "#2d2d2d");

  /* ── Lito (right, facing left) ── */
  const lx = 115, ly = 30;
  r(ctx, lx + 1, ly + 1, 12, 3, L_HAIR);
  r(ctx, lx, ly + 2, 14, 2, L_HAIR);
  r(ctx, lx + 1, ly + 3, 12, 10, L_SKIN);
  r(ctx, lx + 1, ly + 11, 12, 2, L_SKIN_SH);
  r(ctx, lx + 3, ly + 5, 3, 1, L_BROW);
  r(ctx, lx + 8, ly + 5, 3, 1, L_BROW);
  r(ctx, lx + 3, ly + 6, 2, 2, "#fff");
  r(ctx, lx + 3, ly + 6, 1, 2, L_EYE);
  r(ctx, lx + 9, ly + 6, 2, 2, "#fff");
  r(ctx, lx + 9, ly + 6, 1, 2, L_EYE);
  r(ctx, lx + 5, ly + 10, 4, 1, L_LIPS);
  r(ctx, lx + 4, ly + 13, 6, 2, L_SKIN);
  r(ctx, lx + 1, ly + 15, 12, 6, L_TANK);
  r(ctx, lx + 1, ly + 19, 12, 2, L_TANK_SH);
  /* fists */
  r(ctx, lx - 1, ly + 13, 2, 4, L_TANK);
  r(ctx, lx - 3, ly + 12, 3, 3, L_SKIN);
  r(ctx, lx + 13, ly + 13, 2, 4, L_TANK);
  r(ctx, lx + 13, ly + 12, 3, 2, L_SKIN);
  /* shorts + legs */
  r(ctx, lx + 2, ly + 21, 10, 3, L_SHORTS);
  r(ctx, lx + 3, ly + 24, 3, 4, L_SKIN);
  r(ctx, lx + 8, ly + 24, 3, 4, L_SKIN);
  r(ctx, lx + 2, ly + 27, 4, 2, "#222");
  r(ctx, lx + 8, ly + 27, 4, 2, "#222");

  /* VS spark between them */
  r(ctx, 68, 38, 2, 2, "#fff8d0");
  r(ctx, 66, 40, 6, 2, "#fff8d0");
  r(ctx, 68, 42, 2, 2, "#fff8d0");
  r(ctx, 72, 36, 2, 2, "#fff8d0");
  r(ctx, 74, 40, 2, 2, "#fff8d0");
}

/* ================================================================
   PEGUE O BRUKEN — whack-a-mole with Bruken
   ================================================================ */
const PB_GROUND = "#1a2010";
const PB_GROUND_LT = "#243018";
const PB_HOLE_OUTER = "#0e0e08";
const PB_HOLE_INNER = "#1a1a10";
const PB_SKIN = "#fef5f0";
const PB_SKIN_SH = "#f0e0d4";
const PB_HAIR = "#3b2816";
const PB_HAIR_DK = "#2a1a0e";
const PB_EYE = "#4a3728";

function drawPegueOBrukenPreview(ctx: CanvasRenderingContext2D) {
  /* ground */
  r(ctx, 0, 0, W, H, PB_GROUND);
  r(ctx, 20, 5, 120, 80, PB_GROUND_LT);

  /* grass dots */
  for (let i = 0; i < 12; i++) {
    const gx = 5 + ((i * 37 + 11) % 150);
    const gy = 4 + ((i * 23 + 7) % 80);
    r(ctx, gx, gy, 1, 2, "#2a4018");
  }

  /* 3x3 hole grid */
  const holeW = 24, holeH = 8;
  const gridX = 26, gridY = 28, gapX = 18, gapY = 14;
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const cx = gridX + col * (holeW + gapX);
      const cy = gridY + row * (holeH + gapY);
      r(ctx, cx - 1, cy - 1, holeW + 2, holeH + 2, PB_HOLE_OUTER);
      r(ctx, cx, cy, holeW, holeH, PB_HOLE_INNER);
    }
  }

  /* Bruken head popping from center hole (row=1, col=1) */
  const bcx = gridX + 1 * (holeW + gapX);
  const bcy = gridY + 1 * (holeH + gapY);
  const hx = bcx + 5, hy = bcy - 12;

  /* head */
  r(ctx, hx, hy + 2, 14, 10, PB_SKIN);
  r(ctx, hx, hy + 10, 14, 2, PB_SKIN_SH);

  /* hair top */
  r(ctx, hx + 1, hy, 12, 4, PB_HAIR);
  r(ctx, hx, hy + 1, 14, 3, PB_HAIR);
  r(ctx, hx + 2, hy, 3, 1, PB_HAIR_DK);

  /* eyes */
  r(ctx, hx + 3, hy + 6, 2, 2, "#fff");
  r(ctx, hx + 4, hy + 6, 1, 2, PB_EYE);
  r(ctx, hx + 9, hy + 6, 2, 2, "#fff");
  r(ctx, hx + 10, hy + 6, 1, 2, PB_EYE);

  /* brows */
  r(ctx, hx + 3, hy + 5, 3, 1, PB_HAIR);
  r(ctx, hx + 9, hy + 5, 3, 1, PB_HAIR);

  /* mouth (nervous smile) */
  r(ctx, hx + 5, hy + 9, 4, 1, "#c09080");

  /* Bruken also peeking from top-right hole (row=0, col=2) */
  const pcx = gridX + 2 * (holeW + gapX);
  const pcy = gridY + 0 * (holeH + gapY);
  const px2 = pcx + 7, py2 = pcy - 5;
  r(ctx, px2, py2 + 2, 10, 5, PB_SKIN);
  r(ctx, px2 + 1, py2, 8, 3, PB_HAIR);
  r(ctx, px2, py2 + 1, 10, 2, PB_HAIR);
  r(ctx, px2 + 2, py2 + 4, 2, 1, "#fff");
  r(ctx, px2 + 3, py2 + 4, 1, 1, PB_EYE);
  r(ctx, px2 + 6, py2 + 4, 2, 1, "#fff");
  r(ctx, px2 + 7, py2 + 4, 1, 1, PB_EYE);

  /* click target indicator */
  r(ctx, hx + 5, hy - 3, 4, 1, "#ff4f4f");
  r(ctx, hx + 6, hy - 4, 2, 1, "#ff4f4f");
  r(ctx, hx + 6, hy - 2, 2, 1, "#ff4f4f");
}

/* ================================================================
   TINA KISS — park chase scene
   ================================================================ */
const TK_SKY = "#4a8ac0";
const TK_GRASS = "#3a8830";
const TK_GRASS_LT = "#4aa040";
const TK_FENCE = "#a08060";
const TK_TREE = "#2e7028";
const TK_TREE_LT = "#3a8830";
const TK_TRUNK = "#5c3a1e";

function drawTinaKissPreview(ctx: CanvasRenderingContext2D) {
  /* sky */
  r(ctx, 0, 0, W, 30, TK_SKY);
  r(ctx, 0, 20, W, 12, "#6aa8d8");

  /* clouds */
  r(ctx, 25, 6, 14, 4, "rgba(255,255,255,0.45)");
  r(ctx, 27, 4, 10, 3, "rgba(255,255,255,0.45)");
  r(ctx, 110, 8, 18, 4, "rgba(255,255,255,0.35)");

  /* grass */
  r(ctx, 0, 30, W, 60, TK_GRASS);
  r(ctx, 0, 30, W, 2, TK_GRASS_LT);

  /* fence */
  for (let fx = 4; fx < W - 4; fx += 12) {
    r(ctx, fx, 24, 2, 8, TK_FENCE);
  }
  r(ctx, 4, 26, W - 8, 2, TK_FENCE);
  r(ctx, 4, 30, W - 8, 2, TK_FENCE);

  /* trees */
  r(ctx, 4, 30, 3, 10, TK_TRUNK);
  r(ctx, -2, 16, 14, 14, TK_TREE);
  r(ctx, 2, 18, 8, 4, TK_TREE_LT);
  r(ctx, W - 7, 28, 3, 12, TK_TRUNK);
  r(ctx, W - 14, 16, 16, 14, TK_TREE);
  r(ctx, W - 10, 18, 8, 4, TK_TREE_LT);

  /* ── Tina (left, facing right) ── */
  const tx = 40, ty = 46;
  /* hair back */
  r(ctx, tx, ty + 1, 2, 16, HAIR);
  /* head */
  r(ctx, tx + 2, ty + 1, 6, 6, SKIN);
  /* hair top */
  r(ctx, tx + 1, ty, 7, 2, HAIR);
  r(ctx, tx + 1, ty + 1, 2, 3, HAIR);
  /* eye */
  r(ctx, tx + 6, ty + 3, 1.5, 1.5, EYE);
  r(ctx, tx + 6, ty + 2.5, 2, 0.5, HAIR);
  /* blush */
  r(ctx, tx + 6, ty + 4.5, 1.5, 0.8, BLUSH);
  /* lips */
  r(ctx, tx + 6, ty + 5.5, 1.5, 0.5, LIPS);
  /* body */
  r(ctx, tx + 3, ty + 8, 4, 6, SHIRT);
  r(ctx, tx + 3, ty + 14, 4, 2, "#2d2d2d");
  r(ctx, tx + 4, ty + 16, 2, 3, SKIN);
  r(ctx, tx + 3, ty + 18, 3, 1, "#2d2d2d");

  /* ── floating hearts ── */
  /* heart 1 */
  r(ctx, 55, 42, 2, 2, "#ff4f6a");
  r(ctx, 58, 42, 2, 2, "#ff4f6a");
  r(ctx, 54, 43, 7, 2, "#ff4f6a");
  r(ctx, 55, 45, 5, 1, "#ff4f6a");
  r(ctx, 56, 46, 3, 1, "#ff4f6a");
  r(ctx, 57, 47, 1, 1, "#ff4f6a");
  /* heart 2 (smaller) */
  r(ctx, 62, 46, 1, 1, "#ff4f6a");
  r(ctx, 64, 46, 1, 1, "#ff4f6a");
  r(ctx, 61, 47, 5, 1, "#ff4f6a");
  r(ctx, 62, 48, 3, 1, "#ff4f6a");
  r(ctx, 63, 49, 1, 1, "#ff4f6a");

  /* ── Lucas (right, facing left) ── */
  const lx = 100, ly = 46;
  /* head */
  r(ctx, lx + 2, ly + 1, 6, 6, "#fef5f0");
  r(ctx, lx + 2, ly + 5.5, 6, 1, "#f0ddd0");
  /* hair (spiked) */
  r(ctx, lx + 1, ly, 7, 2, "#3b2816");
  r(ctx, lx + 3, ly - 0.5, 2, 1, "#3b2816");
  r(ctx, lx + 5.5, ly - 0.5, 1.5, 1, "#3b2816");
  /* eye */
  r(ctx, lx + 3, ly + 3, 1.5, 1.5, "#fff");
  r(ctx, lx + 3, ly + 3, 0.5, 1.5, "#4a3728");
  /* brow */
  r(ctx, lx + 3, ly + 2.5, 2, 0.5, "#2a1a0a");
  /* surprised mouth */
  r(ctx, lx + 3.5, ly + 5.5, 1.5, 1, "#4a2020");
  /* piercing */
  r(ctx, lx + 1, ly + 3.5, 1, 1, "#c0c0c0");
  /* sweat */
  r(ctx, lx - 1, ly + 2, 1, 1.5, "rgba(100,180,255,0.6)");
  /* body */
  r(ctx, lx + 3, ly + 8, 4, 6, "#2a4a6a");
  r(ctx, lx + 3, ly + 14, 4, 2, "#2d2d2d");
  r(ctx, lx + 4, ly + 16, 2, 3, "#fef5f0");
  r(ctx, lx + 3, ly + 18, 3, 1, "#222");
}

/* ================================================================
   CHUVA DE CIGARRO — night alley + Tina + falling items
   ================================================================ */
const CC_SKY = "#1a1530";
const CC_BRICK = "#6a3a2a";
const CC_BRICK_DK = "#4a2a1e";
const CC_GROUND = "#3a3530";
const CC_GROUND_DK = "#2a2520";
const CC_CIG_PAPER = "#f5f0e8";
const CC_CIG_FILTER = "#d4883c";
const CC_CIG_TIP = "#ff4a2a";
const CC_GOLD = "#ffd700";
const CC_BROC = "#2d6b1e";

function drawChuvaDecigarroPreview(ctx: CanvasRenderingContext2D) {
  /* sky */
  r(ctx, 0, 0, W, 30, CC_SKY);
  r(ctx, 0, 25, W, 10, "#241e3a");

  /* stars */
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  const stars = [[12, 4], [35, 8], [58, 3], [90, 6], [115, 10], [140, 5], [70, 12], [105, 2]];
  for (const [sx, sy] of stars) ctx.fillRect(sx, sy, 1, 1);

  /* brick wall */
  for (let row = 0; row < 8; row++) {
    const by = 10 + row * 4;
    const offset = row % 2 === 0 ? 0 : 5;
    for (let col = -1; col < 18; col++) {
      const bx = offset + col * 10;
      r(ctx, bx, by, 9, 3, CC_BRICK);
      r(ctx, bx + 1, by + 1, 7, 1, CC_BRICK_DK);
    }
  }

  /* ground */
  r(ctx, 0, 72, W, 18, CC_GROUND);
  r(ctx, 0, 72, W, 1, CC_GROUND_DK);

  /* streetlamp */
  r(ctx, 14, 8, 2, 64, "#555");
  r(ctx, 11, 6, 8, 3, "#444");
  r(ctx, 13, 6, 4, 2, "#ffe880");
  ctx.fillStyle = "rgba(255,220,140,0.12)";
  ctx.fillRect(6, 8, 18, 16);

  /* dumpster */
  r(ctx, W - 22, 60, 18, 12, "#3a5540");
  r(ctx, W - 14, 56, 14, 4, "#4a6a50");

  /* ── Tina at bottom center ── */
  const tx = 72, ty = 52;
  /* hair */
  r(ctx, tx - 1, ty + 1, 12, 6, HAIR);
  r(ctx, tx - 1, ty + 5, 3, 8, HAIR);
  r(ctx, tx + 8, ty + 5, 3, 8, HAIR);
  /* head */
  r(ctx, tx + 1, ty + 1, 8, 6, SKIN);
  /* hair top */
  r(ctx, tx, ty, 10, 2, HAIR);
  r(ctx, tx, ty + 1, 2, 2, HAIR);
  r(ctx, tx + 8, ty + 1, 2, 2, HAIR);
  /* eyes */
  r(ctx, tx + 3, ty + 3, 1.5, 1.5, EYE);
  r(ctx, tx + 6, ty + 3, 1.5, 1.5, EYE);
  /* blush */
  r(ctx, tx + 2, ty + 4.5, 1.5, 0.8, BLUSH);
  r(ctx, tx + 7, ty + 4.5, 1.5, 0.8, BLUSH);
  /* smile */
  r(ctx, tx + 4, ty + 5.5, 3, 0.5, LIPS);
  /* body */
  r(ctx, tx + 2, ty + 8, 6, 6, SHIRT);
  r(ctx, tx + 2, ty + 14, 6, 2, "#2d2d2d");
  /* legs */
  r(ctx, tx + 3, ty + 16, 2, 3, SKIN);
  r(ctx, tx + 5, ty + 16, 2, 3, SKIN);

  /* ── falling cigarettes ── */
  /* cig 1 */
  r(ctx, 30, 24, 7, 2, CC_CIG_PAPER);
  r(ctx, 37, 24, 3, 2, CC_CIG_FILTER);
  r(ctx, 29, 24, 1, 2, CC_CIG_TIP);
  /* cig 2 */
  r(ctx, 100, 38, 7, 2, CC_CIG_PAPER);
  r(ctx, 107, 38, 3, 2, CC_CIG_FILTER);
  r(ctx, 99, 38, 1, 2, CC_CIG_TIP);
  /* golden cig */
  r(ctx, 55, 14, 7, 2, CC_GOLD);
  r(ctx, 62, 14, 3, 2, "#c8a020");
  r(ctx, 54, 14, 1, 2, "#ffaa00");
  /* sparkle */
  r(ctx, 57, 12, 1, 1, "#fff");
  r(ctx, 60, 13, 1, 1, "#fff");

  /* ── falling broccoli ── */
  r(ctx, 122, 28, 2, 4, "#4a7a30");
  r(ctx, 120, 25, 6, 4, CC_BROC);
  r(ctx, 121, 24, 4, 2, CC_BROC);

  /* smoke wisps near Tina */
  ctx.fillStyle = "rgba(200,200,220,0.25)";
  ctx.fillRect(78, 48, 1, 1);
  ctx.fillRect(79, 46, 1, 1);
  ctx.fillRect(77, 44, 1, 1);
}

/* ── main component ─────────────────────────────────────── */
type Props = { game: string };

export function GamePreview({ game }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    cvs.width = W;
    cvs.height = H;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    switch (game) {
      case "tina-bebe":
        drawTinaBebePreview(ctx);
        break;
      case "jequitinha":
        drawJequitinhaPreview(ctx);
        break;
      case "soco-na-cara":
        drawSocoNaCaraPreview(ctx);
        break;
      case "pegue-o-bruken":
        drawPegueOBrukenPreview(ctx);
        break;
      case "tina-kiss":
        drawTinaKissPreview(ctx);
        break;
      case "chuva-de-cigarro":
        drawChuvaDecigarroPreview(ctx);
        break;
    }
  }, [game]);

  return (
    <canvas
      ref={canvasRef}
      className="game-preview"
      aria-hidden
    />
  );
}
