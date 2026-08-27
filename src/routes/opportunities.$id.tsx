import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";

import { getOpportunity, saveOpportunity, unsaveOpportunity, getSavedOpportunityIds } from "@/lib/opportunities.functions";
import { formatDeadline, getCategoryColor } from "@/lib/matching";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/opportunities/$id")({
  head: () => ({
    meta: [
      { title: "Opportunity — SkillScout" },
      { name: "description", content: "Discover student opportunities on SkillScout." },
      { property: "og:title", content: "Opportunity — SkillScout" },
      { property: "og:description", content: "Discover student opportunities on SkillScout." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OpportunityDetail,
});

const colorMap: Record<string, string> = {
  neon: "bg-neon text-ink",
  cyan: "bg-cyan text-ink",
  violet: "bg-violet text-ink",
  amber: "bg-amber text-ink",
  primary: "bg-primary text-primary-foreground",
  success: "bg-emerald-500 text-white",
};

function getColorClass(type: string) {
  return colorMap[getCategoryColor(type)] ?? colorMap["primary"];
}

function OpportunityDetail() {
  const { id } = useParams({ from: "/opportunities/$id" });
  const fetchOpp = useServerFn(getOpportunity);
  const fetchSaved = useServerFn(getSavedOpportunityIds);
  const doSave = useServerFn(saveOpportunity);
  const doUnsave = useServerFn(unsaveOpportunity);

  const [session, setSession] = useState<null | { user?: { email?: string } }>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => listener.subscription.unsubscribe();
  }, []);

  const { data: opportunity, isLoading } = useQuery({
    queryKey: ["opportunity", id],
    queryFn: () => fetchOpp({ data: { id } }),
  });

  useEffect(() => {
    if (!session) return;
    fetchSaved()
      .then((ids) => setSaved(ids.includes(id)))
      .catch(() => {});
  }, [session, id, fetchSaved]);

  const handleToggleSave = async () => {
    if (!session) return;
    setSaving(true);
    try {
      if (saved) {
        await doUnsave({ data: { opportunityId: id } });
        setSaved(false);
      } else {
        await doSave({ data: { opportunityId: id } });
        setSaved(true);
      }
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !opportunity) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-5xl px-5 sm:px-8 pt-12 pb-16">
          <div className="h-6 w-32 bg-muted rounded animate-pulse" />
          <div className="mt-4 h-10 w-3/4 bg-muted rounded animate-pulse" />
          <div className="mt-6 aspect-video bg-muted rounded-xl animate-pulse" />
        </div>
      </main>
    );
  }

  const colorKey = getCategoryColor(opportunity.type);
  const deadline = formatDeadline(opportunity.deadline_at);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-5xl px-5 sm:px-8 pt-12 pb-16">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to feed
        </Link>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className={`rounded-full px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-wide ${getColorClass(opportunity.type)}`}>
            {opportunity.type}
          </span>
          {deadline.text !== "Open" && (
            <span className={`rounded-full border px-3 py-1 font-mono text-[11px] ${deadline.urgent ? "border-primary text-primary" : "border-line text-muted-foreground"}`}>
              {deadline.text}
            </span>
          )}
        </div>

        <h1 className="mt-5 font-display font-bold text-4xl sm:text-5xl tracking-tight text-foreground">
          {opportunity.title}
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground text-lg leading-relaxed">
          {opportunity.description}
        </p>

        <div className="mt-8 rounded-xl border border-line overflow-hidden bg-card">
          <img
            src={opportunity.image_url ?? "/images/opportunity-hackathon.jpg"}
            alt={opportunity.title}
            className="w-full aspect-[21/9] object-cover bg-muted"
            width={1280}
            height={548}
          />
        </div>

        <div className="mt-8 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="font-display font-semibold text-xl text-foreground mb-3">About</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {opportunity.description}
              </p>
            </div>

            {opportunity.skills && opportunity.skills.length > 0 && (
              <div>
                <h2 className="font-display font-semibold text-xl text-foreground mb-3">Skills you'll use</h2>
                <div className="flex flex-wrap gap-2">
                  {opportunity.skills.map((skill) => (
                    <span key={skill} className="px-3 py-1.5 rounded-md border border-line text-xs font-mono text-muted-foreground">
                      # {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {opportunity.eligibility && opportunity.eligibility.length > 0 && (
              <div>
                <h2 className="font-display font-semibold text-xl text-foreground mb-3">Eligibility</h2>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  {opportunity.eligibility.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <aside className="space-y-5">
            <div className="rounded-xl border border-line bg-card p-5">
              <h3 className="font-display font-semibold text-lg text-foreground">Key details</h3>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mode</span>
                  <span className="text-foreground capitalize">{opportunity.mode ?? "TBD"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location</span>
                  <span className="text-foreground">{opportunity.location ?? "Remote / TBD"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Starts</span>
                  <span className="text-foreground">
                    {opportunity.starts_at
                      ? new Date(opportunity.starts_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                      : "TBD"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Deadline</span>
                  <span className={deadline.urgent ? "text-primary" : "text-foreground"}>
                    {opportunity.deadline_at
                      ? new Date(opportunity.deadline_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                      : "Open"}
                  </span>
                </div>
                {opportunity.prize && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Prize</span>
                    <span className="text-foreground">{opportunity.prize}</span>
                  </div>
                )}
                {opportunity.certificate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Certificate</span>
                    <span className="text-foreground">Yes</span>
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-3">
                <a
                  href={opportunity.url ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="block h-11 w-full rounded-lg bg-primary text-primary-foreground font-display font-semibold text-center leading-[44px] hover:brightness-110 transition"
                >
                  Learn more
                </a>
                <button
                  onClick={handleToggleSave}
                  disabled={saving || !session}
                  className={`block h-11 w-full rounded-lg border text-sm font-display font-medium transition disabled:opacity-50 ${
                    saved
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-line text-foreground hover:border-muted-foreground"
                  }`}
                >
                  {saving ? "..." : saved ? "Saved" : session ? "Save for later" : "Sign in to save"}
                </button>
              </div>
            </div>

          </aside>
        </div>
      </section>
    </main>
  );
}
