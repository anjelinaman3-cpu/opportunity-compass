import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Tables } from "@/integrations/supabase/types";

export type Profile = Tables<"profiles">;
export type ProfileInput = Omit<
  Profile,
  "id" | "user_id" | "created_at" | "updated_at"
>;

export const getProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") throw new Error(error.message);
    return data ?? null;
  });

export const upsertProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: Partial<ProfileInput>) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: profile, error } = await supabase
      .from("profiles")
      .upsert({ user_id: userId, ...data })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return profile;
  });

export const completeOnboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: Partial<ProfileInput>) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: profile, error } = await supabase
      .from("profiles")
      .upsert({
        user_id: userId,
        ...data,
        onboarding_complete: true,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return profile;
  });
