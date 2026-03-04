import { NextRequest, NextResponse } from "next/server";
import { redisPipeline } from "@/lib/redis";

const MAX_CHARACTERS = 50;

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

type CharacterData = {
  name: string;
  style: string;
  hairStyle: string;
  accessory: string;
  skin: string;
  hair: string;
  eye: string;
  shirt: string;
  pants: string;
  createdAt: number;
};

/* ── GET /api/admin/characters — list pending + approved ──── */
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "nao autorizado" }, { status: 401 });
  }

  const data = await redisPipeline([
    ["HGETALL", "pending_characters"],
    ["HGETALL", "characters"],
  ]);

  if (!data) {
    return NextResponse.json({ pending: [], approved: [] });
  }

  function parseHash(raw: string[]): (CharacterData & { id: string })[] {
    const list: (CharacterData & { id: string })[] = [];
    for (let i = 0; i < raw.length; i += 2) {
      try {
        const parsed = JSON.parse(raw[i + 1]) as CharacterData;
        list.push({ id: raw[i], ...parsed });
      } catch {
        /* skip malformed */
      }
    }
    list.sort((a, b) => b.createdAt - a.createdAt);
    return list;
  }

  const pending = parseHash((data[0]?.result as string[]) || []);
  const approved = parseHash((data[1]?.result as string[]) || []);

  return NextResponse.json(
    { pending, approved },
    { headers: { "Cache-Control": "no-store" } },
  );
}

/* ── POST /api/admin/characters — approve or reject ──────── */
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "nao autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { clientId, action } = body as { clientId: string; action: string };

    if (!clientId || typeof clientId !== "string") {
      return NextResponse.json({ error: "id invalido" }, { status: 400 });
    }
    if (action !== "approve" && action !== "reject" && action !== "remove") {
      return NextResponse.json({ error: "acao invalida" }, { status: 400 });
    }

    /* remove: delete an approved character */
    if (action === "remove") {
      const result = await redisPipeline([
        ["HDEL", "characters", clientId],
      ]);
      if (!result) {
        return NextResponse.json(
          { error: "servico indisponivel" },
          { status: 503 },
        );
      }
      return NextResponse.json({ ok: true, action: "removed" });
    }

    if (action === "reject") {
      const result = await redisPipeline([
        ["HDEL", "pending_characters", clientId],
      ]);
      if (!result) {
        return NextResponse.json(
          { error: "servico indisponivel" },
          { status: 503 },
        );
      }
      return NextResponse.json({ ok: true, action: "rejected" });
    }

    /* approve: move from pending → approved */
    const pending = await redisPipeline([
      ["HGET", "pending_characters", clientId],
    ]);

    if (!pending?.[0]?.result) {
      return NextResponse.json(
        { error: "personagem nao encontrado" },
        { status: 404 },
      );
    }

    const charData = pending[0].result as string;

    const result = await redisPipeline([
      ["HSET", "characters", clientId, charData],
      ["HDEL", "pending_characters", clientId],
      ["HLEN", "characters"],
    ]);

    if (!result) {
      return NextResponse.json(
        { error: "servico indisponivel" },
        { status: 503 },
      );
    }

    /* enforce cap — remove oldest if over limit */
    const count = result[2]?.result as number;
    if (count > MAX_CHARACTERS) {
      const all = await redisPipeline([["HGETALL", "characters"]]);
      if (all?.[0]?.result) {
        const entries = all[0].result as string[];
        let oldestId = "";
        let oldestTime = Infinity;
        for (let i = 0; i < entries.length; i += 2) {
          if (entries[i] === clientId) continue;
          try {
            const parsed = JSON.parse(entries[i + 1]) as CharacterData;
            if (parsed.createdAt < oldestTime) {
              oldestTime = parsed.createdAt;
              oldestId = entries[i];
            }
          } catch {
            /* skip */
          }
        }
        if (oldestId) {
          await redisPipeline([["HDEL", "characters", oldestId]]);
        }
      }
    }

    return NextResponse.json({ ok: true, action: "approved" });
  } catch {
    return NextResponse.json({ error: "erro interno" }, { status: 500 });
  }
}
