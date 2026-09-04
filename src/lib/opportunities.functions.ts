import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { calculateMatchScore, type OpportunityWithMatch } from "./matching";

function createPublishableClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const url = process.env["SUPABASE_URL"]!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const listOpportunities = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createPublishableClient();
  const { data, error } = await supabase
    .from("opportunities")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getOpportunity = createServerFn({ method: "GET" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const supabase = createPublishableClient();
    const { data: opportunity, error } = await supabase
      .from("opportunities")
      .select("*")
      .eq("id", data.id)
      .eq("published", true)
      .single();

    if (error) throw new Error(error.message);
    return opportunity;
  });

export const getRecommendedOpportunities = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const [{ data: profile }, { data: opportunities }, { data: saved }] = await Promise.all([
      supabase.from("profiles").select("skills,interests,eligibility,experience_level").eq("user_id", userId).single(),
      supabase.from("opportunities").select("*").eq("published", true).order("created_at", { ascending: false }),
      supabase.from("saved_opportunities").select("opportunity_id").eq("user_id", userId),
    ]);

    if (!opportunities) return [];

    const savedIds = new Set((saved ?? []).map((s) => s.opportunity_id));

    const withScores = opportunities.map((opp) => ({
      ...opp,
      match_score: calculateMatchScore(opp, profile),
      saved: savedIds.has(opp.id),
    }));

    return withScores.sort((a, b) => b.match_score - a.match_score);
  });

export const getSavedOpportunities = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data, error } = await supabase
      .from("saved_opportunities")
      .select("opportunity_id, opportunities(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (
      data
        ?.map((row) => row.opportunities)
        .filter((opp): opp is NonNullable<typeof opp> => opp !== null) ?? []
    );
  });

export const getSavedOpportunityIds = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("saved_opportunities")
      .select("opportunity_id")
      .eq("user_id", userId);

    if (error) throw new Error(error.message);
    return (data ?? []).map((d) => d.opportunity_id);
  });

export const saveOpportunity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { opportunityId: string }) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("saved_opportunities")
      .insert({ user_id: userId, opportunity_id: data.opportunityId })
      .select();

    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const unsaveOpportunity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { opportunityId: string }) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("saved_opportunities")
      .delete()
      .eq("user_id", userId)
      .eq("opportunity_id", data.opportunityId);

    if (error) throw new Error(error.message);
    return { ok: true };
  });
