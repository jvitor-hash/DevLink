export function SegmentedProgress({ value, max = 100, segments = 4 }) {
  const filled = Math.ceil(Math.min(Math.max(value / max, 0), 1) * segments);
  return (
    <div className="flex h-2 w-full gap-1" role="progressbar" aria-valuenow={value} aria-valuemax={max}>
      {Array.from({ length: segments }, (_, index) => (
        <span key={index} className="flex-1 rounded-full"
          style={{ backgroundColor: index < filled ? `hsl(${(index / Math.max(segments - 1, 1)) * 120}, 50%, 50%)` : "var(--surface-2)" }}
        />
      ))}
    </div>
  );
}
