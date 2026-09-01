/**
 * SkillScout matching engine.
 *
 * A transparent, rule-based scoring model that runs locally in the app — no
 * external AI model is called. Every score can be explained back to the student
 * in plain language via `explainMatch`.
 */

export type Opportunity = {
  id: string;
  title: string;
  type: string;
  skills?: string[] | null;
  domains?: string[] | null;
  eligibility?: string[] | null;
  levels?: string[] | null;
  deadline_at?: string | null;
  [key: string]: unknown;
};

export type MatchProfile = {
  skills?: string[] | null;
  interests?: string[] | null;
  eligibility?: string[] | null;
  experience_level?: string | null;
  preferred_types?: string[] | null;
};

export type OpportunityWithMatch = Opportunity & {
  match_score: number;
  saved?: boolean;
};

export type MatchReason = { kind: "good" | "warn"; text: string };

export type MatchResult = {
  score: number;
  reasons: MatchReason[];
  summary: string;
};

const LEVEL_TAGS: Record<string, string[]> = {
  beginner: ["beginner", "no-experience", "high-school", "undergraduate"],
  intermediate: ["intermediate", "undergraduate", "graduate", "team-based"],
  advanced: ["advanced", "graduate", "recent-grad"],
};

const lower = (values?: string[] | null) => (values ?? []).map((v) => String(v).toLowerCase());

