/**
 * src/lib/admin/seed-passwords.ts
 *
 * CLI helper to generate a bcrypt hash for the admin password.
 *
 * Usage:
 *   npx ts-node --project tsconfig.json src/lib/admin/seed-passwords.ts yourpassword
 *
 * Or with plain Node.js (after build):
 *   node -e "const b=require('bcryptjs'); b.hash(process.argv[1], 12).then(h => console.log(h))" yourpassword
 *
 * Copy the output hash into your Netlify environment variables as ADMIN_PASSWORD_HASH.
 * NEVER commit the hash to git — it belongs in environment variables only.
 */

import bcrypt from 'bcryptjs';

async function main() {
  const password = process.argv[2];

  if (!password) {
    console.error('Usage: npx ts-node src/lib/admin/seed-passwords.ts <password>');
    console.error('');
    console.error('Example:');
    console.error('  npx ts-node src/lib/admin/seed-passwords.ts mysecretpassword');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('Error: password must be at least 8 characters long.');
    process.exit(1);
  }

  console.log('Generating bcrypt hash (cost factor 12) — this takes ~1 second...');
  const hash = await bcrypt.hash(password, 12);

  console.log('');
  console.log('ADMIN_PASSWORD_HASH=' + hash);
  console.log('');
  console.log('Copy the line above into:');
  console.log('  - .env.local (for local development)');
  console.log('  - Netlify → Site → Configuration → Environment variables (for production)');
  console.log('');
  console.log('NEVER commit this hash to git.');
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
