import Link from "next/link";
import dynamic from "next/dynamic";
import { Scoreboard } from "@/components/Scoreboard";

const TinaBebeGame = dynamic(
  () => import("@/components/TinaBebeGame").then((m) => m.TinaBebeGame),
  { ssr: false }
);

const JequitinhaGame = dynamic(
  () => import("@/components/JequitinhaGame").then((m) => m.JequitinhaGame),
  { ssr: false }
);

const SocoNaCaraGame = dynamic(
  () => import("@/components/SocoNaCaraGame").then((m) => m.SocoNaCaraGame),
  { ssr: false }
);

const PegueOBrukenGame = dynamic(
  () => import("@/components/PegueOBrukenGame").then((m) => m.PegueOBrukenGame),
  { ssr: false }
);

const TinaKissGame = dynamic(
  () => import("@/components/TinaKissGame").then((m) => m.TinaKissGame),
  { ssr: false }
);

const ChuvaDecigarroGame = dynamic(
  () => import("@/components/ChuvaDecigarroGame").then((m) => m.ChuvaDecigarroGame),
  { ssr: false }
);

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function GamePage({ params }: Props) {
  const { slug } = await params;

  const title = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const isTinaBebe = slug === "tina-bebe";
  const isJequitinha = slug === "jequitinha";
  const isSocoNaCara = slug === "soco-na-cara";
  const isPegueOBruken = slug === "pegue-o-bruken";
  const isTinaKiss = slug === "tina-kiss";
  const isChuvaDecigarro = slug === "chuva-de-cigarro";
  const hasGame = isTinaBebe || isJequitinha || isSocoNaCara || isPegueOBruken || isTinaKiss || isChuvaDecigarro;

  return (
    <main className="app-shell">
      <section className="panel">
        <div className="panel__head">
          <h2>{title}</h2>
          <Link href="/mini-games" className="chip chip--link">
            &larr; Voltar aos jogos
          </Link>
        </div>
        {isTinaBebe ? (
          <TinaBebeGame />
        ) : isJequitinha ? (
          <JequitinhaGame />
        ) : isSocoNaCara ? (
          <SocoNaCaraGame />
        ) : isPegueOBruken ? (
          <PegueOBrukenGame />
        ) : isTinaKiss ? (
          <TinaKissGame />
        ) : isChuvaDecigarro ? (
          <ChuvaDecigarroGame />
        ) : (
          <p className="helper-text">
            Este jogo esta chegando em breve. Fique ligado!
          </p>
        )}
      </section>

      {hasGame && (
        <section className="panel">
          <div className="panel__head">
            <h2>Placar</h2>
          </div>
          <Scoreboard game={slug} />
        </section>
      )}
    </main>
  );
}