export function prettyLabel(value: string) {
  return String(value)
    .split(/[-_\s]+/)
    .map((w) => (w.length <= 2 ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

/** Weighted 0–99 fit score between an opportunity and a student profile. */
export function calculateMatchScore(opportunity: Opportunity, profile: MatchProfile | null): number {
  if (!profile) return 0;

  const oppSkills = lower(opportunity.skills);
  const oppDomains = lower(opportunity.domains);
  const oppEligibility = lower(opportunity.eligibility);
  const oppLevels = lower(opportunity.levels);

  const mySkills = lower(profile.skills);
  const myInterests = lower(profile.interests);
  const myEligibility = lower(profile.eligibility);
  const level = (profile.experience_level ?? "").toLowerCase();
  const preferredTypes = lower(profile.preferred_types);

  let score = 10; // baseline: every listing is open to students

  // Skills — up to 45 points
  if (oppSkills.length > 0) {
    const hits = oppSkills.filter((s) => mySkills.includes(s)).length;
    score += Math.min(45, (hits / oppSkills.length) * 38 + hits * 4);
  } else {
    score += 15;
  }

  // Interests / domain — up to 22 points
  const interestPool = [...oppDomains, ...oppSkills];
  if (interestPool.length > 0 && myInterests.length > 0) {
    const hits = interestPool.filter((d) => myInterests.includes(d)).length;
    score += Math.min(22, hits * 9);
  }

  // Experience level — up to 13 points
  if (level) {
    if (oppLevels.length > 0) score += oppLevels.includes(level) ? 13 : 3;
    else score += 8;
  }

  // Eligibility — up to 10 points
  if (oppEligibility.length > 0) {
    const tags = new Set([...myEligibility, ...(LEVEL_TAGS[level] ?? [])]);
    const hits = oppEligibility.filter((e) => tags.has(e)).length;
    score += Math.min(10, (hits / oppEligibility.length) * 10);
  } else {
    score += 6;
  }

  // Opportunity type preference — up to 5 points
  if (preferredTypes.length > 0 && preferredTypes.includes(opportunity.type.toLowerCase())) {
    score += 5;
  }

  return Math.max(5, Math.min(99, Math.round(score)));
}

/** Plain-language reasons behind a score. */
export function explainMatch(opportunity: Opportunity, profile: MatchProfile | null): MatchReason[] {
  if (!profile) return [];

  const oppSkills = lower(opportunity.skills);
  const oppDomains = lower(opportunity.domains);
  const oppEligibility = lower(opportunity.eligibility);
  const oppLevels = lower(opportunity.levels);
  const mySkills = lower(profile.skills);
  const myInterests = lower(profile.interests);
  const myEligibility = lower(profile.eligibility);
  const level = (profile.experience_level ?? "").toLowerCase();

  const reasons: MatchReason[] = [];

  const skillHits = oppSkills.filter((s) => mySkills.includes(s));
  if (skillHits.length > 0) {
    reasons.push({
      kind: "good",
      text: `Your ${skillHits.slice(0, 3).map(prettyLabel).join(", ")} skill${skillHits.length === 1 ? "" : "s"} match the requirements`,
    });
  }

  const interestHits = [...oppDomains, ...oppSkills].filter((d) => myInterests.includes(d));
  if (interestHits.length > 0) {
    reasons.push({
      kind: "good",
      text: `${[...new Set(interestHits)].slice(0, 2).map(prettyLabel).join(" and ")} matches your interests`,
    });
  }

  if (level) {
    const levelFits = oppLevels.length === 0 || oppLevels.includes(level);
    reasons.push(
      levelFits
        ? { kind: "good", text: `Suitable for ${level} level students` }
        : { kind: "warn", text: `Usually aimed at ${oppLevels.map(prettyLabel).join(" / ")} students` }
    );
  }

  if (oppEligibility.length > 0) {
    const tags = new Set([...myEligibility, ...(LEVEL_TAGS[level] ?? [])]);
    if (!oppEligibility.some((e) => tags.has(e))) {
      reasons.push({
        kind: "warn",
        text: `Check eligibility: open to ${oppEligibility.slice(0, 2).map(prettyLabel).join(", ")}`,
      });
    }
  }

  const missing = oppSkills.filter((s) => !mySkills.includes(s));
  if (missing.length > 0) {
    reasons.push({
      kind: "warn",
      text: `${missing.slice(0, 2).map(prettyLabel).join(" and ")} ${missing.length === 1 ? "is" : "are"} recommended`,
    });
  }

  if (reasons.length === 0) {
    reasons.push({ kind: "warn", text: "Broad fit — add more skills to your profile for a sharper match" });
  }

  return reasons.slice(0, 4);
}

/** One-sentence summary of the match, suitable for cards and detail pages. */
export function summarizeMatch(opportunity: Opportunity, profile: MatchProfile | null, score: number): string {
  if (!profile) return "Create your profile to see how well this fits you.";

  const mySkills = lower(profile.skills);
  const skillHits = lower(opportunity.skills).filter((s) => mySkills.includes(s));
  const interestHits = [...lower(opportunity.domains), ...lower(opportunity.skills)].filter((d) =>
    lower(profile.interests).includes(d)
  );
  const level = (profile.experience_level ?? "student").toLowerCase();
  const strength = score >= 75 ? "Strong match" : score >= 50 ? "Good match" : "Partial match";

  const parts: string[] = [];
  if (skillHits.length > 0) parts.push(`you have ${skillHits.slice(0, 2).map(prettyLabel).join(" and ")} skills`);
  if (interestHits.length > 0)
    parts.push(`it sits in ${[...new Set(interestHits)].slice(0, 1).map(prettyLabel).join("")}, one of your interests`);
  parts.push(`this ${opportunity.type.toLowerCase()} suits ${level} level students`);

  return `${strength} because ${parts.join(", and ")}.`;
}

/** Score + reasons + summary in one call. */
export function buildMatch(opportunity: Opportunity, profile: MatchProfile | null): MatchResult {
  const score = calculateMatchScore(opportunity, profile);
  return {
    score,
    reasons: explainMatch(opportunity, profile),
    summary: summarizeMatch(opportunity, profile, score),
  };
}

export function getCategoryColor(type: string): string {
  switch ((type ?? "").toLowerCase()) {
    case "hackathon":
      return "neon";
    case "competition":
      return "cyan";
    case "course":
      return "violet";
    case "workshop":
      return "amber";
    case "mentorship":
      return "primary";
    case "grant":
      return "success";
    default:
      return "primary";
  }
}

export function formatDeadline(date: string | null | undefined): { text: string; urgent: boolean } {
  if (!date) return { text: "Rolling", urgent: false };
  const deadline = new Date(date);
  const diffMs = deadline.getTime() - Date.now();
  if (diffMs <= 0) return { text: "Closed", urgent: false };

  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 3) return { text: `Closes in ${days} day${days === 1 ? "" : "s"}`, urgent: true };
  if (days <= 14) return { text: `Closes in ${days} days`, urgent: true };
  return { text: `Closes in ${days} days`, urgent: false };
}

export function daysUntil(date: string | null | undefined): number | null {
  if (!date) return null;
  const diff = new Date(date).getTime() - Date.now();
  return diff <= 0 ? 0 : Math.ceil(diff / (1000 * 60 * 60 * 24));
}
