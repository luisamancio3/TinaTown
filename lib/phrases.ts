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

/* extra pools while the live is ON */
const TINA_LIVE_PHRASES = [
  "to AO VIVO, gente!",
  "vem pra live!",
  "o chat ta demais hoje",
];

const CITIZEN_LIVE_PHRASES = [
  "a tina ta ON!",
  "alguem viu o chat?",
  "clipa isso!",
  "hoje tem tombo, eu sinto",
  "perdi o comeco?",
  "silencio, to assistindo",
  "melhor live do ano",
];

export function pickPhrase(
  kind: "tina" | "cat" | "citizen",
  opts?: { live?: boolean },
): string {
  let pool =
    kind === "tina" ? TINA_PHRASES : kind === "cat" ? CAT_PHRASES : CITIZEN_PHRASES;
  if (opts?.live && kind !== "cat" && Math.random() < 0.55) {
    pool = kind === "tina" ? TINA_LIVE_PHRASES : CITIZEN_LIVE_PHRASES;
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

/* ── live-start celebration + telao watching + building visits ── */

const CELEBRATION_SHOUTS = [
  "COMECOU!",
  "chegou!!",
  "sai da frente!",
  "AO VIVO!",
  "corre!!",
  "hoje tem!",
  "PRACA! AGORA!",
  "avisa geral!",
];

export function pickCelebrationShout(): string {
  return CELEBRATION_SHOUTS[Math.floor(Math.random() * CELEBRATION_SHOUTS.length)];
}

const WATCH_PHRASES = [
  "clipa isso!",
  "olha o telao!",
  "...",
  "KKKKK",
  "essa foi boa",
  "nao acredito que ela fez isso",
];

export function pickWatchPhrase(): string {
  return WATCH_PHRASES[Math.floor(Math.random() * WATCH_PHRASES.length)];
}

export type TownBuilding = "bar" | "fliperama" | "cine" | "salao";

const VISIT_PHRASES: Record<TownBuilding, string[]> = {
  bar: ["vou tomar uma", "uma rapidinha no bar", "to com sede"],
  fliperama: ["hora de bater recorde", "uma fichinha so", "bora jogar"],
  cine: ["sessao rapidinha", "dizem que o filme e otimo", "pipoca e clips"],
  salao: ["vou dar um trato no visual", "hora do cabelo novo", "so uma escovinha"],
};

export function pickVisitPhrase(building: TownBuilding): string {
  const pool = VISIT_PHRASES[building];
  return pool[Math.floor(Math.random() * pool.length)];
}

/* ── street encounters: two citizens meet and chat ─────────
   Templates alternate speakers (even index = first speaker).
   "{other}" is replaced by the listener's name. No accents or
   emoji: the pixel font (Press Start 2P) has a limited charset. */

export type WalkerKind = "tina" | "cat" | "citizen";

export type DialogueLine = { speaker: "a" | "b"; text: string };

const CAT_CAT: string[][] = [
  ["miau", "miau!"],
  ["prrrr", "*se espreguica*"],
  ["miau miau?", "miau."],
  ["*encara*", "*encara de volta*"],
  ["*cheira*", "*boceja*", "miau"],
];

/* human speaks first */
const HUMAN_CAT: string[][] = [
  ["que gatinho lindo!", "miau :3"],
  ["*faz carinho*", "prrrrrr"],
  ["ta perdido, gatinho?", "miau..."],
  ["viu o bruken por ai?", "*finge que nao*"],
];

/* citizen speaks first */
const TINA_CITIZEN: string[][] = [
  ["TINA! e voce mesma??", "ao vivo e a cores!"],
  ["um autografo, por favor!", "beijos, {other}!"],
  ["quando comeca a live?", "quando eu acordar"],
  ["sua cidade e linda!", "obrigada, cidadao {other}!"],
  ["posso pagar um drink?", "achei que nunca ia perguntar"],
];

const CITIZEN_CITIZEN: string[][] = [
  ["e ai, {other}!", "opa, {other}! tudo certo?", "bora no fliperama?"],
  ["viu a live ontem?", "vi! a tina caiu DE NOVO"],
  ["esse bairro ta crescendo, hein", "semana passada nem tinha minha casa"],
  ["me empresta um cigarro?", "so se me vencer na chuva de cigarro"],
  ["a fila do bar ta enorme", "a tina bebe rapido demais"],
  ["perdi pro lito de novo...", "treina no fliperama, uai"],
  ["oi {other}, bonita sua casa!", "obrigado, {other}! pintei ontem"],
  ["cade o bruken?", "escapou de novo..."],
  ["dizem que o cinema ta otimo", "os clips dessa semana? otimos"],
];

/* citizen-citizen while the live is ON */
const CITIZEN_CITIZEN_LIVE: string[][] = [
  ["viu o que ela fez??", "CLIPA! CLIPA!"],
  ["o chat ta um caos", "como sempre kkkk"],
  ["aposto 3 tombos hoje", "fechado"],
  ["{other}, ta vendo a live?", "obvio, so vim esticar as pernas"],
  ["ela ja bebeu quantas?", "perdi a conta na terceira"],
];

export type DialogueParticipant = {
  name: string;
  kind: WalkerKind;
  record?: { score: number; game: string };
};

function pickTemplate(pool: string[][]): string[] {
  return pool[Math.floor(Math.random() * pool.length)];
}

export function buildDialogue(
  a: DialogueParticipant,
  b: DialogueParticipant,
  opts?: { live?: boolean },
): DialogueLine[] {
  let template: string[];
  let first: "a" | "b" = "a";

  if (a.kind === "cat" && b.kind === "cat") {
    template = pickTemplate(CAT_CAT);
  } else if (a.kind === "cat" || b.kind === "cat") {
    first = a.kind === "cat" ? "b" : "a"; /* the human opens */
    template = pickTemplate(HUMAN_CAT);
  } else if (a.kind === "tina" || b.kind === "tina") {
    first = a.kind === "tina" ? "b" : "a"; /* the fan opens */
    template = pickTemplate(TINA_CITIZEN);
  } else if (opts?.live && Math.random() < 0.5) {
    template = pickTemplate(CITIZEN_CITIZEN_LIVE);
  } else if (a.record && b.record && Math.random() < 0.3) {
    template = [
      `meu recorde no ${a.record.game} e ${a.record.score}!`,
      `bonito... aqui e ${b.record.score} no ${b.record.game}`,
    ];
  } else {
    template = pickTemplate(CITIZEN_CITIZEN);
  }

  const second: "a" | "b" = first === "a" ? "b" : "a";

  return template.map((raw, i) => {
    const speaker = i % 2 === 0 ? first : second;
    const other = speaker === "a" ? b.name : a.name;
    return { speaker, text: raw.replace(/\{other\}/g, other) };
  });
}
