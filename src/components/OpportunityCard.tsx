import { Link } from "@tanstack/react-router";
import { formatDeadline, getCategoryColor } from "@/lib/matching";
import type { Tables } from "@/integrations/supabase/types";

export type OpportunityCardProps = {
  opportunity: Tables<"opportunities"> & { match_score?: number; saved?: boolean };
  onToggleSave?: (id: string, save: boolean) => void | Promise<void>;
};

const colorMap: Record<string, { bg: string; text: string; borderHover: string }> = {
  neon: { bg: "bg-neon", text: "text-ink", borderHover: "hover:border-neon/50" },
  cyan: { bg: "bg-cyan", text: "text-ink", borderHover: "hover:border-cyan/50" },
  violet: { bg: "bg-violet", text: "text-ink", borderHover: "hover:border-violet/50" },
  amber: { bg: "bg-amber", text: "text-ink", borderHover: "hover:border-amber/50" },
  primary: { bg: "bg-primary", text: "text-primary-foreground", borderHover: "hover:border-primary/50" },
  success: { bg: "bg-emerald-500", text: "text-white", borderHover: "hover:border-emerald-500/50" },
};

export function OpportunityCard({ opportunity, onToggleSave }: OpportunityCardProps) {
  const colorKey = getCategoryColor(opportunity.type);
  const color = colorMap[colorKey] ?? colorMap["primary"]!;
  const deadline = formatDeadline(opportunity.deadline_at);

  const prizeDisplay = opportunity.prize
    ? opportunity.prize
    : opportunity.certificate
      ? "Certificate"
      : null;

  return (
    <article className={`group rounded-xl border border-line bg-card overflow-hidden transition ${color.borderHover}`}>
      <Link to="/opportunities/$id" params={{ id: opportunity.id }} className="block relative">
        <div className="relative">
          <img
            src={opportunity.image_url ?? "/images/opportunity-hackathon.jpg"}
            alt={opportunity.title}
            className="w-full aspect-[16/10] object-cover bg-muted"
            loading="lazy"
            width={1024}
            height={640}
          />
          <span
            className={`absolute top-3 left-3 rounded-full ${color.bg} ${color.text} px-2.5 py-1 font-mono text-[11px] font-medium uppercase tracking-wide`}
          >
            {opportunity.type}
          </span>
          {typeof opportunity.match_score === "number" && opportunity.match_score > 0 && (
            <span className="absolute top-3 right-3 rounded-full bg-background/70 px-2.5 py-1 font-mono text-[11px] text-primary backdrop-blur">
              {opportunity.match_score}% match
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-display font-semibold text-lg leading-snug text-foreground">{opportunity.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{opportunity.description}</p>
          <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs font-mono text-muted-foreground">
            <span>
              {opportunity.mode === "remote" ? "Remote" : opportunity.location ?? "TBD"}
              {opportunity.starts_at ? ` · ${new Date(opportunity.starts_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : ""}
            </span>
            {prizeDisplay ? (
              <span className={deadline.urgent ? "text-primary" : "text-muted-foreground"}>{prizeDisplay}</span>
            ) : (
              <span className={deadline.urgent ? "text-primary" : "text-muted-foreground"}>{deadline.text}</span>
            )}
          </div>
        </div>
      </Link>
      {onToggleSave && (
        <div className="px-4 pb-4 -mt-2">
          <button
            onClick={() => onToggleSave(opportunity.id, !opportunity.saved)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition ${
              opportunity.saved
                ? "bg-primary text-primary-foreground border-primary"
                : "border-line text-muted-foreground hover:text-foreground hover:border-muted-foreground"
            }`}
          >
            {opportunity.saved ? "Saved" : "Save"}
          </button>
        </div>
      )}
    </article>
  );
}
