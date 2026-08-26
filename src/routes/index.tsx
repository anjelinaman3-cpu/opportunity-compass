import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";

import { listOpportunities, getRecommendedOpportunities, saveOpportunity, unsaveOpportunity } from "@/lib/opportunities.functions";
import { OpportunityCard } from "@/components/OpportunityCard";
import { CategoryStrip } from "@/components/CategoryStrip";
import { supabase } from "@/integrations/supabase/client";
import { formatDeadline } from "@/lib/matching";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Forge — Discover Student Opportunities" },
      { name: "description", content: "Personalized hackathons, competitions, courses, and workshops for students." },
      { property: "og:title", content: "Forge — Discover Student Opportunities" },
      { property: "og:description", content: "Personalized hackathons, competitions, courses, and workshops for students." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const categoryFilters = ["All", "Hackathon", "Competition", "Course", "Workshop", "Mentorship", "Grant"];

function Index() {
  const [session, setSession] = useState<null | { user?: { email?: string } }>(null);
  const [filter, setFilter] = useState("All");
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  const fetchAll = useServerFn(listOpportunities);
  const fetchRecommended = useServerFn(getRecommendedOpportunities);
  const doSave = useServerFn(saveOpportunity);
  const doUnsave = useServerFn(unsaveOpportunity);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => listener.subscription.unsubscribe();
  }, []);

  const isAuth = !!session;

  const { data: opportunities, isLoading, error, refetch } = useQuery({
    queryKey: ["opportunities", isAuth ? "recommended" : "public"],
    queryFn: () => (isAuth ? fetchRecommended() : fetchAll()),
  });

  const filtered = (opportunities ?? []).filter((opp) => {
    if (filter === "All") return true;
    return opp.type?.toLowerCase() === filter.toLowerCase();
  });

  const featured = opportunities?.[0];

  const handleToggleSave = async (id: string, save: boolean) => {
    if (!isAuth) return;
    setSaving((prev) => ({ ...prev, [id]: true }));
    try {
      if (save) await doSave({ data: { opportunityId: id } });
      else await doUnsave({ data: { opportunityId: id } });
      await refetch();
    } finally {
      setSaving((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 pt-12 pb-10">
        <div className="grid grid-cols-12 gap-6 items-end">
          <div className="col-span-12 lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-line bg-muted px-3 py-1.5 text-xs font-mono text-muted-foreground">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              PERSONALIZED MATCH ENGINE · LIVE OPPORTUNITIES
            </div>
            <h1 className="mt-6 font-display font-bold leading-[0.92] tracking-tight text-5xl sm:text-6xl lg:text-7xl text-foreground">
              Find the opportunity
              <br />
              that's <span className="text-primary">built for you.</span>
            </h1>
            <p className="mt-5 max-w-xl text-muted-foreground text-base sm:text-lg leading-relaxed">
              Forge reads your skills, your level, and your goals — then surfaces the hackathons,
              competitions, courses, and workshops that will actually move your career forward.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              {isAuth ? (
                <Link
                  to="/profile"
                  className="h-11 px-6 rounded-md bg-primary text-primary-foreground font-display font-semibold hover:brightness-110 transition flex items-center"
                >
                  Build profile
                </Link>
              ) : (
                <Link
                  to="/auth"
                  search={{ mode: "signup" }}
                  className="h-11 px-6 rounded-md bg-primary text-primary-foreground font-display font-semibold hover:brightness-110 transition flex items-center"
                >
                  Start matching
                </Link>
              )}
              <Link
                to="/saved"
                className="h-11 px-6 rounded-md border border-line font-display font-medium text-sm text-foreground hover:border-muted-foreground transition flex items-center"
              >
                Browse saved
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-2.5 font-mono text-xs">
              {["machine-learning", "web3", "product-design", "fintech", "robotics", "ai-ethics"].map((tag, i) => (
                <span
                  key={tag}
                  className={`px-3 py-1.5 rounded-full border ${
                    i % 3 === 1 ? "border-primary/40 text-primary" : i % 3 === 3 ? "border-cyan/40 text-cyan" : "border-line text-muted-foreground"
                  }`}
                >
                  # {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="col-span-12 lg:col-span-5">
            {featured ? (
              <div className="rounded-xl border border-line bg-card p-5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground">TOP MATCH</span>
                  <span className="rounded-full bg-primary/10 text-primary px-2.5 py-1 font-mono text-xs">
                    {(featured as { match_score?: number }).match_score ?? 92}% fit
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <img
                    src={featured.image_url ?? "/images/opportunity-hero-avatar.jpg"}
                    alt={featured.title}
                    className="size-14 shrink-0 rounded-lg object-cover bg-muted"
                    width={56}
                    height={56}
                  />
                  <div>
                    <p className="font-display font-semibold text-lg leading-tight text-foreground">{featured.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {featured.mode === "remote" ? "Remote" : featured.location ?? "TBD"}
                      {featured.starts_at ? ` · ${new Date(featured.starts_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : ""}
                    </p>
                  </div>
                </div>
                <div className="mt-4 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(featured as { match_score?: number }).match_score ?? 92}%` }}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs font-mono text-muted-foreground">
                  <span>Skills · {(featured.skills ?? []).slice(0, 3).join(", ")}</span>
                  <span className="text-primary">{featured.prize ?? (featured.certificate ? "Certificate" : "")}</span>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-line bg-card p-5 h-full flex items-center justify-center">
                <p className="text-muted-foreground text-sm">Sign in to see your top match.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {isLoading ? (
          <CategoryStrip opportunities={[]} />
        ) : (
          <CategoryStrip opportunities={(opportunities ?? []) as { type?: string | null }[]} />
        )}
      </div>

      {/* Feed */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 pt-10 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
          <div>
            <p className="font-mono text-xs text-muted-foreground mb-1">// FEED</p>
            <h2 className="font-display font-semibold text-2xl sm:text-3xl tracking-tight text-foreground">
              {isAuth ? "Freshly matched to you" : "Fresh opportunities"}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            {categoryFilters.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3 py-1.5 rounded-md transition ${
                  filter === cat
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "border border-line text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-xl border border-line bg-card overflow-hidden animate-pulse">
                <div className="aspect-[16/10] bg-muted" />
                <div className="p-4 space-y-2">
                  <div className="h-5 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-xl border border-line bg-card p-8 text-center">
            <p className="text-muted-foreground">Failed to load opportunities.</p>
            <button onClick={() => refetch()} className="mt-3 text-primary hover:underline text-sm">
              Try again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-line bg-card p-8 text-center">
            <p className="text-muted-foreground">No opportunities match this filter.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-5">
            {filtered.map((opp) => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                onToggleSave={isAuth ? handleToggleSave : undefined}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
