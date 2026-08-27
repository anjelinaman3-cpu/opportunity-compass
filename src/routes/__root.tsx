import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { supabase } from "@/integrations/supabase/client";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "SkillScout — Student Opportunity Discovery" },
      { name: "description", content: "Personalized hackathons, competitions, courses, and workshops for students." },
      { name: "author", content: "SkillScout" },
      { property: "og:title", content: "SkillScout — Student Opportunity Discovery" },
      { property: "og:description", content: "Personalized hackathons, competitions, courses, and workshops for students." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@skillscout" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700;800&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function Header() {
  const [session, setSession] = useState<null | { user?: { email?: string } }>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const navLinkClass = "text-sm text-muted-foreground hover:text-foreground transition-colors";
  const activeNavClass = "text-sm text-foreground font-medium";

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-background/85 backdrop-blur">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 h-16 flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-md bg-primary font-display font-bold text-primary-foreground">S</span>
          <span className="font-display font-semibold tracking-tight text-lg text-foreground">
            SKILLSCOUT<span className="text-primary">/</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          <Link to="/" activeProps={{ className: activeNavClass }} className={navLinkClass}>
            Discover
          </Link>
          <Link to="/saved" activeProps={{ className: activeNavClass }} className={navLinkClass}>
            Saved
          </Link>
          <Link to="/profile" activeProps={{ className: activeNavClass }} className={navLinkClass}>
            Profile
          </Link>
        </nav>

        <div className="flex-1" />

        <div className="hidden sm:flex items-center gap-3">
          {session ? (
            <>
              <span className="text-xs text-muted-foreground font-mono truncate max-w-[160px]">
                {session.user?.email}
              </span>
              <button
                onClick={() => supabase.auth.signOut()}
                className="h-9 px-4 rounded-md border border-line text-sm font-display font-medium text-foreground hover:border-muted-foreground transition"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/auth"
                className="h-9 px-4 rounded-md border border-line text-sm font-display font-medium text-foreground hover:border-muted-foreground transition flex items-center"
              >
                Sign in
              </Link>
              <Link
                to="/auth"
                search={{ mode: "signup" }}
                className="h-9 px-4 rounded-md bg-primary text-sm font-display font-semibold text-primary-foreground hover:brightness-110 transition flex items-center"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden p-2 text-muted-foreground"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <svg className="size-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-line bg-background px-5 py-4 space-y-3">
          <Link to="/" className="block text-sm text-muted-foreground hover:text-foreground" onClick={() => setMobileOpen(false)}>
            Discover
          </Link>
          <Link to="/saved" className="block text-sm text-muted-foreground hover:text-foreground" onClick={() => setMobileOpen(false)}>
            Saved
          </Link>
          <Link to="/profile" className="block text-sm text-muted-foreground hover:text-foreground" onClick={() => setMobileOpen(false)}>
            Profile
          </Link>
          {!session && (
            <Link to="/auth" className="block text-sm text-primary" onClick={() => setMobileOpen(false)}>
              Sign in
            </Link>
          )}
        </div>
      )}
    </header>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Header />
      <Outlet />
    </QueryClientProvider>
  );
}
