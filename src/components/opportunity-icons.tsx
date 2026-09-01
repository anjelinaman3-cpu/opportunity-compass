import {
  Trophy,
  Briefcase,
  GraduationCap,
  Presentation,
  Medal,
  Users,
  Banknote,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export const typeIcon: Record<string, LucideIcon> = {
  hackathon: Trophy,
  internship: Briefcase,
  course: GraduationCap,
  workshop: Presentation,
  competition: Medal,
  mentorship: Users,
  grant: Banknote,
};

export function getTypeIcon(type: string | null | undefined): LucideIcon {
  return typeIcon[(type ?? "").toLowerCase()] ?? Sparkles;
}

/** Soft, professional badge tints per opportunity type. */
export const typeBadgeClass: Record<string, string> = {
  hackathon: "bg-blue-50 text-blue-700 ring-blue-100",
  internship: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  course: "bg-violet-50 text-violet-700 ring-violet-100",
  workshop: "bg-amber-50 text-amber-700 ring-amber-100",
  competition: "bg-sky-50 text-sky-700 ring-sky-100",
  mentorship: "bg-rose-50 text-rose-700 ring-rose-100",
  grant: "bg-teal-50 text-teal-700 ring-teal-100",
};

export function getTypeBadgeClass(type: string | null | undefined) {
  return typeBadgeClass[(type ?? "").toLowerCase()] ?? "bg-slate-100 text-slate-700 ring-slate-200";
}
