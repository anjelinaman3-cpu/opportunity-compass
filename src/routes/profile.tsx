import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { UserRound, Save, Trash2, Sparkles } from "lucide-react";

import {
  clearLocalProfile,
  emptyProfile,
  setLocalProfile,
  useLocalProfile,
  useSavedIds,
  type LocalProfile,
} from "@/lib/local-profile";
import { prettyLabel } from "@/lib/matching";
import { useOpportunities } from "@/lib/opportunity-service";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your profile — SkillScout" },
      { name: "description", content: "Update the skills, interests and experience level that power your SkillScout opportunity matches." },
      { property: "og:title", content: "Your profile — SkillScout" },
      { property: "og:description", content: "Keep your skills and interests current so your opportunity matches stay accurate." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

const SKILLS = [
  "html", "css", "javascript", "react", "python", "java", "machine-learning", "data-science",
  "ui-design", "figma", "product-management", "public-speaking", "writing", "robotics",
  "cybersecurity", "mobile", "cloud", "blockchain",
];
const INTERESTS = [
  "web-development", "artificial-intelligence", "climate-tech", "fintech", "healthcare",
  "education", "social-impact", "design", "research", "robotics", "web3", "career",
];
const ELIGIBILITY = ["high-school", "undergraduate", "graduate", "recent-grad", "no-experience", "team-based", "individual"];
const LEVELS = ["beginner", "intermediate", "advanced"];

function ProfilePage() {
  const { profile, ready } = useLocalProfile();
  const { ids } = useSavedIds();
  const { data } = useOpportunities();
  const [form, setForm] = useState<LocalProfile>(emptyProfile);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    if (profile) setForm(profile);
  }, [profile]);

  const toggleIn = (key: "skills" | "interests" | "eligibility", value: string) =>
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter((v) => v !== value) : [...f[key], value],
    }));

  const save = () => {
    setLocalProfile(form);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  };

  const chip = (label: string, active: boolean, onClick: () => void) => (
    <button
      key={label}
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`btn-shine rounded-full border px-3.5 py-2 text-sm transition-colors ${
        active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"
      }`}
    >
      {prettyLabel(label)}
    </button>
  );

  if (ready && !profile) {
    return (
      <main className="min-h-screen bg-background px-4 py-16 text-foreground">
        <div className="mx-auto max-w-lg rounded-xl border border-border bg-card p-8 text-center">
          <Sparkles className="mx-auto size-6 text-primary" aria-hidden="true" />
          <h1 className="mt-3 text-xl font-semibold text-foreground">No profile yet</h1>
          <p className="mt-2 text-sm text-muted-foreground">Answer a few questions and we'll start matching opportunities to you.</p>
          <Link
            to="/onboarding"
            className="btn-shine mt-6 inline-flex h-11 items-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Tell us about yourself
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8 sm:py-12">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
              <UserRound className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {form.display_name || "Your profile"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {form.skills.length} skills · {form.interests.length} interests · {ids.length} saved
              </p>
            </div>
          </div>
          <Link
            to="/feed"
            className="btn-shine inline-flex h-10 shrink-0 items-center rounded-lg border border-border px-4 text-sm font-medium text-foreground hover:bg-secondary"
          >
            View feed
          </Link>
        </header>

        <div className="mt-8 space-y-6">
          <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-foreground">Display name</span>
              <input
                value={form.display_name}
                onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
                className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
              />
            </label>
          </section>

          <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-foreground">Skills</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {SKILLS.map((s) => chip(s, form.skills.includes(s), () => toggleIn("skills", s)))}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-foreground">Interests</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {INTERESTS.map((i) => chip(i, form.interests.includes(i), () => toggleIn("interests", i)))}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-foreground">Eligibility</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {ELIGIBILITY.map((e) => chip(e, form.eligibility.includes(e), () => toggleIn("eligibility", e)))}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-foreground">Experience level</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {LEVELS.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, experience_level: l }))}
                  aria-pressed={form.experience_level === l}
                  className={`btn-shine rounded-lg border p-3 text-sm font-medium transition-colors ${
                    form.experience_level === l ? "border-primary bg-accent text-accent-foreground" : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {prettyLabel(l)}
                </button>
              ))}
            </div>
          </section>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={save}
              className="btn-shine inline-flex h-11 items-center gap-1.5 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Save className="size-4" aria-hidden="true" />
              Save changes
            </button>
            <button
              type="button"
              onClick={() => {
                clearLocalProfile();
                setForm(emptyProfile);
              }}
              className="btn-shine inline-flex h-11 items-center gap-1.5 rounded-lg border border-border px-5 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Reset profile
            </button>
            {savedFlash && <span className="text-sm text-emerald-700">Saved — your matches are updated.</span>}
          </div>

          <p className="text-xs text-muted-foreground">
            Matching against {data?.opportunities.length ?? 0} opportunities from the{" "}
            {data?.source === "backend" ? "live" : "sample"} catalogue.
          </p>
        </div>
      </div>
    </main>
  );
}
