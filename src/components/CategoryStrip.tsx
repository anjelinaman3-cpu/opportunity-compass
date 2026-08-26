import type { Tables } from "@/integrations/supabase/types";

const categoryConfig = [
  { key: "hackathon", label: "Hackathons", color: "text-foreground" },
  { key: "competition", label: "Competitions", color: "text-cyan" },
  { key: "course", label: "Courses", color: "text-foreground" },
  { key: "workshop", label: "Workshops", color: "text-violet" },
  { key: "mentorship", label: "Mentorships", color: "text-amber" },
  { key: "grant", label: "Grants", color: "text-primary" },
];

export function CategoryStrip({ opportunities }: { opportunities: Tables<"opportunities">[] }) {
  const counts = opportunities.reduce<Record<string, number>>((acc, opp) => {
    const key = (opp.type ?? "").toLowerCase();
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <section className="border-t border-line">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x divide-line border-x border-line">
        {categoryConfig.map((cat) => (
          <div key={cat.key} className="p-4">
            <p className={`font-display font-semibold text-xl ${cat.color}`}>{counts[cat.key] ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{cat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
