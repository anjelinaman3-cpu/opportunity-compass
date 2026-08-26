import type { Tables } from "@/integrations/supabase/types";

export type Opportunity = Tables<"opportunities">;

export type OpportunityWithMatch = Opportunity & {
  match_score: number;
  saved?: boolean;
};

export function calculateMatchScore(
  opportunity: Opportunity,
  profile: {
    skills?: string[] | null;
    interests?: string[] | null;
    eligibility?: string[] | null;
    experience_level?: string | null;
  } | null
): number {
  if (!profile) return 0;

  let score = 0;
  const oppSkills = (opportunity.skills ?? []).map((s) => s.toLowerCase());
  const oppEligibility = (opportunity.eligibility ?? []).map((e) => e.toLowerCase());

  const profileSkills = (profile.skills ?? []).map((s) => s.toLowerCase());
  const profileInterests = (profile.interests ?? []).map((i) => i.toLowerCase());
  const profileEligibility = (profile.eligibility ?? []).map((e) => e.toLowerCase());

  // Skill overlap (up to 50 points)
  const skillMatches = oppSkills.filter((s) => profileSkills.includes(s)).length;
  if (oppSkills.length > 0) {
    score += Math.min(50, (skillMatches / oppSkills.length) * 50 + skillMatches * 6);
  }

  // Interest overlap (up to 25 points)
  const interestMatches = oppSkills.filter((s) => profileInterests.includes(s)).length;
  if (oppSkills.length > 0) {
    score += Math.min(25, (interestMatches / oppSkills.length) * 25 + interestMatches * 3);
  }

  // Eligibility match (up to 20 points)
  if (oppEligibility.length > 0) {
    const eligibleMatches = oppEligibility.filter((e) => profileEligibility.includes(e)).length;
    score += Math.min(20, (eligibleMatches / oppEligibility.length) * 20);
  } else {
    score += 10; // No eligibility restrictions = accessible
  }

  // Experience fit (up to 5 points)
  if (profile.experience_level) {
    score += 5;
  }

  return Math.min(99, Math.round(score));
}

export function getCategoryColor(type: string): string {
  switch (type.toLowerCase()) {
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

export function formatDeadline(date: string | null): { text: string; urgent: boolean } {
  if (!date) return { text: "Open", urgent: false };
  const now = new Date();
  const deadline = new Date(date);
  const diffMs = deadline.getTime() - now.getTime();
  if (diffMs <= 0) return { text: "Closed", urgent: false };

  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 3) return { text: `Closes in ${days} day${days === 1 ? "" : "s"}`, urgent: true };
  if (days <= 14) return { text: `Closes in ${days} days`, urgent: true };
  if (days <= 30) return { text: `Closes in ${days} days`, urgent: false };
  return { text: deadline.toLocaleDateString("en-US", { month: "short", day: "numeric" }), urgent: false };
}
