"use client";

import { useEffect, useMemo, useState } from "react";
import { CHANNEL, useLiveStatus } from "@/lib/useLiveStatus";

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
  const liveStatus = useLiveStatus();
  const [embedSrc, setEmbedSrc] = useState(() => getTwitchEmbedSrc("localhost"));

  useEffect(() => {
    const hostname = window.location.hostname;
    setEmbedSrc(getTwitchEmbedSrc(hostname));
  }, []);

  const statusText = useMemo(() => (liveStatus === "online" ? "Ao Vivo" : "Offline"), [liveStatus]);

  return (
    <section className="panel" id="live-panel" aria-labelledby="live-widget-title">
      <div className="panel__head">
        <h2 id="live-widget-title">Transmissao ao Vivo</h2>
        <a className="chip chip--link" href={`https://www.twitch.tv/${CHANNEL}`} target="_blank" rel="noreferrer">
          twitch.tv/{CHANNEL}
        </a>
      </div>

      <div className="status-row" aria-live="polite">
        <span className={`status-dot status-dot--${liveStatus}`} aria-hidden="true" />
        <span>
          Status da stream: <strong>{statusText}</strong>
        </span>
      </div>

      <div className="video-shell">
        <iframe title="Transmissao da Fruttinha" src={embedSrc} allow="autoplay; fullscreen" loading="lazy" />
      </div>
    </section>
  );
}
