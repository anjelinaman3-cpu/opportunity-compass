import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";

import { getLocalProfile, setLocalProfile, emptyProfile, type LocalProfile } from "@/lib/local-profile";
import { useMatchFeedback } from "@/components/MatchFeedback";
import { fetchOpportunities } from "@/lib/opportunity-service";
import { calculateMatchScore, prettyLabel } from "@/lib/matching";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Tell us about yourself — SkillScout" },
      {
        name: "description",
        content: "Share your skills, interests and experience level so SkillScout can match you with the right student opportunities.",
      },
      { property: "og:title", content: "Tell us about yourself — SkillScout" },
      {
        property: "og:description",
        content: "A one-minute profile that powers personalized opportunity matches with clear explanations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OnboardingPage,
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

const LEVELS = [
  { value: "beginner", label: "Beginner", body: "Just starting out or learning the basics." },
  { value: "intermediate", label: "Intermediate", body: "Built a few projects, comfortable with fundamentals." },
  { value: "advanced", label: "Advanced", body: "Shipped substantial work or have internship experience." },
];

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`btn-shine inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:border-slate-300 hover:text-foreground"
      }`}
    >
      {active && <Check className="size-3.5" aria-hidden="true" />}
      {prettyLabel(label)}
    </button>
  );
}

function OnboardingPage() {
  const navigate = useNavigate();
  const { trigger, feedback } = useMatchFeedback();
  const existing = typeof window !== "undefined" ? getLocalProfile() : null;

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<LocalProfile>(existing ?? emptyProfile);
  const [saving, setSaving] = useState(false);

  const update = (patch: Partial<LocalProfile>) => setForm((f) => ({ ...f, ...patch }));
  const toggleIn = (key: "skills" | "interests" | "eligibility", value: string) =>
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter((v) => v !== value) : [...f[key], value],
    }));

  const handleFinish = async () => {
    setSaving(true);
    setLocalProfile(form);
    try {
      const { opportunities } = await fetchOpportunities();
      const best = opportunities.reduce((max, o) => Math.max(max, calculateMatchScore(o, form)), 0);
      trigger(best);
    } catch {
      trigger(60);
    }
    setTimeout(() => navigate({ to: "/feed" }), 1300);
  };

  const steps = [
    {
      title: "Let's start with you",
      subtitle: "Just a name so your feed feels like yours.",
      valid: true,
      content: (
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-foreground">Your name</span>
            <input
              value={form.display_name}
              onChange={(e) => update({ display_name: e.target.value })}
              placeholder="Alex Chen"
              className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-foreground">Who are you right now? (optional)</span>
            <div className="flex flex-wrap gap-2">
              {ELIGIBILITY.map((e) => (
                <Chip key={e} label={e} active={form.eligibility.includes(e)} onClick={() => toggleIn("eligibility", e)} />
              ))}
            </div>
          </label>
        </div>
      ),
    },
    {
      title: "What skills do you have?",
      subtitle: "Pick everything you're comfortable with — this drives most of your match score.",
      valid: form.skills.length > 0,
      content: (
        <div className="flex flex-wrap gap-2">
          {SKILLS.map((s) => (
            <Chip key={s} label={s} active={form.skills.includes(s)} onClick={() => toggleIn("skills", s)} />
          ))}
        </div>
      ),
    },
    {
      title: "What are you interested in?",
      subtitle: "Domains you'd love to work in, even if you're not skilled there yet.",
      valid: form.interests.length > 0,
      content: (
        <div className="flex flex-wrap gap-2">
          {INTERESTS.map((i) => (
            <Chip key={i} label={i} active={form.interests.includes(i)} onClick={() => toggleIn("interests", i)} />
          ))}
        </div>
      ),
    },
    {
      title: "How much experience do you have?",
      subtitle: "We use this to avoid recommending things that are out of reach — or too easy.",
      valid: true,
      content: (
        <div className="grid gap-3 sm:grid-cols-3">
          {LEVELS.map((l) => (
            <button
              key={l.value}
              type="button"
              onClick={() => update({ experience_level: l.value })}
              aria-pressed={form.experience_level === l.value}
              className={`btn-shine rounded-xl border p-4 text-left transition-colors ${
                form.experience_level === l.value
                  ? "border-primary bg-accent"
                  : "border-border bg-card hover:border-slate-300"
              }`}
            >
              <span className="block text-sm font-semibold text-foreground">{l.label}</span>
              <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{l.body}</span>
            </button>
          ))}
        </div>
      ),
    },
  ];

  const current = steps[step]!;
  const isLast = step === steps.length - 1;

  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground sm:px-6 sm:py-16">
      {feedback}
      <div className="mx-auto w-full max-w-2xl">
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div className="mt-6">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Step {step + 1} of {steps.length}
          </span>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{current.title}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">{current.subtitle}</p>
        </div>

        <div className="mt-6 rounded-xl border border-border bg-card p-5 sm:p-6">
          <div className="animate-rise-in" key={step}>
            {current.content}
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:flex sm:justify-between">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="btn-shine inline-flex h-11 items-center justify-center gap-1.5 rounded-lg border border-border px-5 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-40"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back
            </button>
            {isLast ? (
              <button
                type="button"
                onClick={handleFinish}
                disabled={saving}
                className="btn-shine inline-flex h-11 items-center justify-center gap-1.5 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                <Sparkles className="size-4" aria-hidden="true" />
                {saving ? "Matching…" : "Show my matches"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
                disabled={!current.valid}
                className="btn-shine inline-flex h-11 items-center justify-center gap-1.5 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
              >
                Next
                <ArrowRight className="size-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Your answers are stored on this device — no account required.
        </p>
      </div>
    </main>
  );
}
