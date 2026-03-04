"use client";

import Link from "next/link";
import { GamePreview } from "@/components/GamePreview";

type GameCard = {
  slug: string;
  title: string;
  description: string;
  badge: string;
};

const GAMES: GameCard[] = [
  {
    slug: "tina-bebe",
    title: "Tina Bebe",
    description: "Sirva drinks pra Tina. Quantos antes dela apagar?",
    badge: "Jogo de beber",
  },
  {
    slug: "soco-na-cara",
    title: "Soco na Cara",
    description: "De socos no Lito, mas cuidado — ele revida!",
    badge: "Jogo de luta",
  },
  {
    slug: "jequitinha",
    title: "Jequitinha",
    description: "Gire a Tina ate ela ficar tonta e cair no chao!",
    badge: "Jogo de girar",
  },
  {
    slug: "pegue-o-bruken",
    title: "Pegue o Bruken",
    description: "Pegue o Bruken antes que ele escape!",
    badge: "Jogo de reflexo",
  },
  {
    slug: "tina-kiss",
    title: "Tina Kiss",
    description: "Dirija Tina para beijar o Lucas antes do tempo acabar!",
    badge: "Jogo de perseguicao",
  },
  {
    slug: "chuva-de-cigarro",
    title: "Chuva de Cigarro",
    description: "Pegue os cigarros que caem do ceu, mas cuidado com os vegetais!",
    badge: "Jogo de reflexo",
  },
];

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
