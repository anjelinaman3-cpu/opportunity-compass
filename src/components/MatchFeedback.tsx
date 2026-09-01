import { useCallback, useEffect, useRef, useState } from "react";

export type FeedbackTone = "high" | "low";

/**
 * Brief, non-blocking feedback when a match result comes back:
 * a small emoji pop plus a soft full-screen tint. Pointer events stay off so
 * navigation and buttons remain usable, and it respects reduced motion.
 */
export function useMatchFeedback() {
  const [tone, setTone] = useState<FeedbackTone | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const trigger = useCallback((score: number) => {
    setTone(score >= 70 ? "high" : "low");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setTone(null), 2000);
  }, []);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const feedback = <MatchFeedbackOverlay tone={tone} />;

  return { trigger, feedback };
}

export function MatchFeedbackOverlay({ tone }: { tone: FeedbackTone | null }) {
  if (!tone) return null;
  const high = tone === "high";

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
    >
      <div
        className={`absolute inset-0 animate-soft-tint ${high ? "bg-emerald-400/12" : "bg-rose-400/12"}`}
      />
      <div className="relative flex animate-emoji-pop flex-col items-center gap-2">
        <span className="text-5xl sm:text-6xl" role="img" aria-hidden="true">
          {high ? "😊" : "😕"}
        </span>
        <span className="rounded-full border border-border bg-card px-3 py-1 text-sm font-medium text-foreground shadow-sm">
          {high ? "Great matches found" : "Only partial matches — try adding more skills"}
        </span>
      </div>
    </div>
  );
}
