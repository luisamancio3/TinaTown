"use client";

import Link from "next/link";
import { GamePreview } from "@/components/GamePreview";
import { GAMES } from "@/lib/games";


export function GameCarousel() {
  return (
    <section className="panel">
      <div className="panel__head">
        <h2>Jogos</h2>
      </div>

      <div className="game-grid">
        {GAMES.map((game) => (
          <Link
            key={game.slug}
            href={`/mini-games/${game.slug}`}
            className="game-grid__card"
          >
            <div className="game-grid__thumb">
              <GamePreview game={game.slug} />
            </div>
            <div className="game-grid__card-head">
              <h3>{game.title}</h3>
              <span className="chip">{game.badge}</span>
            </div>
            <p>{game.description}</p>
            <span className="game-grid__cta">Jogar →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
