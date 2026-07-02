import { createHash } from "crypto";

/* clientId is the ownership secret: whoever knows it can edit or
   delete that character. The public API and the GitHub backup must
   therefore never expose raw clientIds — only this derived id. */

const PUBLIC_ID_RE = /^[0-9a-f]{16}$/;

/** Derived public id. Idempotent: already-public ids pass through. */
export function publicCharacterId(id: string): string {
  if (PUBLIC_ID_RE.test(id)) return id;
  return createHash("sha256").update(id).digest("hex").slice(0, 16);
}
