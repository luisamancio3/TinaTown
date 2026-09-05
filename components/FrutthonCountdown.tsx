"use client";

import { useEffect, useState } from "react";
import { daysUntilFrutthon, frutthonHeadline } from "@/lib/frutthon";

/* ── Date-driven headline for the Frutthon banner ────────────
   The server renders the neutral fallback; the real headline is
   computed on the client after mount (viewer's local date), which
   also avoids a hydration mismatch across timezones. */
export function FrutthonCountdown({ fallback }: { fallback: string }) {
  const [headline, setHeadline] = useState(fallback);

  useEffect(() => {
    const update = () => setHeadline(frutthonHeadline(daysUntilFrutthon()));
    update();
    /* re-check every minute so a tab left open flips at midnight */
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return <strong>{headline}</strong>;
}
