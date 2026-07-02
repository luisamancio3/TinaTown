/* ── Durable character backup ───────────────────────────────
   Redis (Upstash) survives deploys, but characters can still be
   lost: the 50-character cap evicts the oldest, admin actions
   delete permanently, or the Redis database itself can be
   recreated. Two protections here:

   1. "characters_archive" hash — every approved character is
      copied there and NEVER evicted or removed by app code.
   2. Optional GitHub backup — a JSON snapshot committed to the
      repo (data/characters-backup.json) after each approval,
      restorable from the admin page. Needs GITHUB_BACKUP_TOKEN
      (fine-grained PAT with contents read/write on the repo). */

import { redisPipeline } from "./redis";
import { publicCharacterId } from "./publicId";

const BACKUP_PATH = "data/characters-backup.json";

export type BackupPayload = {
  savedAt: string;
  characters: Record<string, string>;
  archive: Record<string, string>;
};

function backupConfig() {
  const token = process.env.GITHUB_BACKUP_TOKEN;
  if (!token) return null;
  return {
    token,
    repo: process.env.GITHUB_BACKUP_REPO || "luisamancio3/TinaTown",
    branch: process.env.GITHUB_BACKUP_BRANCH || "main",
  };
}

export function githubBackupEnabled(): boolean {
  return backupConfig() !== null;
}

/* keys are hashed: the snapshot is committed to a public repo, and raw
   clientIds are ownership secrets (they allow editing/deleting) */
function flatToRecord(flat: string[]): Record<string, string> {
  const record: Record<string, string> = {};
  for (let i = 0; i < flat.length; i += 2) {
    record[publicCharacterId(flat[i])] = flat[i + 1];
  }
  return record;
}

/** Snapshot of public + archived characters straight from Redis. */
export async function collectBackup(): Promise<BackupPayload | null> {
  const data = await redisPipeline([
    ["HGETALL", "characters"],
    ["HGETALL", "characters_archive"],
  ]);
  if (!data) return null;
  return {
    savedAt: new Date().toISOString(),
    characters: flatToRecord((data[0]?.result as string[]) || []),
    archive: flatToRecord((data[1]?.result as string[]) || []),
  };
}

/** Commit the snapshot to the repo. Never throws. */
export async function backupToGitHub(): Promise<{ ok: boolean; reason?: string }> {
  const cfg = backupConfig();
  if (!cfg) return { ok: false, reason: "GITHUB_BACKUP_TOKEN nao configurado" };

  const payload = await collectBackup();
  if (!payload) return { ok: false, reason: "redis indisponivel" };

  const api = `https://api.github.com/repos/${cfg.repo}/contents/${BACKUP_PATH}`;
  const headers = {
    Authorization: `Bearer ${cfg.token}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "tinatown-backup",
    "Content-Type": "application/json",
  };

  try {
    /* current sha is required to update an existing file */
    let sha: string | undefined;
    const current = await fetch(`${api}?ref=${cfg.branch}`, { headers, cache: "no-store" });
    if (current.ok) {
      const json = (await current.json()) as { sha?: string };
      sha = json.sha;
    }

    const content = Buffer.from(JSON.stringify(payload, null, 2)).toString("base64");
    const res = await fetch(api, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        message: `backup: personagens (${payload.savedAt})`,
        content,
        branch: cfg.branch,
        ...(sha ? { sha } : {}),
      }),
    });

    if (!res.ok) return { ok: false, reason: `github respondeu ${res.status}` };
    return { ok: true };
  } catch {
    return { ok: false, reason: "erro de rede ao salvar backup" };
  }
}

export async function fetchBackupFile(): Promise<BackupPayload | null> {
  const cfg = backupConfig();
  const repo = cfg?.repo || process.env.GITHUB_BACKUP_REPO || "luisamancio3/TinaTown";
  const branch = cfg?.branch || process.env.GITHUB_BACKUP_BRANCH || "main";

  try {
    if (cfg) {
      /* API works for private repos too */
      const res = await fetch(
        `https://api.github.com/repos/${repo}/contents/${BACKUP_PATH}?ref=${branch}`,
        {
          headers: {
            Authorization: `Bearer ${cfg.token}`,
            Accept: "application/vnd.github.raw+json",
            "User-Agent": "tinatown-backup",
          },
          cache: "no-store",
        },
      );
      if (!res.ok) return null;
      return (await res.json()) as BackupPayload;
    }

    const res = await fetch(
      `https://raw.githubusercontent.com/${repo}/${branch}/${BACKUP_PATH}`,
      { cache: "no-store" },
    );
    if (!res.ok) return null;
    return (await res.json()) as BackupPayload;
  } catch {
    return null;
  }
}

/** Restore the GitHub snapshot into Redis (public + archive). */
export async function restoreFromGitHub(): Promise<{
  ok: boolean;
  restored?: number;
  reason?: string;
}> {
  const payload = await fetchBackupFile();
  if (!payload) return { ok: false, reason: "backup nao encontrado no GitHub" };

  const commands: string[][] = [];
  for (const [id, data] of Object.entries(payload.characters)) {
    commands.push(["HSET", "characters", id, data]);
    commands.push(["HSET", "characters_archive", id, data]);
  }
  for (const [id, data] of Object.entries(payload.archive)) {
    commands.push(["HSET", "characters_archive", id, data]);
  }

  if (commands.length === 0) return { ok: true, restored: 0 };

  const result = await redisPipeline(commands);
  if (!result) return { ok: false, reason: "redis indisponivel" };
  return { ok: true, restored: Object.keys(payload.characters).length };
}

/** Republish every archived character back to the public list. */
export async function restoreArchive(): Promise<{
  ok: boolean;
  restored?: number;
  reason?: string;
}> {
  const data = await redisPipeline([["HGETALL", "characters_archive"]]);
  if (!data) return { ok: false, reason: "redis indisponivel" };

  const archive = flatToRecord((data[0]?.result as string[]) || []);
  const commands = Object.entries(archive).map(([id, charData]) => [
    "HSET",
    "characters",
    id,
    charData,
  ]);

  if (commands.length === 0) return { ok: true, restored: 0 };

  const result = await redisPipeline(commands);
  if (!result) return { ok: false, reason: "redis indisponivel" };
  return { ok: true, restored: commands.length };
}
