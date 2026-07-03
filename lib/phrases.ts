/* ── Speech bubble phrases for the town citizens ──────────── */

export const TINA_PHRASES = [
  "AO VIVO e outra energia!",
  "cade meu drink?",
  "hoje ninguem me derruba",
  "BURP... foi mal",
  "bora de jequitinha!",
  "socorro, Lito!",
  "beijos, cidadao!",
  "essa cidade e minha!",
  "quem deixou o Bruken solto?",
];

export const CAT_PHRASES = [
  "miau",
  "miaaau",
  "prrrrr",
  "*ronrona*",
  "miau? miau.",
  "*persegue o Bruken*",
  "*derruba um copo*",
];

export const CITIZEN_PHRASES = [
  "oi, Tina!",
  "melhor cidade do mundo",
  "bora jogar no fliperama?",
  "eu vi o Bruken passar por aqui...",
  "hoje tem live?",
  "TinaTown > tudo",
  "me da um drink ai",
  "to esperando a live comecar",
  "ja tentou o Soco na Cara?",
  "essa praca e linda, ne?",
  "moro aqui do lado",
  "o cinema ta passando meu clip favorito",
];

export function pickPhrase(kind: "tina" | "cat" | "citizen"): string {
  const pool =
    kind === "tina" ? TINA_PHRASES : kind === "cat" ? CAT_PHRASES : CITIZEN_PHRASES;
  return pool[Math.floor(Math.random() * pool.length)];
}
