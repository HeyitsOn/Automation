import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

type ChatMessage = { role: "user" | "assistant"; message: string };

function formatMessagesAsHtml(messages: ChatMessage[]): string {
  const rows = messages
    .map((m) => {
      const isUser = m.role === "user";
      const bg = isUser ? "#EEF2E8" : "#F9F7F3";
      const label = isUser ? "Client" : "Assistant";
      const labelColor = isUser ? "#6B7A45" : "#C9A96A";

      return `
        <tr>
          <td style="padding:10px 16px 10px ${isUser ? "40px" : "16px"};">
            <div style="background:${bg};border-radius:12px;padding:12px 16px;max-width:90%;">
              <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:${labelColor};text-transform:uppercase;letter-spacing:0.05em;">${label}</p>
              <p style="margin:0;font-size:14px;color:#1a1a1a;line-height:1.6;">${m.message.replace(/\n/g, "<br>")}</p>
            </div>
          </td>
        </tr>`;
    })
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;background:#F5F2EC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;padding:24px 0;">
        <tr>
          <td style="padding:0 16px 24px;">
            <div style="background:#6B7A45;border-radius:16px 16px 0 0;padding:20px 24px;">
              <p style="margin:0;font-size:18px;font-weight:700;color:#fff;">Chat Transcript</p>
              <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.65);">Sent from The Accounting Room website widget</p>
            </div>
            <div style="background:#fff;border:1px solid rgba(107,122,69,0.15);border-top:none;border-radius:0 0 16px 16px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                ${rows}
              </table>
              <div style="padding:16px 24px;border-top:1px solid rgba(107,122,69,0.1);">
                <p style="margin:0;font-size:12px;color:#9ca3af;">Reply to this email or contact the client directly via WhatsApp to follow up.</p>
              </div>
            </div>
          </td>
        </tr>
      </table>
    </body>
    </html>`;
}

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const body = await req.json();
    const messages: ChatMessage[] = body?.messages;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    const { error } = await resend.emails.send({
      from: "The Accounting Room <onboarding@resend.dev>",
      to: ["snethembasibiya@icloud.com", "silekuonika02@gmail.com"],
      subject: "New chat enquiry — The Accounting Room",
      html: formatMessagesAsHtml(messages),
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
