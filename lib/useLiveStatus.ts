"use client";

import { useEffect, useState } from "react";

export const CHANNEL = "fruttinhaa";

export type LiveStatus = "online" | "offline";

function getStatusFromResponse(responseText: string): LiveStatus {
  return responseText.toLowerCase().includes("offline") ? "offline" : "online";
}

/** Polls decapi every 60s for the channel's live status. */
export function useLiveStatus(): LiveStatus {
  const [liveStatus, setLiveStatus] = useState<LiveStatus>("offline");

  useEffect(() => {
    let isMounted = true;

    async function refreshStatus() {
      try {
        const response = await fetch(`https://decapi.me/twitch/uptime/${CHANNEL}`, { cache: "no-store" });
        const text = await response.text();

        if (isMounted) {
          setLiveStatus(getStatusFromResponse(text));
        }
      } catch {
        if (isMounted) {
          setLiveStatus("offline");
        }
      }
    }

    refreshStatus();
    const interval = setInterval(refreshStatus, 60_000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return liveStatus;
}
