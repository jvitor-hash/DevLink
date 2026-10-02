// Fixed-window per-user rate limiter for the project action endpoint.
// In-memory by design: the API is a single Bun process.
const WINDOW_MS = 60_000;

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

const consume = (userId: string, max = 30): boolean => {
  const now = Date.now();
  const bucket = buckets.get(userId);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(userId, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (bucket.count >= max) return false;

  bucket.count += 1;
  return true;
};

const reset = (): void => {
  buckets.clear();
};

export const ProjectActionRateLimiter = {
  consume,
  reset,
  get max() {
    return 30;
  },
};
