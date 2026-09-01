/**
 * Opportunity service layer.
 *
 * UI components never talk to a data source directly — they call this module.
 * Today it reads from the project backend (with the bundled sample dataset as a
 * fallback). To plug in a real provider later (Devpost, Internshala, Coursera,
 * a university feed, ...), add a fetcher below and merge it in `fetchOpportunities`.
 * Provider credentials belong in server-side environment variables and must be
 * read inside server functions, never in this browser-safe module.
 */
import { useQuery } from "@tanstack/react-query";

import { listOpportunities, getOpportunity } from "@/lib/opportunities.functions";
import { mockOpportunities, type OpportunityRecord } from "@/lib/opportunities.mock";

export type { OpportunityRecord } from "@/lib/opportunities.mock";

export type OpportunitySource = "backend" | "sample";

export type OpportunityResult = {
  opportunities: OpportunityRecord[];
  source: OpportunitySource;
};

const DOMAIN_BY_TYPE: Record<string, string[]> = {
  hackathon: ["software-development"],
  internship: ["career"],
  course: ["learning"],
  workshop: ["learning"],
  competition: ["career"],
  mentorship: ["career"],
  grant: ["research"],
};

/** Normalises any provider payload into the shape the UI expects. */
export function normalizeOpportunity(raw: Record<string, unknown>): OpportunityRecord {
  const type = String(raw["type"] ?? "opportunity").toLowerCase();
  const skills = (raw["skills"] as string[] | null) ?? [];
  return {
    id: String(raw["id"]),
    title: String(raw["title"] ?? "Untitled opportunity"),
    host: (raw["host"] as string | null) ?? null,
    type,
    description: (raw["description"] as string | null) ?? null,
    skills,
    domains: (raw["domains"] as string[] | null) ?? DOMAIN_BY_TYPE[type] ?? [],
    eligibility: (raw["eligibility"] as string[] | null) ?? [],
    levels: (raw["levels"] as string[] | null) ?? null,
    mode: (raw["mode"] as string | null) ?? null,
    location: (raw["location"] as string | null) ?? null,
    starts_at: (raw["starts_at"] as string | null) ?? null,
    deadline_at: (raw["deadline_at"] as string | null) ?? null,
    url: (raw["url"] as string | null) ?? null,
    prize: (raw["prize"] as string | null) ?? null,
    certificate: (raw["certificate"] as boolean | null) ?? null,
    image_url: (raw["image_url"] as string | null) ?? null,
    source: "backend",
  };
}

/** Loads every opportunity available to the app. */
export async function fetchOpportunities(): Promise<OpportunityResult> {
  try {
    const rows = await listOpportunities();
    if (Array.isArray(rows) && rows.length > 0) {
      return {
        opportunities: rows.map((row) => normalizeOpportunity(row as unknown as Record<string, unknown>)),
        source: "backend",
      };
    }
  } catch {
    // Provider unavailable — fall through to the bundled sample dataset.
  }
  return { opportunities: mockOpportunities, source: "sample" };
}

/** Loads a single opportunity by id. */
export async function fetchOpportunityById(id: string): Promise<OpportunityRecord | null> {
  const local = mockOpportunities.find((o) => o.id === id);
  if (local) return local;
  try {
    const row = await getOpportunity({ data: { id } });
    return row ? normalizeOpportunity(row as unknown as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export function useOpportunities() {
  return useQuery({
    queryKey: ["opportunities", "all"],
    queryFn: fetchOpportunities,
    staleTime: 5 * 60 * 1000,
  });
}

export function useOpportunity(id: string) {
  return useQuery({
    queryKey: ["opportunity", id],
    queryFn: () => fetchOpportunityById(id),
  });
}
