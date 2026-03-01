"use client";

import { useMemo, useState } from "react";

type DashboardEntry = {
  id: string;
  player: string;
  completedAt: string;
  markedCount: number;
};

const DASHBOARD_KEY = "fruttinha_bingo_dashboard";
const CARD_SIZE = 5;
const CENTER_INDEX = Math.floor((CARD_SIZE * CARD_SIZE) / 2);

const liveMoments = [
  "Streamer says 'chat' 3x in one minute",
  "Big clutch play lands on stream",
  "Technical issue appears briefly",
  "Host thanks a subscriber live",
  "Streamer laughs for 5+ seconds",
  "Chat spams emotes in sync",
  "A surprise guest joins voice",
  "Mic peaks during hype moment",
  "A strategy gets changed mid-round",
  "Streamer says 'one more game'",
  "A risky move totally works",
  "A risky move totally fails",
  "Someone asks for a rematch",
  "Streamer sings one random line",
  "Chat votes on the next challenge",
  "Unexpected wholesome moment",
  "A jump scare gets a reaction",
  "A meme reference appears",
  "Streamer changes scene layout",
  "Victory celebration on stream",
  "Streamer blames lag playfully",
  "Crazy comeback attempt begins",
  "New personal best is mentioned",
  "Streamer drinks water on camera",
  "Someone redeems a chaos reward",
  "Stream timer/checkpoint is announced",
  "Streamer calls chat 'legends'",
  "A new challenge wheel spin happens",
  "Streamer says 'this is cursed'",
  "Last-second save shocks everyone",
  "Unexpected tie game moment",
  "A pet cameo appears on stream",
];

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function randomViewerName() {
  return `Viewer-${Math.floor(1000 + Math.random() * 9000)}`;
}

function loadDashboard(): DashboardEntry[] {
  if (typeof window === "undefined") {
    return [];
  }

  const stored = window.localStorage.getItem(DASHBOARD_KEY);
  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored) as DashboardEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveDashboard(entries: DashboardEntry[]) {
  window.localStorage.setItem(DASHBOARD_KEY, JSON.stringify(entries));
}

function makeCard() {
  return shuffle(liveMoments).slice(0, CARD_SIZE * CARD_SIZE - 1);
}

export function BingoBoard() {
  const [player, setPlayer] = useState(() => randomViewerName());
  const [card, setCard] = useState(() => makeCard());
  const [marked, setMarked] = useState<Set<number>>(() => new Set([CENTER_INDEX]));
  const [dashboard, setDashboard] = useState<DashboardEntry[]>(() => loadDashboard());
  const [message, setMessage] = useState("Mark moments as they happen live and complete your bingo card.");
  const [hasLoggedCompletion, setHasLoggedCompletion] = useState(false);

  const totalSquares = CARD_SIZE * CARD_SIZE;
  const isComplete = marked.size === totalSquares;

  const boardItems = useMemo(
    () =>
      Array.from({ length: totalSquares }, (_, index) =>
        index === CENTER_INDEX ? "FREE SPACE" : card[index < CENTER_INDEX ? index : index - 1],
      ),
    [card, totalSquares],
  );

  const toggleSquare = (index: number) => {
    if (index === CENTER_INDEX || isComplete) {
      return;
    }

    const next = new Set(marked);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }

    setMarked(next);

    if (next.size === totalSquares && !hasLoggedCompletion) {
      const winner = player.trim() || randomViewerName();
      const entry: DashboardEntry = {
        id: crypto.randomUUID(),
        player: winner,
        completedAt: new Date().toISOString(),
        markedCount: next.size,
      };
      const nextBoard = [entry, ...dashboard].slice(0, 12);
      setDashboard(nextBoard);
      saveDashboard(nextBoard);
      setMessage(`✅ Bingo complete! Great live read, ${winner}. Logged to the public dashboard.`);
      setHasLoggedCompletion(true);
      return;
    }

    if (!isComplete) {
      setMessage(`Marked ${next.size}/${totalSquares}. Keep tracking live moments.`);
    }
  };

  const generateNewCard = () => {
    setCard(makeCard());
    setMarked(new Set([CENTER_INDEX]));
    setHasLoggedCompletion(false);
    setMessage("Fresh card generated with random live moments.");
  };

  return (
    <section className="panel" aria-labelledby="bingo-title">
      <div className="panel__head">
        <h2 id="bingo-title">Live Bingo</h2>
        <span className="chip chip--live">Randomized per player</span>
      </div>

      <p className="helper-text">
        Each card is generated with random livestream moments. Mark squares when you spot them.
      </p>

      <div className="controls">
        <input
          value={player}
          onChange={(event) => setPlayer(event.target.value)}
          type="text"
          maxLength={24}
          placeholder="Player name"
          aria-label="Player name"
        />
        <button className="btn btn--primary" onClick={generateNewCard}>
          Generate New Card
        </button>
      </div>

      <div className="bingo-grid" role="grid" aria-label="Live bingo board">
        {boardItems.map((item, index) => {
          const isMarked = marked.has(index);
          const isFree = index === CENTER_INDEX;

          return (
            <button
              key={`${item}-${index}`}
              className={`bingo-cell ${isMarked ? "is-marked" : ""} ${isFree ? "is-free" : ""}`}
              onClick={() => toggleSquare(index)}
              disabled={isFree || isComplete}
            >
              {item}
            </button>
          );
        })}
      </div>

      <div className="game-message" role="status" aria-live="polite">
        {isComplete ? "Bingo complete! Your result was posted to the dashboard." : message}
      </div>

      <section className="dashboard" aria-labelledby="dashboard-title">
        <div className="panel__head">
          <h3 id="dashboard-title">Public Bingo Dashboard</h3>
          <span className="chip">Latest completions</span>
        </div>
        {dashboard.length === 0 ? (
          <p className="helper-text">No public completions yet. Be the first to finish a card.</p>
        ) : (
          <ul className="dashboard-list">
            {dashboard.map((entry) => (
              <li key={entry.id}>
                <strong>{entry.player}</strong>
                <span>{new Date(entry.completedAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}
