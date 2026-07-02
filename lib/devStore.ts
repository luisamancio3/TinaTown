/* ── File-backed mini Redis for local development ──────────
   Used automatically when UPSTASH_REDIS_REST_URL/TOKEN are not
   set and NODE_ENV !== "production", so characters, scores and
   the admin flow all work locally. Data lives in .data/dev-redis.json
   (gitignored) and survives dev-server restarts. */

import fs from "fs";
import path from "path";

export type RedisResult = { result: unknown };

type StoreData = {
  hashes: Record<string, Record<string, string>>;
  zsets: Record<string, { member: string; score: number }[]>;
  lists: Record<string, string[]>;
};

const FILE = path.join(process.cwd(), ".data", "dev-redis.json");

function emptyStore(): StoreData {
  return { hashes: {}, zsets: {}, lists: {} };
}

function loadStore(): StoreData {
  try {
    const raw = fs.readFileSync(FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<StoreData>;
    return {
      hashes: parsed.hashes || {},
      zsets: parsed.zsets || {},
      lists: parsed.lists || {},
    };
  } catch {
    return emptyStore();
  }
}

/* cache across HMR reloads of the dev server */
const g = globalThis as typeof globalThis & { __tinatownDevStore?: StoreData };

function getStore(): StoreData {
  if (!g.__tinatownDevStore) g.__tinatownDevStore = loadStore();
  return g.__tinatownDevStore;
}

function persist(store: StoreData) {
  try {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify(store, null, 2), "utf8");
  } catch {
    /* dev-only convenience — losing a write is acceptable */
  }
}

function sliceRange<T>(arr: T[], startS: string, stopS: string): T[] {
  const start = Number(startS);
  const stop = Number(stopS);
  return arr.slice(start, stop === -1 ? undefined : stop + 1);
}

export function devPipeline(commands: string[][]): RedisResult[] {
  const store = getStore();
  let dirty = false;

  const results = commands.map((cmd): RedisResult => {
    const [op = "", key = "", ...args] = cmd;

    switch (op.toUpperCase()) {
      case "HGETALL": {
        const hash = store.hashes[key] || {};
        const flat: string[] = [];
        for (const [field, value] of Object.entries(hash)) flat.push(field, value);
        return { result: flat };
      }
      case "HGET":
        return { result: store.hashes[key]?.[args[0]] ?? null };
      case "HSET": {
        if (!store.hashes[key]) store.hashes[key] = {};
        const isNew = !(args[0] in store.hashes[key]);
        store.hashes[key][args[0]] = args[1];
        dirty = true;
        return { result: isNew ? 1 : 0 };
      }
      case "HDEL": {
        const hash = store.hashes[key];
        let removed = 0;
        if (hash && args[0] in hash) {
          delete hash[args[0]];
          removed = 1;
          dirty = true;
        }
        return { result: removed };
      }
      case "HLEN":
        return { result: Object.keys(store.hashes[key] || {}).length };
      case "ZADD": {
        const [score, member] = args;
        if (!store.zsets[key]) store.zsets[key] = [];
        const zset = store.zsets[key];
        const existing = zset.find((e) => e.member === member);
        if (existing) existing.score = Number(score);
        else zset.push({ member, score: Number(score) });
        dirty = true;
        return { result: existing ? 0 : 1 };
      }
      case "ZREVRANGE": {
        const sorted = [...(store.zsets[key] || [])].sort((a, b) => b.score - a.score);
        const slice = sliceRange(sorted, args[0], args[1]);
        if ((args[2] || "").toUpperCase() === "WITHSCORES") {
          const flat: string[] = [];
          for (const e of slice) flat.push(e.member, String(e.score));
          return { result: flat };
        }
        return { result: slice.map((e) => e.member) };
      }
      case "LPUSH": {
        if (!store.lists[key]) store.lists[key] = [];
        for (const value of args) store.lists[key].unshift(value);
        dirty = true;
        return { result: store.lists[key].length };
      }
      case "LTRIM": {
        store.lists[key] = sliceRange(store.lists[key] || [], args[0], args[1]);
        dirty = true;
        return { result: "OK" };
      }
      case "LRANGE":
        return { result: sliceRange(store.lists[key] || [], args[0], args[1]) };
      default:
        return { result: null };
    }
  });

  if (dirty) persist(store);
  return results;
}
