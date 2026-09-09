"use client";

import { useEffect } from "react";

export default function SmoothScroll() {
  useEffect(() => {
    let current = window.scrollY;
    let target = window.scrollY;
    let frameId: number;

    // 1. Capture user wheel input to update target scroll position
    const onWheel = (e: WheelEvent) => {
      e.preventDefault(); // Stop native immediate scroll
      target += e.deltaY;

      // Clamp target within page bounds
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      target = Math.max(0, Math.min(target, maxScroll));
    };

    // 2. Animation loop using lerp (linear interpolation)
    const update = () => {
      // Smoothly approach target
      current += (target - current) * 0.08;

      // Perform smooth scroll call
      window.scrollTo(0, current);

      // Save the latest frame ID so cleanup works properly
      frameId = requestAnimationFrame(update);
    };

    // Prevent touch/scroll interference and listen to wheel events
    window.addEventListener("wheel", onWheel, { passive: false });
    frameId = requestAnimationFrame(update);

    // 3. Clean up event listener and the ACTIVE frame ID
    return () => {
      window.removeEventListener("wheel", onWheel);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return null;
}
