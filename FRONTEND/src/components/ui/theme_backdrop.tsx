/**
 * Screen backdrop for the glass-brutal theme: blurred neutral shapes, one dusty
 * red blob near the top-right and a faint grain overlay. Inert when the theme
 * is off, so the original solid background is untouched.
 */
export function ThemeBackdrop() {
  return (
    <>
      <div aria-hidden="true" className="gb-backdrop">
        <span className="gb-blob gb-blob-stone" />
        <span className="gb-blob gb-blob-cool" />
        <span className="gb-blob gb-blob-accent" />
      </div>

      <div aria-hidden="true" className="gb-grain" />
    </>
  );
}