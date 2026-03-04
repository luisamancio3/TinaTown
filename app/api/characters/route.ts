import { NextRequest, NextResponse } from "next/server";
import { redisPipeline } from "@/lib/redis";
import {
  SKIN_PRESETS,
  HAIR_PRESETS,
  EYE_PRESETS,
  SHIRT_PRESETS,
  PANTS_PRESETS,
  VALID_STYLES,
  VALID_HAIRSTYLES,
  VALID_ACCESSORIES,
} from "@/lib/colors";

const MAX_CHARACTERS = 50;

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

/* ── GET /api/characters ─────────────────────────────────── */
export async function GET() {
  const data = await redisPipeline([["HGETALL", "characters"]]);

  if (!data) {
    return NextResponse.json(
      { characters: [] },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      },
    );
  }

  /* HGETALL returns [field1, value1, field2, value2, ...] */
  const raw = (data[0]?.result as string[]) || [];
  const characters: (CharacterData & { id: string })[] = [];

  for (let i = 0; i < raw.length; i += 2) {
    try {
      const parsed = JSON.parse(raw[i + 1]) as CharacterData;
      characters.push({ id: raw[i], ...parsed });
    } catch {
      /* skip malformed entries */
    }
  }

  return NextResponse.json(
    { characters },
    {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    },
  );
}

/* ── POST /api/characters ────────────────────────────────── */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clientId, name, style, hairStyle, accessory, skin, hair, eye, shirt, pants } = body;

    /* validate clientId */
    if (
      !clientId ||
      typeof clientId !== "string" ||
      clientId.length < 16 ||
      clientId.length > 64
    ) {
      return NextResponse.json(
        { error: "id invalido" },
        { status: 400 },
      );
    }

    /* validate name */
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

    /* validate style */
    const charStyle = style || "feminino";
    if (!VALID_STYLES.includes(charStyle)) {
      return NextResponse.json({ error: "estilo invalido" }, { status: 400 });
    }

    /* validate hair style */
    const charHairStyle = hairStyle || "longo";
    if (!VALID_HAIRSTYLES.includes(charHairStyle)) {
      return NextResponse.json({ error: "estilo de cabelo invalido" }, { status: 400 });
    }

    /* validate accessory */
    const charAccessory = accessory || "nenhum";
    if (!VALID_ACCESSORIES.includes(charAccessory)) {
      return NextResponse.json({ error: "acessorio invalido" }, { status: 400 });
    }

    /* validate colors against preset whitelist */
    if (!SKIN_PRESETS.includes(skin)) {
      return NextResponse.json({ error: "cor de pele invalida" }, { status: 400 });
    }
    if (!HAIR_PRESETS.includes(hair)) {
      return NextResponse.json({ error: "cor de cabelo invalida" }, { status: 400 });
    }
    const charEye = eye || EYE_PRESETS[0];
    if (!EYE_PRESETS.includes(charEye)) {
      return NextResponse.json({ error: "cor de olho invalida" }, { status: 400 });
    }
    if (!SHIRT_PRESETS.includes(shirt)) {
      return NextResponse.json({ error: "cor de camisa invalida" }, { status: 400 });
    }
    if (!PANTS_PRESETS.includes(pants)) {
      return NextResponse.json({ error: "cor de calca invalida" }, { status: 400 });
    }

    /* check if updating existing character (preserve createdAt) */
    const existing = await redisPipeline([["HGET", "characters", clientId]]);
    let createdAt = Date.now();
    if (existing?.[0]?.result) {
      try {
        const prev = JSON.parse(existing[0].result as string) as CharacterData;
        createdAt = prev.createdAt || createdAt;
      } catch {
        /* use new timestamp */
      }
    }

    const charData = JSON.stringify({
      name: name.trim(),
      style: charStyle,
      hairStyle: charHairStyle,
      accessory: charAccessory,
      skin,
      hair,
      eye: charEye,
      shirt,
      pants,
      createdAt,
    });

    const result = await redisPipeline([
      ["HSET", "characters", clientId, charData],
      ["HLEN", "characters"],
    ]);

    if (!result) {
      return NextResponse.json(
        { error: "servico indisponivel" },
        { status: 503 },
      );
    }

    /* enforce cap — remove oldest if over limit */
    const count = result[1]?.result as number;
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

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "erro interno" },
      { status: 500 },
    );
  }
}

/* ── DELETE /api/characters ──────────────────────────────── */
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { clientId } = body;

    if (!clientId || typeof clientId !== "string") {
      return NextResponse.json(
        { error: "id invalido" },
        { status: 400 },
      );
    }

    const result = await redisPipeline([["HDEL", "characters", clientId]]);
    if (!result) {
      return NextResponse.json(
        { error: "servico indisponivel" },
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
