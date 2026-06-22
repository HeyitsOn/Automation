import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyAdmin } from "@/lib/admin-auth";
import { NextRequest, NextResponse } from "next/server";

const REQUIRED_LABELS: Record<string, string> = {
  id_document: "ID Document / Passport",
  irp5: "IRP5 / IT3(a)",
  bank_statements: "Bank Statements",
  payslips: "Payslips",
  medical_aid: "Medical Aid Certificate",
  ra_certificate: "Retirement Annuity (RA)",
};

export async function GET(req: NextRequest) {
  const isAdmin = await verifyAdmin(req.headers.get("authorization"));
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: docs, error } = await supabaseAdmin
    .from("documents")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Fetch all users to map user_id → email and name
  const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
  const userMap = Object.fromEntries(
    users.map(u => [u.id, { email: u.email ?? "Unknown", name: u.user_metadata?.full_name ?? "" }])
  );

  const enriched = (docs ?? []).map(doc => ({
    ...doc,
    category_label: REQUIRED_LABELS[doc.category] ?? doc.category,
    client_email: userMap[doc.user_id]?.email ?? "Unknown",
    client_name: userMap[doc.user_id]?.name ?? "",
  }));

  return NextResponse.json(enriched);
}

export async function PATCH(req: NextRequest) {
  const isAdmin = await verifyAdmin(req.headers.get("authorization"));
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, status } = await req.json();
  const { error } = await supabaseAdmin
    .from("documents")
    .update({ status })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
