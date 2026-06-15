import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, message } = body ?? {};

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // ── Database (non-blocking) ───────────────────────────────────────────
    try {
      const { supabaseAdmin } = await import("@/lib/supabase-admin");
      await supabaseAdmin
        .from("contact_submissions")
        .insert([{ name, email, message, created_at: new Date().toISOString() }]);
    } catch (dbErr) {
      console.error("[contact] DB error (non-fatal):", dbErr);
    }

    // ── Email ─────────────────────────────────────────────────────────────
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: "The Accounting Room <onboarding@resend.dev>",
      to: ["snethembasibiya@icloud.com", "silekuonika02@gmail.com"],
      subject: `New contact message from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("[contact] error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
