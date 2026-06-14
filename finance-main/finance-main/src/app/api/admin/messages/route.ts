import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyAdmin } from "@/lib/admin-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const isAdmin = await verifyAdmin(req.headers.get("authorization"));
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("messages")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const isAdmin = await verifyAdmin(req.headers.get("authorization"));
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId, content } = await req.json();
  const { error } = await supabaseAdmin.from("messages").insert([{
    user_id: userId,
    sender: "Advisor",
    content,
    created_at: new Date().toISOString(),
  }]);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
