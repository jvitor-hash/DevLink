type ProgressBarProps = {
  progress: number;
  maxValue?: number;
  segments?: number;
};

export default function ProgressBar({
  progress,
  maxValue = 100,
  segments = 4,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max(progress / maxValue, 0), 1);
  const filledSegments = Math.ceil(percentage * segments);

  return (
    <div className="flex w-full h-8 gap-1">
      {Array.from({ length: segments }, (_, i) => {
        const hue = (i / (segments - 1)) * 120;
        const filled = i < filledSegments;

        return (
          <div
            key={i}
            className="flex-1 rounded-full transition-all max-w-0.5"
            style={{
              backgroundColor: filled
                ? `hsl(${hue}, 50%, 50%)`
                : "var(--surface-2)",
            }}
          />
        );
      })}
    </div>
  );
}
