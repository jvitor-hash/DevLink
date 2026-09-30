/**
 * Re-trigger stalled notification outbox events (DEAD and FAILED).
 *
 * Usage (from the repo root):
 *   bun run scripts/maintenance_scripts/retrigger-dead-events.ts [--dry-run]
 *
 * Requeues every DEAD/FAILED outbox row back to PENDING so the running API
 * drains and delivers them on its next outbox sweep (every 30 seconds).
 * Use --dry-run to only report the current counts.
 */
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";

const dryRun = process.argv.includes("--dry-run");

// pg lives in the API workspace; resolve it from there.
const apiRequire = createRequire(new URL("../../API/package.json", import.meta.url));
const { Pool } = apiRequire("pg") as typeof import("pg");

const envText = await readFile(new URL("../../API/.env", import.meta.url), "utf8").catch(() => "");
const connectionString =
  process.env.DATABASE_URL ?? envText.match(/^DATABASE_URL=["']?([^"'\r\n]+)/m)?.[1];

if (!connectionString) {
  console.error("DATABASE_URL not found; set it in API/.env or the environment.");
  process.exit(1);
}

const pool = new Pool({ connectionString });

const countStalled = async (): Promise<Record<string, number>> => {
  const { rows } = await pool.query<{ status: string; total: string }>(
    `SELECT status, count(*)::text AS total FROM outbox WHERE status IN ('DEAD', 'FAILED') GROUP BY status`,
  );

  return Object.fromEntries(rows.map((row) => [row.status, Number(row.total)]));
};

const main = async (): Promise<void> => {
  const before = await countStalled();
  console.log("Stalled outbox events:", before);

  if (dryRun) {
    console.log("Dry run: nothing was requeued.");

    return;
  }

  const { rowCount } = await pool.query(
    `UPDATE outbox SET status = 'PENDING', retry_count = 0, error_message = NULL WHERE status IN ('DEAD', 'FAILED')`,
  );

  console.log(`Requeued ${rowCount ?? 0} stalled event(s); the API outbox sweep will deliver them.`);
};

main()
  .then(() => pool.end())
  .then(() => process.exit(0))
  .catch(async (error) => {
    console.error("Failed to re-trigger stalled events:", error);
    await pool.end().catch(() => undefined);
    process.exit(1);
  });
