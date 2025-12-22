// lib/authProfile.ts
export type StaffProfile = {
  full_name?: string | null;
  role?: string | null;          // "manager" gibi
  department?: string | null;
  hotel_name?: string | null;
};

function mapRole(u: any): string {
  // Senin login demo yapın: permission admin/editor/viewer
  const perm = (u?.permission || u?.role || "").toLowerCase();
  if (perm === "admin" || perm === "manager") return "manager";
  return perm || "viewer";
}

export async function getMyProfile(): Promise<StaffProfile> {
  // Bu fonksiyon sadece client tarafında çalışmalı
  if (typeof window === "undefined") {
    // build/prerender sırasında buraya girerse patlamasın
    throw new Error("CLIENT_ONLY");
  }

  const raw =
    window.localStorage.getItem("opsstay_user") ||
    window.localStorage.getItem("opsstay_profile");

  if (!raw) throw new Error("PROFILE_MISSING");

  const u = JSON.parse(raw);

  return {
    full_name: u?.fullName ?? u?.full_name ?? "Yetkili Kullanıcı",
    role: mapRole(u),
    department: u?.department ?? null,
    hotel_name: u?.hotelName ?? u?.hotel_name ?? null,
  };
}
