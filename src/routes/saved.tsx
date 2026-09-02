import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Bookmark } from "lucide-react";

import { OpportunityCard, OpportunityCardSkeleton } from "@/components/OpportunityCard";
import { useOpportunities } from "@/lib/opportunity-service";
import { useLocalProfile, useSavedIds } from "@/lib/local-profile";
import { buildMatch } from "@/lib/matching";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "Saved opportunities — SkillScout" },
      { name: "description", content: "Every hackathon, internship, course and workshop you bookmarked, with deadlines and match scores." },
      { property: "og:title", content: "Saved opportunities — SkillScout" },
      { property: "og:description", content: "Your shortlist of student opportunities, tracked with deadlines and match scores." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SavedPage,
});

function SavedPage() {
  const { data, isLoading } = useOpportunities();
  const { profile } = useLocalProfile();
  const { ids, toggle } = useSavedIds();

  const saved = useMemo(() => {
    const list = data?.opportunities ?? [];
    return list
      .filter((o) => ids.includes(o.id))
      .map((o) => {
        const match = buildMatch(o, profile);
        return { ...o, match_score: match.score, reasons: match.reasons };
      })
      .sort((a, b) => b.match_score - a.match_score);
  }, [data, ids, profile]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-12">
        <header className="flex min-w-0 items-center gap-3">
          <Bookmark className="size-6 shrink-0 text-primary" aria-hidden="true" />
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Saved opportunities</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {saved.length} bookmarked {saved.length === 1 ? "opportunity" : "opportunities"}
            </p>
          </div>
        </header>

        {isLoading ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <OpportunityCardSkeleton key={i} />
            ))}
          </div>
        ) : saved.length === 0 ? (
          <div className="mt-8 rounded-xl border border-border bg-card p-8 text-center">
            <p className="font-medium text-foreground">Nothing saved yet</p>
            <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">
              Tap the bookmark button on any opportunity to keep it here with its deadline and match score.
            </p>
            <Link
              to="/feed"
              className="btn-shine mt-5 inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Browse opportunities
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {saved.map((o) => (
              <OpportunityCard key={o.id} opportunity={o} reasons={o.reasons} saved onToggleSave={toggle} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
