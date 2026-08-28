import { Link } from "@tanstack/react-router";
import { formatDeadline, prettyLabel, type MatchReason } from "@/lib/matching";
import type { Tables } from "@/integrations/supabase/types";

export type OpportunityCardProps = {
  opportunity: Tables<"opportunities"> & { match_score?: number };
  reasons?: MatchReason[];
  saved?: boolean;
  onToggleSave?: ((id: string) => void) | undefined;
};

export const typeBadgeClass: Record<string, string> = {
  hackathon: "bg-accent text-accent-foreground",
  internship: "bg-emerald-50 text-emerald-700",
  competition: "bg-sky-50 text-sky-700",
  course: "bg-violet-50 text-violet-700",
  workshop: "bg-amber-50 text-amber-700",
  mentorship: "bg-rose-50 text-rose-700",
  grant: "bg-teal-50 text-teal-700",
};

export function MatchScore({ score, size = "md" }: { score: number; size?: "sm" | "md" }) {
  const tone = score >= 75 ? "text-emerald-700" : score >= 50 ? "text-primary" : "text-muted-foreground";
  const bar = score >= 75 ? "bg-emerald-600" : score >= 50 ? "bg-primary" : "bg-slate-400";
  return (
    <div className={size === "md" ? "w-28" : "w-20"}>
      <div className="flex items-baseline gap-1">
        <span className={`font-semibold tabular-nums ${tone} ${size === "md" ? "text-2xl" : "text-lg"}`}>{score}%</span>
        <span className="text-xs text-muted-foreground">match</span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${bar} transition-all duration-500`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

export function ReasonList({ reasons }: { reasons: MatchReason[] }) {
  if (reasons.length === 0) return null;
  return (
    <ul className="space-y-1.5">
      {reasons.map((r) => (
        <li key={r.text} className="flex gap-2 text-sm leading-relaxed">
          <span className={r.kind === "good" ? "text-emerald-600" : "text-amber-600"}>{r.kind === "good" ? "✓" : "⚠"}</span>
          <span className="text-muted-foreground">{r.text}</span>
        </li>
      ))}
    </ul>
  );
}

export function OpportunityCard({ opportunity, reasons = [], saved = false, onToggleSave }: OpportunityCardProps) {
  const type = (opportunity.type ?? "").toLowerCase();
  const deadline = formatDeadline(opportunity.deadline_at);

  return (
    <article className="flex flex-col rounded-xl border border-border bg-card p-5 transition-shadow duration-200 hover:shadow-[0_2px_16px_rgba(15,23,42,0.07)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${typeBadgeClass[type] ?? "bg-muted text-muted-foreground"}`}>
            {prettyLabel(opportunity.type ?? "Opportunity")}
          </span>
          <h3 className="mt-3 text-lg font-semibold leading-snug text-foreground">
            <Link to="/opportunities/$id" params={{ id: opportunity.id }} className="hover:text-primary transition-colors">
              {opportunity.title}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {opportunity.host ?? "SkillScout"} · {opportunity.mode === "remote" ? "Remote" : opportunity.location ?? "TBD"}
          </p>
        </div>
        {typeof opportunity.match_score === "number" && <MatchScore score={opportunity.match_score} />}
      </div>

      <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{opportunity.description}</p>

      {reasons.length > 0 && (
        <div className="mt-4 rounded-lg border border-border bg-secondary/60 p-3.5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground">Why this matches you</p>
          <ReasonList reasons={reasons} />
        </div>
      )}

      <div className="mt-4 flex items-center gap-2 text-sm">
        <svg className="size-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5A2.25 2.25 0 0 1 5.25 5.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25A2.25 2.25 0 0 1 18.75 21H5.25A2.25 2.25 0 0 1 3 18.75Z" />
        </svg>
        <span className={deadline.urgent ? "text-amber-700" : "text-muted-foreground"}>
          {opportunity.deadline_at
            ? `Deadline ${new Date(opportunity.deadline_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · ${deadline.text}`
            : "Rolling deadline"}
        </span>
      </div>

      <div className="mt-5 flex items-center gap-2 border-t border-border pt-4">
        <Link
          to="/opportunities/$id"
          params={{ id: opportunity.id }}
          className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          View details
        </Link>
        {onToggleSave && (
          <button
            onClick={() => onToggleSave(opportunity.id)}
            aria-pressed={saved}
            className={`inline-flex h-10 items-center gap-1.5 rounded-lg border px-4 text-sm font-medium transition-colors ${
              saved
                ? "border-primary bg-accent text-accent-foreground"
                : "border-border text-foreground hover:bg-secondary"
            }`}
          >
            <svg className="size-4" fill={saved ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
            </svg>
            {saved ? "Saved" : "Save"}
          </button>
        )}
      </div>
    </article>
  );
}
