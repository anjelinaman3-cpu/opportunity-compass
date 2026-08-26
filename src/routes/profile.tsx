import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";

import { getProfile, upsertProfile } from "@/lib/profiles.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your profile — Forge" },
      { name: "description", content: "Manage your skills, interests, and eligibility to improve your opportunity matches." },
      { property: "og:title", content: "Your profile — Forge" },
      { property: "og:description", content: "Manage your skills, interests, and eligibility to improve your opportunity matches." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
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

function ProfilePage() {
  const navigate = useNavigate();
  const fetchProfile = useServerFn(getProfile);
  const updateProfile = useServerFn(upsertProfile);
  const [session, setSession] = useState<null | { user?: { email?: string } }>(null);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [eligibility, setEligibility] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState("beginner");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (!data.session) navigate({ to: "/auth" });
    });
  }, [navigate]);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => fetchProfile(),
    enabled: !!session,
  });

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.display_name ?? "");
    setBio(profile.bio ?? "");
    setSkills(profile.skills ?? []);
    setInterests(profile.interests ?? []);
    setEligibility(profile.eligibility ?? []);
    setExperienceLevel(profile.experience_level ?? "beginner");
  }, [profile]);

  const toggle = (value: string, list: string[], setter: (v: string[]) => void) => {
    if (list.includes(value)) setter(list.filter((v) => v !== value));
    else setter([...list, value]);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await updateProfile({
        data: {
          display_name: displayName,
          bio,
          skills,
          interests,
          eligibility,
          experience_level: experienceLevel,
        },
      });
      setMessage("Profile updated.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  if (!session) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-5">
        <div className="text-center">
          <h1 className="font-display font-bold text-2xl text-foreground">Sign in to view your profile</h1>
          <Link to="/auth" className="mt-6 inline-flex h-11 px-6 rounded-lg bg-primary text-primary-foreground font-display font-semibold items-center">
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-4xl px-5 sm:px-8 pt-12 pb-16">
        <p className="font-mono text-xs text-muted-foreground mb-1">// PROFILE</p>
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-display font-bold text-3xl tracking-tight text-foreground">Your preferences</h1>
          <button
            onClick={handleSignOut}
            className="h-10 px-4 rounded-lg border border-line text-sm text-muted-foreground hover:text-foreground"
          >
            Sign out
          </button>
        </div>

        {isLoading ? (
          <div className="mt-8 rounded-xl border border-line bg-card p-6 animate-pulse h-96" />
        ) : (
          <div className="mt-8 rounded-xl border border-line bg-card p-6 space-y-8">
            <div className="grid sm:grid-cols-2 gap-4">
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
                <label className="block text-xs font-mono text-muted-foreground mb-1.5">EXPERIENCE LEVEL</label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full h-11 rounded-lg border border-line bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
                >
                  {experienceLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-muted-foreground mb-1.5">BIO</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-line bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                placeholder="A short description of who you are and what you're looking for."
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-muted-foreground mb-2">SKILLS</label>
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
            </div>

            <div>
              <label className="block text-xs font-mono text-muted-foreground mb-2">INTERESTS</label>
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
            </div>

            <div>
              <label className="block text-xs font-mono text-muted-foreground mb-2">ELIGIBILITY</label>
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
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-line">
              <button
                onClick={handleSave}
                disabled={saving}
                className="h-11 px-6 rounded-lg bg-primary text-primary-foreground font-display font-semibold hover:brightness-110 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save profile"}
              </button>
              {message && <p className="text-sm text-muted-foreground">{message}</p>}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
