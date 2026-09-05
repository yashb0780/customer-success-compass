/**
 * Mint an unguessable account id for a real customer.
 *
 *   npm run new-account-id
 *
 * 25 base36 characters, ~129 bits of entropy from a cryptographic RNG. Use it
 * as /qbr/<id> and /api/account?id=<id>. Treat the resulting URL as a secret:
 * it is a capability, not a login. See CLAUDE.md.
 */
import { randomBytes } from "node:crypto";

const LENGTH = 25;
const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";

// Rejection sampling: 256 % 36 != 0, so naive modulo would bias early letters.
function mint(length) {
  let out = "";
  while (out.length < length) {
    for (const byte of randomBytes(length * 2)) {
      if (byte < 252) out += ALPHABET[byte % 36];
      if (out.length === length) break;
    }
  }
  return out;
}

const id = mint(LENGTH);
console.log(`\n  Account id:  ${id}`);
console.log(`  Page:        /qbr/${id}`);
console.log(`  API:         /api/account?id=${id}`);
console.log(`\n  Anyone with this link can read that account. Share it like a password.\n`);
