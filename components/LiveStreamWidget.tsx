"use client";

import { useEffect, useMemo, useState } from "react";

const CHANNEL = "fruttinhaa";

type LiveStatus = "online" | "offline";

function getStatusFromResponse(responseText: string): LiveStatus {
  return responseText.toLowerCase().includes("offline") ? "offline" : "online";
}

function getTwitchEmbedSrc(parentDomain: string) {
  const normalizedParent = parentDomain || "localhost";
  const params = new URLSearchParams({
    channel: CHANNEL,
    parent: normalizedParent,
    muted: "true",
  });

  return `https://player.twitch.tv/?${params.toString()}`;
}

export function LiveStreamWidget() {
  const [liveStatus, setLiveStatus] = useState<LiveStatus>("offline");
  const [embedSrc, setEmbedSrc] = useState(() => getTwitchEmbedSrc("localhost"));

  useEffect(() => {
    const hostname = window.location.hostname;
    setEmbedSrc(getTwitchEmbedSrc(hostname));
  }, []);

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

  const statusText = useMemo(() => (liveStatus === "online" ? "Online" : "Offline"), [liveStatus]);

  return (
    <section className="panel" aria-labelledby="live-widget-title">
      <div className="panel__head">
        <h2 id="live-widget-title">Live Stream</h2>
        <a className="chip chip--link" href={`https://www.twitch.tv/${CHANNEL}`} target="_blank" rel="noreferrer">
          twitch.tv/{CHANNEL}
        </a>
      </div>

      <div className="status-row" aria-live="polite">
        <span className={`status-dot status-dot--${liveStatus}`} aria-hidden="true" />
        <span>
          Stream status: <strong>{statusText}</strong>
        </span>
      </div>

      <div className="video-shell">
        <iframe title="Fruttinha livestream" src={embedSrc} allow="autoplay; fullscreen" loading="lazy" />
      </div>
    </section>
  );
}
