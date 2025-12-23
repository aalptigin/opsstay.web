// lib/authProfile.ts
export type StaffProfile = {
  full_name?: string | null;
  role?: string | null;        // "manager" | "editor" | "viewer"
  department?: string | null;
  hotel_name?: string | null;
  email?: string | null;
};

export async function getMyProfile(): Promise<StaffProfile> {
  // 1) session cookie var mı kontrol et
  // (middleware zaten cookie yoksa login'e atıyor)
  const r = await fetch("/api/auth/me", { cache: "no-store" });
  const data = await r.json();

  if (!data?.ok) {
    const err = data?.error || "AUTH_REQUIRED";
    throw new Error(err);
  }

  return data.profile as StaffProfile;
}
