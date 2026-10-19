/**
 * Signature smile-shaped curve that draws itself once on page load.
 * Honours prefers-reduced-motion via the CSS media query in index.css.
 */
export function SmileCurve({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 60"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path
        d="M20 15 C 120 55, 280 55, 380 15"
        strokeDasharray="600"
        strokeDashoffset="600"
        className="animate-smile-draw"
      />
    </svg>
  );
}
