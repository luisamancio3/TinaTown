import Link from "next/link";

type MiniGameCard = {
  title: string;
  description: string;
  href: string;
  badge: string;
};

const miniGames: MiniGameCard[] = [
  {
    title: "Chaos Wheel",
    description: "Spin once and let chat choose your next challenge.",
    href: "/minigames/chaos-wheel",
    badge: "Random challenge",
  },
  {
    title: "Last Cup Standing",
    description: "Push your luck, stack points, and avoid passing out.",
    href: "/minigames/last-cup-standing",
    badge: "Risk / Reward",
  },
  {
    title: "Live Bingo",
    description: "Mark moments from stream and race for bingo.",
    href: "/bingo",
    badge: "Community pick",
  },
];

export function MiniGamesSection() {
  return (
    <section className="panel" aria-labelledby="mini-games-section-title">
      <div className="panel__head">
        <h2 id="mini-games-section-title">Mini-Games</h2>
        <span className="chip">Pick a game</span>
      </div>

      <div className="mini-games-grid">
        {miniGames.map((game) => (
          <Link key={game.title} href={game.href} className="mini-game-card">
            <div className="mini-game-card__head">
              <h3>{game.title}</h3>
              <span className="chip">{game.badge}</span>
            </div>
            <p>{game.description}</p>
            <span className="mini-game-card__cta">Open game →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
