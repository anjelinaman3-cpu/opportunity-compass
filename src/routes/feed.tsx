import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, Sparkles, Compass, RotateCcw } from "lucide-react";

import { OpportunityCard, OpportunityCardSkeleton } from "@/components/OpportunityCard";
import { useOpportunities } from "@/lib/opportunity-service";
import { useLocalProfile, useSavedIds } from "@/lib/local-profile";
import { buildMatch, prettyLabel, daysUntil } from "@/lib/matching";

export const Route = createFileRoute("/feed")({
  head: () => ({
    meta: [
      { title: "Your matched opportunities — SkillScout" },
      {
        name: "description",
        content:
          "A personalized feed of hackathons, internships, courses and workshops scored against your skills, interests and experience level.",
      },
      { property: "og:title", content: "Your matched opportunities — SkillScout" },
      {
        property: "og:description",
        content: "See which student opportunities fit you, why they fit, and when they close.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FeedPage,
});

const TYPES = ["all", "hackathon", "internship", "course", "workshop", "competition", "mentorship", "grant"];
const SORTS = [
  { value: "match", label: "Best match" },
  { value: "deadline", label: "Closing soonest" },
  { value: "title", label: "A–Z" },
] as const;

function FeedPage() {
  const { data, isLoading, isError, refetch } = useOpportunities();
  const { profile, ready } = useLocalProfile();
  const { ids: savedIds, toggle } = useSavedIds();

  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [mode, setMode] = useState("all");
  const [minMatch, setMinMatch] = useState(0);
  const [closingSoon, setClosingSoon] = useState(false);
  const [sort, setSort] = useState<(typeof SORTS)[number]["value"]>("match");
  const [showFilters, setShowFilters] = useState(false);

  const scored = useMemo(() => {
    const list = data?.opportunities ?? [];
    return list.map((o) => {
      const match = buildMatch(o, profile);
      return { ...o, match_score: match.score, reasons: match.reasons, summary: match.summary };
    });
  }, [data, profile]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = scored.filter((o) => {
      if (type !== "all" && (o.type ?? "").toLowerCase() !== type) return false;
      if (mode !== "all" && (o.mode ?? "").toLowerCase() !== mode) return false;
      if (o.match_score < minMatch) return false;
      if (closingSoon) {
        const d = daysUntil(o.deadline_at);
        if (d === null || d > 21) return false;
      }
      if (q) {
        const haystack = [o.title, o.host, ...(o.skills ?? []), ...(o.domains ?? [])].join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    return filtered.sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      if (sort === "deadline") {
        const ad = daysUntil(a.deadline_at) ?? 9999;
        const bd = daysUntil(b.deadline_at) ?? 9999;
        return ad - bd;
      }
      return b.match_score - a.match_score;
    });
  }, [scored, query, type, mode, minMatch, closingSoon, sort]);

  const top = useMemo(() => [...scored].sort((a, b) => b.match_score - a.match_score).slice(0, 3), [scored]);
  const resetFilters = () => {
    setQuery("");
    setType("all");
    setMode("all");
    setMinMatch(0);
    setClosingSoon(false);
    setSort("match");
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-12">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {profile?.display_name ? `Matches for ${profile.display_name}` : "Your opportunity feed"}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">
              {ready && !profile
                ? "Add your skills and interests to unlock personalized match scores."
                : `${results.length} opportunit${results.length === 1 ? "y" : "ies"} scored against your profile.`}
            </p>
          </div>
          <Link
            to="/onboarding"
            className="btn-shine inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            {profile ? "Edit profile" : "Set up profile"}
          </Link>
        </header>

        {ready && !profile && (
          <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-accent/60 p-4">
            <Sparkles className="size-5 shrink-0 text-primary" aria-hidden="true" />
            <p className="min-w-0 flex-1 text-sm text-foreground">
              Tell us about yourself once and every card below gets a match score and a plain-language reason.
            </p>
            <Link
              to="/onboarding"
              className="btn-shine inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Start
            </Link>
          </div>
        )}

        {/* Search + filters */}
        <section className="mt-6 rounded-xl border border-border bg-card p-4 sm:p-5">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 sm:flex sm:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title, host or skill"
                aria-label="Search opportunities"
                className="h-11 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none transition-colors focus:border-primary"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              aria-expanded={showFilters}
              className="btn-shine inline-flex h-11 shrink-0 items-center gap-1.5 rounded-lg border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary sm:hidden"
            >
              <SlidersHorizontal className="size-4" aria-hidden="true" />
              Filters
            </button>
          </div>

          <div className={`${showFilters ? "grid" : "hidden"} mt-4 gap-4 sm:grid`}>
            <div className="flex flex-wrap gap-2">
              {TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  aria-pressed={type === t}
                  className={`h-9 rounded-full border px-3.5 text-sm transition-colors ${
                    type === t
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {t === "all" ? "All types" : prettyLabel(t)}
                </button>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="text-sm">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Mode</span>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
                >
                  <option value="all">Any</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">On-site</option>
                </select>
              </label>

              <label className="text-sm">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Minimum match: {minMatch}%
                </span>
                <input
                  type="range"
                  min={0}
                  max={90}
                  step={10}
                  value={minMatch}
                  onChange={(e) => setMinMatch(Number(e.target.value))}
                  className="mt-3 w-full accent-[var(--primary)]"
                />
              </label>

              <label className="text-sm">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Sort by</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as (typeof SORTS)[number]["value"])}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
                >
                  {SORTS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={closingSoon}
                  onChange={(e) => setClosingSoon(e.target.checked)}
                  className="size-4 rounded border-border accent-[var(--primary)]"
                />
                Closing within 3 weeks
              </label>
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <RotateCcw className="size-3.5" aria-hidden="true" />
                Reset
              </button>
            </div>
          </div>
        </section>

        {/* Recommended */}
        {profile && top.length > 0 && !isLoading && (
          <section className="mt-10">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-foreground sm:text-xl">Recommended for you</h2>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {top.map((o) => (
                <div key={o.id} className="animate-rise-in">
                  <OpportunityCard
                    opportunity={o}
                    reasons={o.reasons}
                    saved={savedIds.includes(o.id)}
                    onToggleSave={toggle}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* All results */}
        <section className="mt-10">
          <div className="flex items-center gap-2">
            <Compass className="size-5 text-muted-foreground" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-foreground sm:text-xl">All opportunities</h2>
          </div>

          {isLoading && (
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <OpportunityCardSkeleton key={i} />
              ))}
            </div>
          )}

          {isError && (
            <div className="mt-4 rounded-xl border border-border bg-card p-6 text-center">
              <p className="text-sm text-muted-foreground">We couldn't load opportunities just now.</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="btn-shine mt-4 inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Try again
              </button>
            </div>
          )}

          {!isLoading && !isError && results.length === 0 && (
            <div className="mt-4 rounded-xl border border-border bg-card p-8 text-center">
              <p className="font-medium text-foreground">No opportunities match these filters</p>
              <p className="mt-1.5 text-sm text-muted-foreground">Try lowering the minimum match or clearing the search.</p>
              <button
                type="button"
                onClick={resetFilters}
                className="btn-shine mt-5 inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm font-medium text-foreground hover:bg-secondary"
              >
                Reset filters
              </button>
            </div>
          )}

          {!isLoading && !isError && results.length > 0 && (
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {results.map((o) => (
                <OpportunityCard
                  key={o.id}
                  opportunity={o}
                  saved={savedIds.includes(o.id)}
                  onToggleSave={toggle}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
