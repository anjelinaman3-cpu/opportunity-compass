import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Forge" },
      { name: "description", content: "Sign in or create a Forge account to discover student opportunities." },
      { property: "og:title", content: "Sign in — Forge" },
      { property: "og:description", content: "Sign in or create a Forge account to discover student opportunities." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});



function AuthPage() {
  const navigate = useNavigate();
  const { mode } = useSearch({ from: "/auth" }) as { mode?: "signin" | "signup" };
  const [isSignup, setIsSignup] = useState(mode === "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
  }, [navigate]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        navigate({ to: "/onboarding" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });

    if (result.error) {
      setError(result.error.message);
      return;
    }

    if (result.redirected) return;

    // Tokens were returned and session set; redirect to onboarding if new user.
    const { data } = await supabase.auth.getUser();
    if (data.user?.created_at && new Date(data.user.created_at).getTime() > Date.now() - 60_000) {
      navigate({ to: "/onboarding" });
    } else {
      navigate({ to: "/" });
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-5">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-md bg-primary font-display font-bold text-primary-foreground">F</span>
            <span className="font-display font-semibold tracking-tight text-xl text-foreground">
              FORGE<span className="text-primary">/</span>
            </span>
          </Link>
          <h1 className="mt-6 font-display font-bold text-3xl tracking-tight text-foreground">
            {isSignup ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isSignup ? "Join 10,000+ students discovering their next win." : "Sign in to see your personalized feed."}
          </p>
        </div>

        <div className="rounded-xl border border-line bg-card p-6">
          <button
            onClick={handleGoogle}
            className="w-full h-11 rounded-lg border border-line bg-background text-foreground hover:border-muted-foreground transition flex items-center justify-center gap-2"
          >
            <svg className="size-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-line" />
            <span className="text-xs text-muted-foreground">or use email</span>
            <div className="h-px flex-1 bg-line" />
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-muted-foreground mb-1.5">EMAIL</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 rounded-lg border border-line bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
                placeholder="you@university.edu"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-muted-foreground mb-1.5">PASSWORD</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 rounded-lg border border-line bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-sm text-primary">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-display font-semibold hover:brightness-110 transition disabled:opacity-50"
            >
              {loading ? "Please wait..." : isSignup ? "Create account" : "Sign in"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => setIsSignup((s) => !s)}
              className="text-primary hover:underline"
            >
              {isSignup ? "Sign in" : "Sign up"}
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}
