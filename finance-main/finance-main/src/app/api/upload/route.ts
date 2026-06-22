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

    // Get client email for the notification
    const { data: userData } = await supabase.auth.admin.getUserById(userId);
    const clientEmail = userData?.user?.email ?? "Unknown client";

    const REQUIRED_LABELS: Record<string, string> = {
      id_document: "ID Document / Passport",
      irp5: "IRP5 / IT3(a)",
      bank_statements: "Bank Statements",
      payslips: "Payslips",
      medical_aid: "Medical Aid Certificate",
      ra_certificate: "Retirement Annuity (RA)",
    };

    const uploadHtml = `
      <!DOCTYPE html><html><head><meta charset="utf-8"></head>
      <body style="margin:0;padding:0;background:#F5F2EC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;margin:0 auto;padding:24px 16px;">
          <tr><td>
            <div style="background:#6B7A45;border-radius:16px 16px 0 0;padding:24px 28px;">
              <p style="margin:0;font-size:18px;font-weight:700;color:#fff;">New Document Uploaded</p>
              <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.7);">The Accounting Room — Client Portal</p>
            </div>
            <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 16px 16px;padding:24px 28px;">
              <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
                <tr style="background:#F7F8FA;"><td style="padding:10px 14px;font-size:13px;font-weight:600;color:#6B7280;">Client</td><td style="padding:10px 14px;font-size:13px;color:#111827;">${clientEmail}</td></tr>
                <tr><td style="padding:10px 14px;font-size:13px;font-weight:600;color:#6B7280;">Document</td><td style="padding:10px 14px;font-size:13px;color:#111827;">${REQUIRED_LABELS[category] ?? category}</td></tr>
                <tr style="background:#F7F8FA;"><td style="padding:10px 14px;font-size:13px;font-weight:600;color:#6B7280;">File name</td><td style="padding:10px 14px;font-size:13px;color:#111827;">${file.name}</td></tr>
                <tr><td style="padding:10px 14px;font-size:13px;font-weight:600;color:#6B7280;">Uploaded at</td><td style="padding:10px 14px;font-size:13px;color:#111827;">${new Date().toLocaleString("en-ZA")}</td></tr>
              </table>
              <p style="font-size:12px;color:#9ca3af;margin:0;">The file is attached to this email. Log in to the admin portal to manage all submissions.</p>
            </div>
          </td></tr>
        </table>
      </body></html>
    `;

    const fileBuffer = Buffer.from(buffer);
    const attachment = { filename: file.name, content: fileBuffer };

    await Promise.all([
      resend.emails.send({
        from: "The Accounting Room <onboarding@resend.dev>",
        to: "snethembasibiya@icloud.com",
        subject: `📎 ${clientEmail} uploaded: ${REQUIRED_LABELS[category] ?? category}`,
        html: uploadHtml,
        attachments: [attachment],
      }),
      resend.emails.send({
        from: "The Accounting Room <onboarding@resend.dev>",
        to: "info@theaccountingroom.org",
        subject: `📎 ${clientEmail} uploaded: ${REQUIRED_LABELS[category] ?? category}`,
        html: uploadHtml,
        attachments: [attachment],
      }),
    ]);

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
