type TagLabelProps = {
  label: string;
  className?: string;
};

/** Rectangular accent-filled label, used for short markers like a release tag. */
export function TagLabel({ label, className = "" }: TagLabelProps) {
  return <span className={`gb-tag ${className}`}>{label}</span>;
}