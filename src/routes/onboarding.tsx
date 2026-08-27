import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { completeOnboarding } from "@/lib/profiles.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Set up your profile — SkillScout" },
      { name: "description", content: "Tell us about your skills and interests to get personalized opportunity matches." },
      { property: "og:title", content: "Set up your profile — SkillScout" },
      { property: "og:description", content: "Tell us about your skills and interests to get personalized opportunity matches." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OnboardingPage,
});

const availableSkills = [
  "python",
  "javascript",
  "react",
  "machine-learning",
  "ui-design",
  "product-management",
  "blockchain",
  "robotics",
  "data-science",
  "cybersecurity",
  "iot",
  "mobile",
];

const availableInterests = [
  "ai-ethics",
  "climate-tech",
  "fintech",
  "healthcare",
  "education",
  "social-impact",
  "web3",
  "robotics",
  "design",
];

const availableEligibility = [
  "undergraduate",
  "graduate",
  "high-school",
  "recent-grad",
  "no-experience",
  "team-based",
  "individual",
];

const experienceLevels = ["beginner", "intermediate", "advanced"];

function OnboardingPage() {
  const navigate = useNavigate();
  const complete = useServerFn(completeOnboarding);

  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [eligibility, setEligibility] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState("beginner");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) navigate({ to: "/auth" });
    });
  }, [navigate]);

  const toggle = (value: string, list: string[], setter: (v: string[]) => void) => {
    if (list.includes(value)) setter(list.filter((v) => v !== value));
    else setter([...list, value]);
  };

  const handleFinish = async () => {
    setLoading(true);
    setError(null);
    try {
      await complete({
        data: {
          display_name: displayName,
          bio,
          skills,
          interests,
          eligibility,
          experience_level: experienceLevel,
        },
      });
      navigate({ to: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: "Let's build your profile",
      subtitle: "This powers your personalized opportunity matches.",
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-muted-foreground mb-1.5">DISPLAY NAME</label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full h-11 rounded-lg border border-line bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
              placeholder="Alex Chen"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-muted-foreground mb-1.5">BIO (optional)</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-line bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              placeholder="CS junior passionate about AI and climate tech."
            />
          </div>
        </div>
      ),
    },
    {
      title: "What are your skills?",
      subtitle: "Select the technologies and domains you already know.",
      content: (
        <div className="flex flex-wrap gap-2">
          {availableSkills.map((skill) => (
            <button
              key={skill}
              onClick={() => toggle(skill, skills, setSkills)}
              className={`px-3 py-1.5 rounded-md border text-xs font-mono transition ${
                skills.includes(skill)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-line text-muted-foreground hover:text-foreground"
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
      ),
    },
    {
      title: "What are your interests?",
      subtitle: "Select domains or themes that excite you.",
      content: (
        <div className="flex flex-wrap gap-2">
          {availableInterests.map((interest) => (
            <button
              key={interest}
              onClick={() => toggle(interest, interests, setInterests)}
              className={`px-3 py-1.5 rounded-md border text-xs font-mono transition ${
                interests.includes(interest)
                  ? "bg-cyan text-ink border-cyan"
                  : "border-line text-muted-foreground hover:text-foreground"
              }`}
            >
              {interest}
            </button>
          ))}
        </div>
      ),
    },
    {
      title: "Who are you eligible as?",
      subtitle: "Select every option that applies to you.",
      content: (
        <div className="flex flex-wrap gap-2">
          {availableEligibility.map((item) => (
            <button
              key={item}
              onClick={() => toggle(item, eligibility, setEligibility)}
              className={`px-3 py-1.5 rounded-md border text-xs font-mono transition ${
                eligibility.includes(item)
                  ? "bg-violet text-ink border-violet"
                  : "border-line text-muted-foreground hover:text-foreground"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      ),
    },
    {
      title: "Experience level",
      subtitle: "How would you describe your current depth?",
      content: (
        <div className="grid grid-cols-3 gap-3">
          {experienceLevels.map((level) => (
            <button
              key={level}
              onClick={() => setExperienceLevel(level)}
              className={`rounded-lg border p-4 text-center text-sm font-display font-semibold transition ${
                experienceLevel === level
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-line text-muted-foreground hover:text-foreground"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      ),
    },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-xl">
        <div className="mb-8">
          <div className="h-1.5 rounded-full bg-line overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>
          <div className="mt-6">
            <span className="font-mono text-xs text-muted-foreground">
              STEP {step + 1}/{steps.length}
            </span>
            <h1 className="mt-1 font-display font-bold text-3xl tracking-tight text-foreground">
              {steps[step]!.title}
            </h1>
            <p className="mt-1 text-muted-foreground">{steps[step]!.subtitle}</p>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-card p-6">
          {steps[step]!.content}
          {error && <p className="mt-4 text-sm text-primary">{error}</p>}
          <div className="mt-8 flex justify-between">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="h-11 px-5 rounded-lg border border-line text-sm font-display font-medium text-muted-foreground hover:text-foreground disabled:opacity-30"
            >
              Back
            </button>
            {step < steps.length - 1 ? (
              <button
                onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
                className="h-11 px-6 rounded-lg bg-primary text-primary-foreground font-display font-semibold hover:brightness-110"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={loading}
                className="h-11 px-6 rounded-lg bg-primary text-primary-foreground font-display font-semibold hover:brightness-110 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Finish"}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
