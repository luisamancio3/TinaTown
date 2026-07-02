import { NextRequest, NextResponse } from "next/server";
import { isAuthorized } from "@/lib/adminAuth";
import {
  backupToGitHub,
  collectBackup,
  githubBackupEnabled,
  restoreArchive,
  restoreFromGitHub,
} from "@/lib/backup";

/* ── GET /api/admin/backup — download full JSON snapshot ──── */
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "nao autorizado" }, { status: 401 });
  }

  const payload = await collectBackup();
  if (!payload) {
    return NextResponse.json({ error: "servico indisponivel" }, { status: 503 });
  }

  return NextResponse.json(
    { ...payload, githubBackup: githubBackupEnabled() },
    {
      headers: {
        "Cache-Control": "no-store",
        "Content-Disposition": `attachment; filename="tinatown-personagens-${payload.savedAt.slice(0, 10)}.json"`,
      },
    },
  );
}

/* ── POST /api/admin/backup — backup-now | restore-github | restore-archive ── */
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "nao autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const action = body?.action as string;

    if (action === "backup-now") {
      const result = await backupToGitHub();
      return NextResponse.json(result, { status: result.ok ? 200 : 502 });
    }

    if (action === "restore-github") {
      const result = await restoreFromGitHub();
      return NextResponse.json(result, { status: result.ok ? 200 : 502 });
    }

    if (action === "restore-archive") {
      const result = await restoreArchive();
      return NextResponse.json(result, { status: result.ok ? 200 : 502 });
    }

    return NextResponse.json({ error: "acao invalida" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "erro interno" }, { status: 500 });
  }
}
