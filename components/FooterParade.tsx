"use client";

import { usePathname } from "next/navigation";
import { WalkingCharacters } from "./WalkingCharacters";

/**
 * Footer pixel parade on every page except the homepage,
 * where the town street replaces it.
 */
export function FooterParade() {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return <WalkingCharacters />;
}
