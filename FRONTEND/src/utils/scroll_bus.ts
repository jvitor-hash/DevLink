// Shared lerp scroll state; SmoothScroll's rAF loop reads/writes these each frame.
let current = 0;
let target = 0;

const maxScroll = (): number => document.documentElement.scrollHeight - window.innerHeight;

/** Queue an animated scroll to an absolute Y position (anchor clicks). */
export function scrollToY(value: number): void {
  current = window.scrollY;
  target = Math.max(0, Math.min(value, maxScroll()));
}

/** Nudge the lerp target by a wheel delta. */
export function adjustScrollTarget(deltaY: number): void {
  target = Math.max(0, Math.min(target + deltaY, maxScroll()));
}

/** Adopt an externally applied scroll position (scrollbar drag, etc.). */
export function adoptExternalPosition(value: number): void {
  current = value;
  target = value;
}

/** Advance the lerp one frame and return the position to apply. */
export function nextScrollPosition(factor: number): number {
  current += (target - current) * factor;

  return current;
}
