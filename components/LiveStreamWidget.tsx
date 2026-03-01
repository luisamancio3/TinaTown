export function LiveStreamWidget() {
  return (
    <section className="panel" aria-labelledby="live-widget-title">
      <div className="panel__head">
        <h2 id="live-widget-title">Live Stream</h2>
        <span className="chip chip--live">LIVE WIDGET</span>
      </div>

      <div className="video-shell">
        <iframe
          title="Fruttinha livestream"
          src="https://player.twitch.tv/?channel=fruttinha&parent=localhost&muted=true"
          allow="autoplay; fullscreen"
          loading="lazy"
        />
      </div>
      <p className="helper-text">
        If the embed does not load yet, replace the channel and `parent` domain in the iframe URL
        for your deployed domain.
      </p>
    </section>
  );
}
