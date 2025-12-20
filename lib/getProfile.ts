import { supabase } from "./supabaseClient";

export type StaffProfile = {
  user_id: string;
  full_name: string | null;
  role: "admin" | "staff" | "manager" | string;
  department: string | null;
  hotel_name: string | null;
  staff_code: string | null;
};

export async function getMyProfile(): Promise<StaffProfile | null> {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return null;

  const { data, error } = await supabase
    .from("staff_profiles")
    .select("user_id, full_name, role, department, hotel_name, staff_code")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    // staff_profiles yoksa burası hata verir -> null dönelim
    return null;
  }
  return (data as StaffProfile) ?? null;
}