import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  try {
    const { clientEmail } = await req.json();

    const resend = new Resend(process.env.RESEND_API_KEY);

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="margin:0;padding:0;background:#F5F2EC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;margin:0 auto;padding:24px 16px;">
          <tr>
            <td>
              <div style="background:#6B7A45;border-radius:16px 16px 0 0;padding:24px 28px;">
                <p style="margin:0;font-size:20px;font-weight:700;color:#fff;">All Documents Submitted</p>
                <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.7);">The Accounting Room — Client Portal</p>
              </div>
              <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 16px 16px;padding:24px 28px;">
                <p style="font-size:15px;color:#111827;line-height:1.6;">A client has uploaded all required documents and is ready for review.</p>
                <table style="width:100%;border-collapse:collapse;margin:20px 0;">
                  <tr style="background:#F7F8FA;">
                    <td style="padding:10px 14px;font-size:13px;font-weight:600;color:#6B7280;">Client email</td>
                    <td style="padding:10px 14px;font-size:13px;color:#111827;">${clientEmail ?? "Not provided"}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 14px;font-size:13px;font-weight:600;color:#6B7280;">Status</td>
                    <td style="padding:10px 14px;font-size:13px;color:#16a34a;font-weight:600;">All required documents submitted</td>
                  </tr>
                </table>
                <p style="font-size:13px;color:#6B7280;">Log in to the client portal to review and download the submitted documents.</p>
              </div>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    await Promise.all([
      resend.emails.send({
        from: "The Accounting Room <onboarding@resend.dev>",
        to: "snethembasibiya@icloud.com",
        subject: "Client documents ready for review — The Accounting Room",
        html,
      }),
      resend.emails.send({
        from: "The Accounting Room <onboarding@resend.dev>",
        to: "info@theaccountingroom.org",
        subject: "Client documents ready for review — The Accounting Room",
        html,
      }),
    ]);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
