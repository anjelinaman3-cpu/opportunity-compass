import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";

import { getSavedOpportunities, unsaveOpportunity } from "@/lib/opportunities.functions";
import { OpportunityCard } from "@/components/OpportunityCard";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "Saved opportunities — Forge" },
      { name: "description", content: "Your saved hackathons, competitions, courses, and workshops." },
      { property: "og:title", content: "Saved opportunities — Forge" },
      { property: "og:description", content: "Your saved hackathons, competitions, courses, and workshops." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SavedPage,
});

function SavedPage() {
  const fetchSaved = useServerFn(getSavedOpportunities);
  const doUnsave = useServerFn(unsaveOpportunity);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [session, setSession] = useState<null | { user?: { email?: string } }>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => listener.subscription.unsubscribe();
  }, []);

  const { data: saved, isLoading, refetch } = useQuery({
    queryKey: ["saved-opportunities"],
    queryFn: () => fetchSaved(),
    enabled: !!session,
  });

  const handleToggleSave = async (id: string, save: boolean) => {
    if (save) return; // Only unsave on this page
    setSaving((prev) => ({ ...prev, [id]: true }));
    try {
      await doUnsave({ data: { opportunityId: id } });
      await refetch();
    } finally {
      setSaving((prev) => ({ ...prev, [id]: false }));
    }
  };

  if (!session) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-5">
        <div className="text-center">
          <h1 className="font-display font-bold text-2xl text-foreground">Sign in to save opportunities</h1>
          <p className="mt-2 text-muted-foreground">Create a profile and keep track of deadlines.</p>
          <Link to="/auth" search={{ mode: "signup" }} className="mt-6 inline-flex h-11 px-6 rounded-lg bg-primary text-primary-foreground font-display font-semibold items-center">
            Get started
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-7xl px-5 sm:px-8 pt-12 pb-16">
        <p className="font-mono text-xs text-muted-foreground mb-1">// SAVED</p>
        <h1 className="font-display font-bold text-3xl tracking-tight text-foreground">Your saved board</h1>

        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-5 mt-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-xl border border-line bg-card overflow-hidden animate-pulse aspect-[16/10]" />
            ))}
          </div>
        ) : saved && saved.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-5 mt-8">
            {saved.map((opp) => (
              <OpportunityCard
                key={opp.id}
                opportunity={{ ...opp, saved: true }}
                onToggleSave={handleToggleSave}
              />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-xl border border-line bg-card p-8 text-center">
            <p className="text-muted-foreground">No saved opportunities yet.</p>
            <Link to="/" className="mt-3 inline-block text-primary hover:underline text-sm">
              Browse the feed
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
