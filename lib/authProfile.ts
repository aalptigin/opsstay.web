// lib/authProfile.ts
import { supabase } from "@/lib/supabaseClient";

export type StaffProfile = {
  user_id: string;
  hotel_id: string;
  full_name: string | null;
  role: "manager" | "staff";
  is_active: boolean;
};

export async function getMyProfile(): Promise<StaffProfile> {
  const { data: userData, error: userErr } = await supabase.auth.getUser();

  if (userErr || !userData.user) {
    throw new Error("AUTH_MISSING");
  }

  const { data: profile, error: profErr } = await supabase
    .from("staff_profiles")
    .select("user_id, hotel_id, full_name, role, is_active")
    .eq("user_id", userData.user.id)
    .single();

  if (profErr || !profile) throw new Error("PROFILE_MISSING");
  if (!profile.is_active) throw new Error("PROFILE_INACTIVE");

  return profile as StaffProfile;
}
