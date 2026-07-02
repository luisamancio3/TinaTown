export type GameCard = {
  slug: string;
  title: string;
  description: string;
  badge: string;
};

export const GAMES: GameCard[] = [
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
