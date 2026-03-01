"use client";

import { useMemo, useState } from "react";

const challenges = [
  "No-scope attempt next round",
  "Talk in rhyme for 2 minutes",
  "Use only pistol for one match",
  "Hydration break for chat",
  "No jumping challenge",
  "Compliment enemy team",
  "Sing one line dramatically",
  "Reverse controls for 60s",
];

export function ChaosWheel() {
  const [result, setResult] = useState("Tap spin and let chat decide your fate.");
  const [spinKey, setSpinKey] = useState(0);

  const challengePool = useMemo(() => challenges, []);

  const spin = () => {
    const index = Math.floor(Math.random() * challengePool.length);
    setResult(`🎯 ${challengePool[index]}`);
    setSpinKey((prev) => prev + 1);
  };

  return (
    <section className="panel" aria-labelledby="chaos-wheel-title">
      <div className="panel__head">
        <h2 id="chaos-wheel-title">Chaos Wheel</h2>
        <span className="chip">One click challenge</span>
      </div>

      <div className="wheel-stage">
        <div key={spinKey} className="wheel-spinner" aria-hidden="true">
          🎡
        </div>
        <div className="wheel-result" role="status" aria-live="polite">
          {result}
        </div>
      </div>

      <button className="btn btn--primary" onClick={spin}>
        Spin Chaos Wheel
      </button>
    </section>
  );
}
