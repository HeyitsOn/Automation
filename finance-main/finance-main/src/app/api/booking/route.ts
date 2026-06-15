import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, date, time, slotId } = body ?? {};

    if (!email || !date || !time) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // ── Conflict check (blocking) ─────────────────────────────────────────
    try {
      const { supabaseAdmin } = await import("@/lib/supabase-admin");

      const { data: existing } = await supabaseAdmin
        .from("bookings")
        .select("id")
        .eq("date", date)
        .eq("time", time)
        .maybeSingle();

      if (existing) {
        return NextResponse.json(
          { error: "This time slot has just been taken. Please choose a different time." },
          { status: 409 }
        );
      }

      // ── Save booking ────────────────────────────────────────────────────
      await supabaseAdmin
        .from("bookings")
        .insert([{ email, date, time, created_at: new Date().toISOString() }]);

      if (slotId) {
        await supabaseAdmin
          .from("availability")
          .update({ is_booked: true })
          .eq("id", slotId);
      }
    } catch (dbErr) {
      console.error("[booking] DB error (non-fatal):", dbErr);
    }

    // ── Emails ────────────────────────────────────────────────────────────
    const resend = new Resend(process.env.RESEND_API_KEY);

    const bookingHtml = `
      <h2>New Consultation Booking</h2>
      <p><strong>Client Email:</strong> ${email}</p>
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Time:</strong> ${time}</p>
    `;

    await Promise.all([
      resend.emails.send({
        from: "The Accounting Room <onboarding@resend.dev>",
        to: "snethembasibiya@icloud.com",
        subject: `New consultation booking from ${email}`,
        html: bookingHtml,
      }),
      resend.emails.send({
        from: "The Accounting Room <onboarding@resend.dev>",
        to: "silekuonika02@gmail.com",
        subject: `New consultation booking from ${email}`,
        html: bookingHtml,
      }),
      resend.emails.send({
        from: "The Accounting Room <onboarding@resend.dev>",
        to: email,
        subject: "Your consultation is confirmed — The Accounting Room",
        html: `
          <h2>Booking Confirmed</h2>
          <p>Hi, your consultation has been booked for <strong>${date}</strong> at <strong>${time}</strong>.</p>
          <p>Your advisor will be in touch shortly to confirm the details.</p>
          <p>— The Accounting Room Team</p>
        `,
      }),
    ]);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("[booking] error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
