/* ── Frutthon (subathon) content ────────────────────────────
   Static copy for the /frutthon page and the homepage banner.
   Edit the tiers here; the page renders whatever is listed. */

export const FRUTTHON_DATE = "08/09/2026";

/** accent color per tier, escalating from teal to gold */
export type TierTone = "teal" | "purple" | "pink" | "gold";

export type GoalTier = {
  amount: string;
  unit: string;
  tone: TierTone;
  rewards: string[];
};

export const SUB_TIERS: GoalTier[] = [
  {
    amount: "10",
    unit: "SUBS",
    tone: "teal",
    rewards: ["1 dia na academia", "1 dia sem fumar", "1 dia sem usar maquiagem"],
  },
  {
    amount: "25",
    unit: "SUBS",
    tone: "purple",
    rewards: ["Reagir a vídeo meu criança", "4 horas de Just Chatting", "4 ARAM e 3 Flex"],
  },
  {
    amount: "50",
    unit: "SUBS",
    tone: "pink",
    rewards: [
      "Live alcoólica",
      "24 horas sem League of Legends",
      "24h saudável: sem fumar, 3 refeições, academia e dormir cedo",
    ],
  },
  {
    amount: "100",
    unit: "SUBS",
    tone: "gold",
    rewards: ["Live 24 horas", "Live karaokê", "24 horas fazendo escolhas do chat"],
  },
];

export const PIX_TIERS: GoalTier[] = [
  { amount: "50", unit: "REAIS", tone: "teal", rewards: ["Shot de vodka"] },
  { amount: "100", unit: "REAIS", tone: "purple", rewards: ["IRL parque", "IRL restaurante"] },
  { amount: "250", unit: "REAIS", tone: "pink", rewards: ["IRL Liberdade", "IRL pinga"] },
  {
    amount: "550",
    unit: "REAIS",
    tone: "gold",
    rewards: [
      "IRL shopping",
      "IRL com a minha mãe",
      "IRL Airbnb com piscina ft Lito",
    ],
  },
];

export const PAST_ACHIEVEMENTS: { text: string; note?: string }[] = [
  { text: "Castração dos meus dois gatos" },
  { text: "Parcelas do PC finalizadas" },
  {
    text: "Setup: cama, monitor, teclado, webcam, microfone e cadeira",
    note: "(a maioria era emprestado ou a Safira comeu o fio)",
  },
];

export const CURRENT_GOALS: string[] = [
  "Vacinar meus gatos",
  "Terapia",
  "Sofá pra sala que eu faço as lives",
  "Dentista",
  "Mouse sem fio",
];
