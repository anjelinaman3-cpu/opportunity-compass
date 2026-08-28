import { createFileRoute, Link } from "@tanstack/react-router";

import { useLocalProfile } from "@/lib/local-profile";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SkillScout — Find Student Opportunities That Fit You" },
      { name: "description", content: "Tell SkillScout about your skills, interests and experience level, and get a personalized feed of hackathons, internships, courses and workshops." },
      { property: "og:title", content: "SkillScout — Find Student Opportunities That Fit You" },
      { property: "og:description", content: "Share your skills and interests once, then see matched hackathons, internships, courses and workshops with clear match scores." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const steps = [
  {
    n: "1",
    title: "Tell us about yourself",
    body: "Pick the skills you already have, the domains you care about, and your current experience level. Takes about a minute.",
  },
  {
    n: "2",
    title: "We match you",
    body: "SkillScout scores every opportunity against your profile and explains exactly why it fits — including the skills worth learning next.",
  },
  {
    n: "3",
    title: "Apply with confidence",
    body: "Filter by type, domain, match strength or deadline, bookmark what matters, and never miss a closing date again.",
  },
];

const categories = [
  { label: "Hackathons", body: "Weekend builds, campus and global." },
  { label: "Internships", body: "Summer and semester placements." },
  { label: "Courses", body: "Structured learning with certificates." },
  { label: "Workshops", body: "Short, hands-on skill sessions." },
  { label: "Competitions", body: "Case, design and data challenges." },
  { label: "Grants & mentorships", body: "Funding and guidance for your work." },
];

function Landing() {
  const { profile } = useLocalProfile();

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <span className="inline-block rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
              Built for students
            </span>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl">
              Stop scrolling ten sites for one opportunity.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              SkillScout learns your skills, interests and experience level, then shows you the hackathons,
              internships, courses and workshops that genuinely fit — each with a match score and a plain
              explanation of why.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/onboarding"
                className="inline-flex h-12 items-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {profile ? "Update your profile" : "Tell us about yourself"}
              </Link>
              {profile && (
                <Link
                  to="/feed"
                  className="inline-flex h-12 items-center rounded-lg border border-border bg-card px-6 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  View your matches
                </Link>
              )}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              No sign-up needed to try it — your answers stay on this device.
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-xl border border-border bg-background p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sample match</p>
              <div className="mt-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-base font-semibold text-foreground">Campus Web Dev Hackathon</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">48 hours · Remote friendly</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold tabular-nums text-emerald-700">87%</p>
                  <p className="text-xs text-muted-foreground">match</p>
                </div>
              </div>
              <div className="mt-5 space-y-1.5 text-sm">
                <p className="flex gap-2"><span className="text-emerald-600">✓</span><span className="text-muted-foreground">Your HTML and CSS skills match the requirements</span></p>
                <p className="flex gap-2"><span className="text-emerald-600">✓</span><span className="text-muted-foreground">Web Development matches your interests</span></p>
                <p className="flex gap-2"><span className="text-emerald-600">✓</span><span className="text-muted-foreground">Suitable for beginners</span></p>
                <p className="flex gap-2"><span className="text-amber-600">⚠</span><span className="text-muted-foreground">JavaScript is recommended</span></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">How SkillScout works</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">Three steps between you and a feed worth reading.</p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="rounded-xl border border-border bg-card p-6 transition-shadow duration-200 hover:shadow-[0_2px_16px_rgba(15,23,42,0.06)]">
              <span className="grid size-9 place-items-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">{s.n}</span>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">What you'll find</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => (
              <div key={c.label} className="rounded-lg border border-border bg-background p-5">
                <p className="font-medium text-foreground">{c.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="rounded-xl border border-border bg-card p-8 text-center sm:p-12">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Ready to see your matches?</h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Answer three short questions about your skills, interests and experience level.
          </p>
          <Link
            to="/onboarding"
            className="mt-7 inline-flex h-12 items-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Tell us about yourself
          </Link>
        </div>
      </section>
    </main>
  );
}
