import { useEffect, useState } from "react";

export type LocalProfile = {
  display_name: string;
  skills: string[];
  interests: string[];
  experience_level: string;
  eligibility: string[];
};

const PROFILE_KEY = "skillscout.profile";
const SAVED_KEY = "skillscout.saved";

export const emptyProfile: LocalProfile = {
  display_name: "",
  skills: [],
  interests: [],
  experience_level: "beginner",
  eligibility: [],
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function getLocalProfile(): LocalProfile | null {
  return read<LocalProfile | null>(PROFILE_KEY, null);
}

export function setLocalProfile(profile: LocalProfile) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  window.dispatchEvent(new Event("skillscout:profile"));
}

export function clearLocalProfile() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PROFILE_KEY);
  window.dispatchEvent(new Event("skillscout:profile"));
}

export function getSavedIds(): string[] {
  return read<string[]>(SAVED_KEY, []);
}

export function toggleSavedId(id: string): string[] {
  const current = getSavedIds();
  const next = current.includes(id) ? current.filter((v) => v !== id) : [...current, id];
  if (typeof window !== "undefined") {
    window.localStorage.setItem(SAVED_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("skillscout:saved"));
  }
  return next;
}

/** Reads the locally stored profile after hydration. */
export function useLocalProfile() {
  const [profile, setProfile] = useState<LocalProfile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setProfile(getLocalProfile());
    sync();
    setReady(true);
    window.addEventListener("skillscout:profile", sync);
    return () => window.removeEventListener("skillscout:profile", sync);
  }, []);

  return { profile, ready };
}

/** Reads locally bookmarked opportunity ids after hydration. */
export function useSavedIds() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => setIds(getSavedIds());
    sync();
    window.addEventListener("skillscout:saved", sync);
    return () => window.removeEventListener("skillscout:saved", sync);
  }, []);

  const toggle = (id: string) => setIds(toggleSavedId(id));

  return { ids, toggle };
}
