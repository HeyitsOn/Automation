import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAILS = [
  "snethembasibiya@icloud.com",
  "info@theaccountingroom.org",
  "sinethemba@theaccountingroom.org",
];

export async function verifyAdmin(authHeader: string | null): Promise<boolean> {
  if (!authHeader?.startsWith("Bearer ")) return false;
  const token = authHeader.split(" ")[1];
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: { user } } = await client.auth.getUser(token);
  return !!(user && ADMIN_EMAILS.includes(user.email || ""));
}
