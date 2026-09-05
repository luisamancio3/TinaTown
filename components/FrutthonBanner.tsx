import Link from "next/link";
import { Press_Start_2P } from "next/font/google";
import { Bunting, PixelArrow } from "@/components/FrutthonPixels";

const pixelFont = Press_Start_2P({ weight: "400", subsets: ["latin"], display: "swap" });

/* ── Homepage banner pointing to /frutthon ───────────────── */
export function FrutthonBanner() {
  return (
    <Link href="/frutthon" className="frutthon-banner" aria-label="Frutthon: ver metas e recompensas">
      <Bunting />
      <div className="frutthon-banner__row">
        <span className={`frutthon-sign frutthon-sign--arcade frutthon-banner__sign ${pixelFont.className}`}>
          <span className="frutthon-sign__bulb" />
          FRUTTHON
          <span className="frutthon-sign__bulb" />
        </span>
        <span className="frutthon-banner__text">
          <strong>A Frutthon está chegando</strong>
          <span>Metas de subs, recompensas e o que a Tina vai fazer com a grana.</span>
        </span>
      </div>
      <span className="frutthon-banner__cta">
        Ver metas
        <PixelArrow color="#1a1420" />
      </span>
    </Link>
  );
}
