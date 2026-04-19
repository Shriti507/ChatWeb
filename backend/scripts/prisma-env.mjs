import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(root, ".env");
const envLocalPath = path.join(root, ".env.local");

dotenv.config({ path: envPath });
dotenv.config({ path: envLocalPath, override: true });

if (!process.env.DATABASE_URL?.trim()) {
  const stat = fs.existsSync(envPath) ? fs.statSync(envPath) : null;
  const absEnv = path.resolve(envPath);
  const size = stat ? `${stat.size} bytes` : "missing";
  const hint =
    stat && stat.size === 0
      ? `This file is empty on disk (${size}). If you see variables in the editor, save the file (Cmd+S).\nThen ensure DATABASE_URL=... and JWT_SECRET=... are set (see .env.example).`
      : `No DATABASE_URL after loading:\n  - ${absEnv} (${size})\n  - ${path.resolve(envLocalPath)} (optional overrides)\nCopy .env.example → .env and fill in real values.`;
  console.error(`\n[chatweb] Missing DATABASE_URL.\n${hint}\n`);
  process.exit(1);
}

// Prisma schema requires DIRECT_URL; default to DATABASE_URL for non-Supabase setups.
if (!process.env.DIRECT_URL?.trim()) {
  process.env.DIRECT_URL = process.env.DATABASE_URL;
}

/** True if .env still has the tutorial placeholders (not a fuzzy substring match on real `postgres://...` URLs). */
const looksLikeEnvTemplate = (value) => {
  if (typeof value !== "string" || !value.trim()) return false;
  if (/\bUSER:PASSWORD@HOST\b/i.test(value)) return true;
  try {
    const u = new URL(value);
    const host = u.hostname?.toLowerCase() ?? "";
    const user = u.username ?? "";
    // Shipped examples use username "USER" and hostname "HOST".
    if (host === "host") return true;
    if (user.toUpperCase() === "USER") return true;
    return false;
  } catch {
    return false;
  }
};

if (looksLikeEnvTemplate(process.env.DATABASE_URL) || looksLikeEnvTemplate(process.env.DIRECT_URL)) {
  console.error(
    `\n[chatweb] DATABASE_URL / DIRECT_URL still look like the template (username USER and/or hostname HOST).\n` +
      `Open Supabase → Project Settings → Database → copy the real connection URI into backend/.env, save, then retry.\n` +
      `\nYou do not need to create tables in the Supabase UI first — Prisma migrations create them after a successful connection.\n`
  );
  process.exit(1);
}
