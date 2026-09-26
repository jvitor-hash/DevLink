import { useEffect } from "react";

import { adoptExternalPosition, nextScrollPosition, adjustScrollTarget } from "@/utils/scroll_bus";

export default function SmoothScroll() {
  useEffect(() => {
    // Position the loop itself last wrote; a mismatch vs window.scrollY means
    // something else scrolled the page and the bus must adopt that position.
    let lastWritten = window.scrollY;
    let frameId: number;

    // 1. Capture user wheel input to update target scroll position
    const onWheel = (e: WheelEvent) => {
      e.preventDefault(); // Stop native immediate scroll
      adjustScrollTarget(e.deltaY);
    };

    // 2. Animation loop using lerp (linear interpolation)
    const update = () => {
      const actual = window.scrollY;

      // External scroll (scrollbar drag, keyboard, script) wins over our target.
      if (Math.abs(actual - lastWritten) > 1) {
        adoptExternalPosition(actual);
        lastWritten = actual;
      } else {
        window.scrollTo(0, nextScrollPosition(0.08));
        lastWritten = window.scrollY;
      }

      frameId = requestAnimationFrame(update);
    };

    // Seed the bus with the restored position so the first frame doesn't jump to top.
    adoptExternalPosition(window.scrollY);

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
