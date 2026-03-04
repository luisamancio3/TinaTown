/* ── Color derivation & preset swatches for character builder ── */

/* ── hex ↔ HSL conversion helpers ─────────────────────────── */

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h * 360, s, l];
}

function hslToHex(h: number, s: number, l: number): string {
  h /= 360;
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let r: number, g: number, b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (v: number) =>
    Math.round(Math.min(255, Math.max(0, v * 255)))
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/** Adjust lightness by delta (-1 to +1). Clamps to [0, 1]. */
export function adjustLightness(hex: string, delta: number): string {
  const [r, g, b] = hexToRgb(hex);
  const [h, s, l] = rgbToHsl(r, g, b);
  return hslToHex(h, s, Math.min(1, Math.max(0, l + delta)));
}

/* ── character style (gender appearance) ─────────────────── */

export type CharacterStyle = "feminino" | "masculino";
export const VALID_STYLES: CharacterStyle[] = ["feminino", "masculino"];

/* ── hair style ──────────────────────────────────────────── */

export type HairStyle = "longo" | "curto" | "rabo" | "moicano" | "afro" | "careca";
export const VALID_HAIRSTYLES: HairStyle[] = ["longo", "curto", "rabo", "moicano", "afro", "careca"];

export const HAIRSTYLE_LABELS: Record<HairStyle, string> = {
  longo: "Longo",
  curto: "Curto",
  rabo: "Rabo",
  moicano: "Moicano",
  afro: "Afro",
  careca: "Careca",
};

/* ── accessories ─────────────────────────────────────────── */

export type Accessory = "nenhum" | "oculos" | "laco" | "bone" | "bandana";
export const VALID_ACCESSORIES: Accessory[] = ["nenhum", "oculos", "laco", "bone", "bandana"];

export const ACCESSORY_LABELS: Record<Accessory, string> = {
  nenhum: "Nenhum",
  oculos: "Oculos",
  laco: "Laco",
  bone: "Bone",
  bandana: "Bandana",
};

/* ── full color set used by PixelHuman ────────────────────── */

export interface HumanColors {
  skin: string;
  skinShadow: string;
  hair: string;
  hairDark: string;
  hairHighlight: string;
  shirt: string;
  shirtShadow: string;
  pants: string;
  lips: string;
  eyeIris: string;
  blush: string;
}

/** Derive all PixelHuman colors from base choices */
export function deriveCharacterColors(base: {
  skin: string;
  hair: string;
  shirt: string;
  pants: string;
  eye?: string;
}): HumanColors {
  return {
    skin: base.skin,
    skinShadow: adjustLightness(base.skin, -0.08),
    hair: base.hair,
    hairDark: adjustLightness(base.hair, -0.1),
    hairHighlight: adjustLightness(base.hair, 0.12),
    shirt: base.shirt,
    shirtShadow: adjustLightness(base.shirt, -0.1),
    pants: base.pants,
    lips: "#e8a0a0",
    eyeIris: base.eye || "#2d6b3f",
    blush: "rgba(255,160,160,0.35)",
  };
}

/* ── preset swatch arrays (also serve as server-side whitelist) ── */

export const SKIN_PRESETS = [
  "#fef5f0", "#f5deb3", "#deb887", "#c68642",
  "#a0522d", "#8b4513", "#5c3317", "#3b1f0b",
];

export const HAIR_PRESETS = [
  "#141418", "#3b2816", "#8b4513", "#d4a574", "#f0d58c",
  "#c0392b", "#ff69b4", "#8d5dff", "#2980b9", "#f0f0f5",
];

export const EYE_PRESETS = [
  "#2d6b3f", "#4a3728", "#2c5aa0", "#6b5b3f",
  "#1a1a1a", "#6a8e3f", "#8b6914", "#5f7f9f",
];

export const SHIRT_PRESETS = [
  "#f0f0f5", "#2d2d2d", "#c0392b", "#ff4f9d", "#8d5dff",
  "#2980b9", "#42d9cf", "#27ae60", "#f39c12", "#f0d58c",
];

export const PANTS_PRESETS = [
  "#2d2d2d", "#1a1a2e", "#2c3e50", "#34495e",
  "#2980b9", "#5d6d7e", "#8b4513", "#556b2f",
];
