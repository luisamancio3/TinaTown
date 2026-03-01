"use client";

import { useEffect, useMemo, useState } from "react";

type BestScore = {
  score: number;
  player: string;
};

const BEST_KEY = "fruttinha_best_score";

function passOutChance(level: number) {
  return Math.min(5 + level * 9, 95);
}

function loadBestScore(): BestScore {
  if (typeof window === "undefined") {
    return { score: 0, player: "Nobody" };
  }

  const raw = window.localStorage.getItem(BEST_KEY);
  if (!raw) {
    return { score: 0, player: "Nobody" };
  }

  try {
    const parsed = JSON.parse(raw) as BestScore;
    return {
      score: Number.isFinite(parsed.score) ? parsed.score : 0,
      player: parsed.player || "Nobody",
    };
  } catch {
    return { score: 0, player: "Nobody" };
  }
}

function saveBestScore(bestScore: BestScore) {
  window.localStorage.setItem(BEST_KEY, JSON.stringify(bestScore));
}

export function DrinkingGame() {
  const [score, setScore] = useState(0);
  const [alcoholLevel, setAlcoholLevel] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [bestScore, setBestScore] = useState<BestScore>({ score: 0, player: "Nobody" });
  const [playerName, setPlayerName] = useState("");
  const [message, setMessage] = useState("Press Drink and push your luck.");

  useEffect(() => {
    setBestScore(loadBestScore());
  }, []);

  const chance = useMemo(() => passOutChance(alcoholLevel), [alcoholLevel]);

  const avatar = useMemo(() => {
    if (isGameOver) {
      return { emoji: "😵", className: "avatar passed-out", text: "Passed out. Run over." };
    }
    if (alcoholLevel >= 8) {
      return { emoji: "🥴", className: "avatar wasted", text: "Absolute chaos unlocked." };
    }
    if (alcoholLevel >= 4) {
      return { emoji: "😆", className: "avatar tipsy", text: "Tipsy, but still in it." };
    }
    return { emoji: "🍓", className: "avatar sober", text: "Fresh start. Confidence level: high." };
  }, [alcoholLevel, isGameOver]);

  const onDrink = () => {
    if (isGameOver) {
      setMessage("Game over. Hit Reset Run to try again.");
      return;
    }

    const nextAlcohol = alcoholLevel + 1;
    const gainedPoints = 10 + Math.floor(nextAlcohol * 1.5);
    const nextScore = score + gainedPoints;
    const nextChance = passOutChance(nextAlcohol);
    const roll = Math.random() * 100;

    setAlcoholLevel(nextAlcohol);
    setScore(nextScore);

    if (roll < nextChance) {
      setIsGameOver(true);
      setMessage(`💀 Passed out at ${nextScore} points.`);

      if (nextScore > bestScore.score) {
        const updatedBestScore = {
          score: nextScore,
          player: playerName.trim() || "Anonymous",
        };
        setBestScore(updatedBestScore);
        saveBestScore(updatedBestScore);
        setMessage(`🏆 New high score by ${updatedBestScore.player}: ${updatedBestScore.score}`);
      }
      return;
    }

    setMessage(`+${gainedPoints} points. Still standing.`);
  };

  const onReset = () => {
    setScore(0);
    setAlcoholLevel(0);
    setIsGameOver(false);
    setMessage("Run reset. Press Drink and test your luck.");
  };

  return (
    <section className="panel" aria-labelledby="minigame-title">
      <div className="panel__head">
        <h2 id="minigame-title">Mini Game: Fruttinha Last Cup Standing</h2>
        <span className="chip">Risk / Reward</span>
      </div>

      <div className="game-grid">
        <article className="avatar-card">
          <div className={avatar.className} aria-hidden="true">
            {avatar.emoji}
          </div>
          <p className="state-text">{avatar.text}</p>
          <div className="meter-wrap" aria-hidden="true">
            <div className="danger-meter" style={{ width: `${chance}%` }} />
          </div>
          <small>Danger meter</small>
        </article>

        <article className="stats-card">
          <div className="stat">
            <span>Score</span>
            <strong>{score}</strong>
          </div>
          <div className="stat">
            <span>Alcohol Level</span>
            <strong>{alcoholLevel}</strong>
          </div>
          <div className="stat">
            <span>Pass Out Chance</span>
            <strong>{chance}%</strong>
          </div>
          <div className="stat stat--record">
            <span>High Score</span>
            <strong>
              {bestScore.score} · {bestScore.player}
            </strong>
          </div>
        </article>
      </div>

      <div className="controls">
        <input
          value={playerName}
          onChange={(event) => setPlayerName(event.target.value)}
          type="text"
          maxLength={20}
          placeholder="Player name"
        />
        <button className="btn btn--danger" onClick={onDrink}>
          Drink
        </button>
        <button className="btn" onClick={onReset}>
          Reset Run
        </button>
      </div>

      <div className="game-message" role="status" aria-live="polite">
        {message}
      </div>
    </section>
  );
}
