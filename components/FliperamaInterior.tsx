"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Press_Start_2P } from "next/font/google";
import { GamePreview } from "@/components/GamePreview";
import { GAMES } from "@/lib/games";

const pixelFont = Press_Start_2P({ weight: "400", subsets: ["latin"], display: "swap" });

/** Inside of the Fliperama: one arcade cabinet per mini-game. */
export function FliperamaInterior() {
  const router = useRouter();

  return (
    <div className="interior interior--fliperama">
      <h3 className={`interior__title ${pixelFont.className}`}>FLIPERAMA</h3>
      <p className="interior__hint">Escolha uma maquina para jogar</p>

      <div className="cabinet-grid">
        {GAMES.map((game) => (
          <button
            key={game.slug}
            type="button"
            className="cabinet"
            onClick={() => router.push(`/mini-games/${game.slug}`)}
            aria-label={`Jogar ${game.title}`}
          >
            <span className={`cabinet__marquee ${pixelFont.className}`}>{game.title}</span>
            <span className="cabinet__screen">
              <GamePreview game={game.slug} />
            </span>
            <span className="cabinet__panel">
              <span className="cabinet__joystick" aria-hidden />
              <span className="cabinet__btn cabinet__btn--a" aria-hidden />
              <span className="cabinet__btn cabinet__btn--b" aria-hidden />
            </span>
            <span className={`cabinet__cta ${pixelFont.className}`}>JOGAR</span>
          </button>
        ))}
      </div>

      <Link href="/mini-games" className="chip chip--link interior__footer-link">
        Ver todos os jogos e placares →
      </Link>
    </div>
  );
}
