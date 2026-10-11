import { randomInt } from "node:crypto";

// Backup codes get typed from paper, so they are lowercase and leave out the look-alikes
// 0/o and 1/l/i. Ten characters from these 31 carry about 49 bits each.
const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

/** Ten codes shaped like "k7m2p-x9q4r", drawn without bias from a CSPRNG. */
export function generateBackupCodes(): string[] {
  return Array.from({ length: 10 }, () => {
    const code = Array.from({ length: 10 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
    return `${code.slice(0, 5)}-${code.slice(5)}`;
  });
}
