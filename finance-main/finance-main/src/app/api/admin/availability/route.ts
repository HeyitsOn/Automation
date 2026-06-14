import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyAdmin } from "@/lib/admin-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const isAdmin = await verifyAdmin(req.headers.get("authorization"));
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("availability")
    .select("*")
    .order("date", { ascending: true })
    .order("time", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const isAdmin = await verifyAdmin(req.headers.get("authorization"));
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { date, time } = await req.json();
  if (!date || !time) return NextResponse.json({ error: "Missing date or time" }, { status: 400 });

  const { error } = await supabaseAdmin
    .from("availability")
    .insert([{ date, time, is_booked: false }]);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const isAdmin = await verifyAdmin(req.headers.get("authorization"));
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  const { error } = await supabaseAdmin.from("availability").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
