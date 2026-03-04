/* ── Shared Upstash Redis REST helper ────────────────────── */

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

export type RedisResult = { result: unknown };

export async function redisPipeline(
  commands: string[][],
): Promise<RedisResult[] | null> {
  if (!REDIS_URL || !REDIS_TOKEN) return null;

  try {
    const res = await fetch(`${REDIS_URL}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REDIS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commands),
      cache: "no-store",
    });

    if (!res.ok) return null;
    return (await res.json()) as RedisResult[];
  } catch {
    return null;
  }
}

export function redisAvailable(): boolean {
  return !!(REDIS_URL && REDIS_TOKEN);
}
