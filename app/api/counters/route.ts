import { NextRequest, NextResponse } from "next/server";

/*
  Proxies StreamElements bot command data to extract counter values.

  Required env var:
    SE_CHANNEL_ID  — StreamElements channel ID
                     (find it at streamelements.com/dashboard → your channel URL
                      or ask a mod to check the SE overlay URL)

  Optional env var:
    SE_COUNTER_COMMANDS — comma-separated list of command names to track
                          e.g. "arroto,cabelo,peido"
                          If not set, returns all commands that have count > 0.
*/

const SE_API = "https://api.streamelements.com/kappa/v2";

/* cache for 60 seconds to avoid hammering SE API */
let cache: { data: Counter[]; ts: number } | null = null;
const CACHE_TTL = 60_000;

type Counter = {
  command: string;
  count: number;
};

type SECommand = {
  command: string;
  count?: number;
  enabled?: boolean;
};

async function fetchCounters(): Promise<Counter[]> {
  const channelId = process.env.SE_CHANNEL_ID;
  if (!channelId) return [];

  /* return from cache if fresh */
  if (cache && Date.now() - cache.ts < CACHE_TTL) return cache.data;

  try {
    const res = await fetch(`${SE_API}/bot/commands/${channelId}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
    });

    if (!res.ok) return cache?.data ?? [];

    const commands: SECommand[] = await res.json();

    /* filter to specific commands if configured, else all with count > 0 */
    const filter = process.env.SE_COUNTER_COMMANDS
      ?.split(",")
      .map((c) => c.trim().toLowerCase().replace(/^!/, ""));

    let counters: Counter[];

    if (filter && filter.length > 0) {
      counters = filter
        .map((name) => {
          const cmd = commands.find(
            (c) => c.command.replace(/^!/, "").toLowerCase() === name
          );
          return { command: name, count: cmd?.count ?? 0 };
        })
        .filter((c) => c.count > 0);
    } else {
      counters = commands
        .filter((c) => c.enabled !== false && (c.count ?? 0) > 0)
        .map((c) => ({
          command: c.command.replace(/^!/, ""),
          count: c.count ?? 0,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);
    }

    cache = { data: counters, ts: Date.now() };
    return counters;
  } catch {
    return cache?.data ?? [];
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_req: NextRequest) {
  const counters = await fetchCounters();

  return NextResponse.json(
    { counters },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    }
  );
}
