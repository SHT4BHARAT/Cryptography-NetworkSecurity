// A hand-drawn vitals trace: the one signature graphic in the app. Calm and
// flat when healthy, jagged and spiking when a score says otherwise.
const TONE_STROKE = {
  credit: "var(--credit)",
  brass: "var(--brass)",
  debit: "var(--debit)",
} as const;

function buildPath(jitter: number) {
  const h = 10 + Math.max(0, Math.min(1, jitter)) * 34;
  const y = 30;
  return `M0,${y} L26,${y} L38,${y - h} L50,${y + h * 0.6} L64,${y} L130,${y} L146,${
    y - h * 0.55
  } L162,${y + h} L178,${y} L400,${y}`;
}

export function PulseLine({
  tone = "brass",
  jitter = 0.25,
  className = "",
}: {
  tone?: keyof typeof TONE_STROKE;
  jitter?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 400 60"
      preserveAspectRatio="none"
      className={`h-full w-full overflow-visible ${className}`}
      aria-hidden="true"
    >
      <path
        d={buildPath(jitter)}
        fill="none"
        stroke={TONE_STROKE[tone]}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        className="pulse-draw"
      />
    </svg>
  );
}
