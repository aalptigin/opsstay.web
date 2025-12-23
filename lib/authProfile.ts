// lib/authProfile.ts
export type StaffProfile = {
  full_name?: string | null;
  role?: string | null;        // "manager" | "editor" | "viewer"
  department?: string | null;
  hotel_name?: string | null;
  email?: string | null;
};

export async function getMyProfile(): Promise<StaffProfile> {
  // Artık Supabase yok. Session cookie üzerinden kontrol ediyoruz.
  const r = await fetch("/api/auth/me", { cache: "no-store" });
  const data = await r.json();
  if (!data?.ok) throw new Error(data?.error || "AUTH_REQUIRED");
  return data.profile as StaffProfile;
}
