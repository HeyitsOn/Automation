import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const category = formData.get("category") as string;
    const userId = formData.get("userId") as string;

    if (!file || !category || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const fileName = `${userId}/${category}/${Date.now()}-${file.name}`;
    const buffer = await file.arrayBuffer();

    const { data, error } = await supabase.storage
      .from("Document_files")
      .upload(fileName, buffer, {
        contentType: file.type,
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Record file metadata in database
    const { error: dbError } = await supabase.from("documents").insert([
      {
        user_id: userId,
        file_name: file.name,
        file_path: data.path,
        category,
        status: "uploaded",
        created_at: new Date().toISOString(),
      },
    ]);

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    await resend.emails.send({
      from: "TaxFlow <onboarding@resend.dev>",
      to: "sisnethembasibiya@icloud.com",
      subject: `New document uploaded: ${file.name}`,
      html: `
        <h2>New Document Uploaded</h2>
        <p><strong>File:</strong> ${file.name}</p>
        <p><strong>Category:</strong> ${category}</p>
        <p><strong>User ID:</strong> ${userId}</p>
        <p><strong>Uploaded at:</strong> ${new Date().toLocaleString()}</p>
      `,
    });

    return NextResponse.json(
      { success: true, message: "File uploaded successfully" },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
