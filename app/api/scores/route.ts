import { NextRequest, NextResponse } from "next/server";
import { redisPipeline } from "@/lib/redis";

const VALID_GAMES = ["tina-bebe", "jequitinha", "soco-na-cara", "pegue-o-bruken", "tina-kiss", "chuva-de-cigarro"];

/* ── GET /api/scores?game=tina-bebe ────────────────────── */
export async function GET(req: NextRequest) {
  const game = req.nextUrl.searchParams.get("game");

  if (!game || !VALID_GAMES.includes(game)) {
    return NextResponse.json(
      { top: [], recent: [] },
      {
        headers: { "Cache-Control": "no-store" },
      },
    );
  }

  const data = await redisPipeline([
    ["ZREVRANGE", `top:${game}`, "0", "9", "WITHSCORES"],
    ["LRANGE", `recent:${game}`, "0", "19"],
  ]);

  if (!data) {
    return NextResponse.json({ top: [], recent: [] });
  }

  /* parse top 10 from sorted set */
  const topRaw = (data[0]?.result as string[]) || [];
  const top: { name: string; score: number }[] = [];
  for (let i = 0; i < topRaw.length; i += 2) {
    const parts = topRaw[i].split(":");
    parts.pop(); // remove timestamp
    const name = parts.join(":"); // rejoin in case name had colons
    top.push({ name, score: parseInt(topRaw[i + 1], 10) });
  }

  /* parse recent from list */
  const recentRaw = (data[1]?.result as string[]) || [];
  const recent: { name: string; score: number; time: number }[] = [];
  for (const raw of recentRaw) {
    try {
      const entry = JSON.parse(raw);
      recent.push({
        name: entry.name,
        score: entry.score,
        time: entry.time,
      });
    } catch {
      /* skip malformed entries */
    }
  }

  return NextResponse.json(
    { top, recent },
    { headers: { "Cache-Control": "no-store" } },
  );
}

/* ── POST /api/scores ──────────────────────────────────── */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { game, name, score } = body as {
      game: string;
      name: string;
      score: number;
    };

    /* validate */
    if (!game || !VALID_GAMES.includes(game)) {
      return NextResponse.json(
        { error: "jogo invalido" },
        { status: 400 },
      );
    }
    if (
      !name ||
      typeof name !== "string" ||
      name.trim().length === 0 ||
      name.trim().length > 12
    ) {
      return NextResponse.json(
        { error: "nome deve ter 1-12 caracteres" },
        { status: 400 },
      );
    }
    if (typeof score !== "number" || score < 0 || !Number.isInteger(score)) {
      return NextResponse.json(
        { error: "pontuacao invalida" },
        { status: 400 },
      );
    }

    const cleanName = name.trim();
    const timestamp = Date.now();
    const member = `${cleanName}:${timestamp}`;
    const entry = JSON.stringify({
      name: cleanName,
      score,
      time: timestamp,
    });

    const result = await redisPipeline([
      ["ZADD", `top:${game}`, score.toString(), member],
      ["LPUSH", `recent:${game}`, entry],
      ["LTRIM", `recent:${game}`, "0", "19"],
    ]);

    if (!result) {
      return NextResponse.json(
        { error: "scoreboard indisponivel" },
        { status: 503 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "erro interno" },
      { status: 500 },
    );
  }
}
