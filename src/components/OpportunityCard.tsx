import { Link } from "@tanstack/react-router";
import { Bookmark, CalendarClock, MapPin, Building2, ArrowRight } from "lucide-react";

import { formatDeadline, prettyLabel, type MatchReason } from "@/lib/matching";
import { getTypeIcon, getTypeBadgeClass } from "@/components/opportunity-icons";
import type { OpportunityRecord } from "@/lib/opportunities.mock";

export type OpportunityCardProps = {
  opportunity: OpportunityRecord & { match_score?: number };
  reasons?: MatchReason[];
  summary?: string;
  saved?: boolean;
  onToggleSave?: ((id: string) => void) | undefined;
};

export function MatchScore({ score, size = "md" }: { score: number; size?: "sm" | "md" }) {
  const tone = score >= 75 ? "text-emerald-700" : score >= 50 ? "text-primary" : "text-slate-600";
  const bar = score >= 75 ? "bg-emerald-600" : score >= 50 ? "bg-primary" : "bg-slate-400";
  return (
    <div className={size === "md" ? "w-24 shrink-0 sm:w-28" : "w-20 shrink-0"}>
      <div className="flex items-baseline justify-end gap-1">
        <span className={`font-semibold tabular-nums ${tone} ${size === "md" ? "text-xl sm:text-2xl" : "text-lg"}`}>
          {score}%
        </span>
        <span className="text-xs text-muted-foreground">match</span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${bar} transition-[width] duration-500`} style={{ width: `${score}%` }} />
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
          <span className={r.kind === "good" ? "text-emerald-600" : "text-amber-600"} aria-hidden="true">
            {r.kind === "good" ? "✓" : "⚠"}
          </span>
          <span className="min-w-0 text-muted-foreground">{r.text}</span>
        </li>
      ))}
    </ul>
  );
}

export function OpportunityCard({ opportunity, reasons = [], saved = false, onToggleSave }: OpportunityCardProps) {
  const type = (opportunity.type ?? "").toLowerCase();
  const TypeIcon = getTypeIcon(type);
  const deadline = formatDeadline(opportunity.deadline_at);
  const skills = (opportunity.skills ?? []).slice(0, 4);

  return (
    <article className="flex h-full flex-col rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_6px_20px_rgba(15,23,42,0.07)]">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${getTypeBadgeClass(type)}`}
          >
            <TypeIcon className="size-3.5 shrink-0" aria-hidden="true" />
            {prettyLabel(opportunity.type ?? "Opportunity")}
          </span>
          <h3 className="mt-3 text-base font-semibold leading-snug text-foreground sm:text-lg">
            <Link to="/opportunities/$id" params={{ id: opportunity.id }} className="transition-colors hover:text-primary">
              {opportunity.title}
            </Link>
          </h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <Building2 className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{opportunity.host ?? "SkillScout"}</span>
            </span>
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{opportunity.mode === "remote" ? "Remote" : opportunity.location ?? "TBD"}</span>
            </span>
          </p>
        </div>
        {typeof opportunity.match_score === "number" && <MatchScore score={opportunity.match_score} />}
      </div>

      <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{opportunity.description}</p>

      {skills.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {skills.map((s) => (
            <li key={s} className="rounded-md bg-secondary px-2 py-1 text-xs text-muted-foreground">
              {prettyLabel(s)}
            </li>
          ))}
        </ul>
      )}

      {reasons.length > 0 && (
        <div className="mt-4 rounded-lg border border-border bg-secondary/60 p-3.5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground">Why this matches you</p>
          <ReasonList reasons={reasons} />
        </div>
      )}

      <div className="mt-4 flex items-center gap-2 text-sm">
        <CalendarClock className={`size-4 shrink-0 ${deadline.urgent ? "text-amber-600" : "text-muted-foreground"}`} aria-hidden="true" />
        <span className={deadline.urgent ? "text-amber-700" : "text-muted-foreground"}>
          {opportunity.deadline_at
            ? `${new Date(opportunity.deadline_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · ${deadline.text}`
            : "Rolling deadline"}
        </span>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-4">
        <Link
          to="/opportunities/$id"
          params={{ id: opportunity.id }}
          className="btn-shine inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:flex-none"
        >
          View opportunity
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
        {onToggleSave && (
          <button
            type="button"
            onClick={() => onToggleSave(opportunity.id)}
            aria-pressed={saved}
            aria-label={saved ? "Remove bookmark" : "Save opportunity"}
            className={`btn-shine inline-flex h-10 items-center gap-1.5 rounded-lg border px-4 text-sm font-medium transition-colors ${
              saved ? "border-primary bg-accent text-accent-foreground" : "border-border text-foreground hover:bg-secondary"
            }`}
          >
            <Bookmark className="size-4" fill={saved ? "currentColor" : "none"} aria-hidden="true" />
            {saved ? "Saved" : "Save"}
          </button>
        )}
      </div>
    </article>
  );
}

export function OpportunityCardSkeleton() {
  return (
    <div className="h-full animate-pulse rounded-xl border border-border bg-card p-5">
      <div className="h-6 w-24 rounded-full bg-muted" />
      <div className="mt-4 h-5 w-3/4 rounded bg-muted" />
      <div className="mt-2 h-4 w-1/2 rounded bg-muted" />
      <div className="mt-5 h-4 w-full rounded bg-muted" />
      <div className="mt-2 h-4 w-5/6 rounded bg-muted" />
      <div className="mt-6 h-10 w-full rounded-lg bg-muted" />
    </div>
  );
}
