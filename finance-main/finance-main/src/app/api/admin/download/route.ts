import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyAdmin } from "@/lib/admin-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const isAdmin = await verifyAdmin(req.headers.get("authorization"));
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { filePath } = await req.json();
  if (!filePath) return NextResponse.json({ error: "Missing filePath" }, { status: 400 });

  const { data, error } = await supabaseAdmin.storage
    .from("Document_files")
    .createSignedUrl(filePath, 60);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ url: data.signedUrl });
}
