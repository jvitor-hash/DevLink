// Timing knobs adjustable via environment variables, in minutes.
const positiveMinutes = (key: string, fallback: number): number => {
  const parsed = Number.parseInt(Bun.env[key] ?? "", 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

// How long a project stays NEGOTIATING after a denied offer before
// automatically returning to OPEN (default: 60 minutes).
export const negotiationTimeoutMs = (): number =>
  positiveMinutes("NEGOTIATION_TIMEOUT_MINUTES", 60) * 60_000;

// How often clients receive view insights about their open projects
// (default: 60 minutes).
export const viewInsightsIntervalMs = (): number =>
  positiveMinutes("VIEW_INSIGHTS_INTERVAL_MINUTES", 60) * 60_000;
