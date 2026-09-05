import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import {
  FRUTTHON_DATE,
  SUB_TIERS,
  PIX_TIERS,
  PAST_ACHIEVEMENTS,
  CURRENT_GOALS,
  type GoalTier,
  type TierTone,
} from "@/lib/frutthon";
import { Bunting, PixelArrow, PixelCheck, PixelTarget, PixelTrophy } from "@/components/FrutthonPixels";

const pixelFont = Press_Start_2P({ weight: "400", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Frutthon da Tina",
  description: "Metas de subs e recompensas da Frutthon, a subathon da Fruttinha",
};

const TONE_COLOR: Record<TierTone, string> = {
  teal: "#42d9cf",
  purple: "#8d5dff",
  pink: "#ff4f9d",
  gold: "#ffd95e",
};

function Tier({ tier }: { tier: GoalTier }) {
  const color = TONE_COLOR[tier.tone];
  return (
    <div className={`frutthon-tier frutthon-tier--${tier.tone}`}>
      <div className={`frutthon-tier__num ${pixelFont.className}`}>
        <span className="frutthon-tier__amount" style={{ color }}>
          {tier.amount}
        </span>
        <span className="frutthon-tier__unit">{tier.unit}</span>
      </div>
      <ul className="frutthon-tier__list">
        {tier.rewards.map((reward) => (
          <li key={reward} className="frutthon-reward">
            <PixelArrow color={color} />
            {reward}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function FrutthonPage() {
  return (
    <main className="app-shell">
      <section className="hero frutthon-hero">
        <Bunting />
        <div className="frutthon-hero__row">
          <div>
            <span className="hero__badge">EVENTO ESPECIAL</span>
            <h1>Frutthon da Tina</h1>
            <p>Bata uma meta e a Tina cumpre. Quem manda os subs escolhe a recompensa.</p>
          </div>
          <div className={`frutthon-date ${pixelFont.className}`}>
            <span className="frutthon-date__label">QUANDO</span>
            <span className="frutthon-date__value">{FRUTTHON_DATE}</span>
          </div>
        </div>
      </section>

      <div className="frutthon-grid">
        <section className="panel frutthon-panel">
          <div className="panel__head">
            <h2 className={`frutthon-sign frutthon-sign--arcade ${pixelFont.className}`}>
              <span className="frutthon-sign__bulb" />
              META DE SUBS
              <span className="frutthon-sign__bulb" />
            </h2>
            <span className="chip">escolha 1 por meta</span>
          </div>
          {SUB_TIERS.map((tier) => (
            <Tier key={tier.amount} tier={tier} />
          ))}
        </section>

        <section className="panel frutthon-panel">
          <div className="panel__head">
            <h2 className={`frutthon-sign frutthon-sign--bar ${pixelFont.className}`}>META DE PIX</h2>
            <span className="chip">escolha 1 por meta</span>
          </div>
          {PIX_TIERS.map((tier) => (
            <Tier key={tier.amount} tier={tier} />
          ))}
        </section>
      </div>

      <section className="panel frutthon-panel">
        <div className="panel__head">
          <h2 className={`frutthon-sign frutthon-sign--cine ${pixelFont.className}`}>FRUTTHON PASSADA</h2>
          <span className="chip">prestação de contas</span>
        </div>

        <div className="frutthon-grid frutthon-grid--tight">
          <div className="frutthon-recap frutthon-recap--gold">
            <div className="frutthon-recap__icon">
              <PixelTrophy />
            </div>
            <div className="frutthon-recap__body">
              <span className={`frutthon-recap__title ${pixelFont.className}`} style={{ color: "#ffd95e" }}>
                CONQUISTAS ANTERIORES
              </span>
              <span className="frutthon-recap__sub">
                Metas cumpridas com o valor arrecadado da Frutthon passada:
              </span>
              <ul className="frutthon-tier__list frutthon-tier__list--flush">
                {PAST_ACHIEVEMENTS.map((item) => (
                  <li key={item.text} className="frutthon-reward frutthon-reward--top">
                    <PixelCheck />
                    <span>
                      {item.text}
                      {item.note && <span className="frutthon-reward__note"> {item.note}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="frutthon-recap frutthon-recap--pink">
            <div className="frutthon-recap__icon">
              <PixelTarget />
            </div>
            <div className="frutthon-recap__body">
              <span className={`frutthon-recap__title ${pixelFont.className}`} style={{ color: "#ff4f9d" }}>
                METAS ATUAIS
              </span>
              <span className="frutthon-recap__sub">Finalidade da nova Frutthon:</span>
              <ul className="frutthon-tier__list frutthon-tier__list--flush">
                {CURRENT_GOALS.map((goal) => (
                  <li key={goal} className="frutthon-reward">
                    <PixelArrow color="#ff4f9d" />
                    {goal}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
