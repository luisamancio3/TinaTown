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

/* ── GET /api/characters?clientId=xxx ─────────────────────── */
export async function GET(req: NextRequest) {
  const clientId = req.nextUrl.searchParams.get("clientId");

  /* fetch approved characters (and optionally pending for this user) */
  const commands: string[][] = [["HGETALL", "characters"]];
  if (clientId) {
    commands.push(["HGET", "pending_characters", clientId]);
  }

  const data = await redisPipeline(commands);

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
  const characters: (CharacterData & { id: string; pending?: boolean })[] = [];

  for (let i = 0; i < raw.length; i += 2) {
    try {
      const parsed = JSON.parse(raw[i + 1]) as CharacterData;
      characters.push({ id: raw[i], ...parsed });
    } catch {
      /* skip malformed entries */
    }
  }

  /* include this user's pending character so they can edit it */
  if (clientId && data[1]?.result) {
    try {
      const parsed = JSON.parse(data[1].result as string) as CharacterData;
      characters.push({ id: clientId, ...parsed, pending: true });
    } catch {
      /* skip */
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
    const existing = await redisPipeline([
      ["HGET", "characters", clientId],
      ["HGET", "pending_characters", clientId],
    ]);
    let createdAt = Date.now();
    const approvedData = existing?.[0]?.result as string | null;
    const pendingData = existing?.[1]?.result as string | null;
    const prevData = approvedData || pendingData;
    if (prevData) {
      try {
        const prev = JSON.parse(prevData) as CharacterData;
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

    /* If already approved, update in-place. Otherwise save to pending. */
    const targetHash = approvedData ? "characters" : "pending_characters";

    const result = await redisPipeline([
      ["HSET", targetHash, clientId, charData],
    ]);

    if (!result) {
      return NextResponse.json(
        { error: "servico indisponivel" },
        { status: 503 },
      );
    }

    return NextResponse.json({
      ok: true,
      pending: targetHash === "pending_characters",
    });
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

    const result = await redisPipeline([
      ["HDEL", "characters", clientId],
      ["HDEL", "pending_characters", clientId],
    ]);
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
