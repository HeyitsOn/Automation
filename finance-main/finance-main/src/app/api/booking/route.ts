import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const { email, date, time, slotId } = await req.json();

    if (!email || !date || !time) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("bookings")
      .insert([{ email, date, time, created_at: new Date().toISOString() }]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (slotId) {
      await supabase.from("availability").update({ is_booked: true }).eq("id", slotId);
    }

    await resend.emails.send({
      from: "The Accounting Room <onboarding@resend.dev>",
      to: ["snethembasibiya@icloud.com", "silekuonika02@gmail.com"],
      subject: `New consultation booking from ${email}`,
      html: `
        <h2>New Consultation Booking</h2>
        <p><strong>Client Email:</strong> ${email}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
      `,
    });

    await resend.emails.send({
      from: "The Accounting Room <onboarding@resend.dev>",
      to: email,
      subject: "Your The Accounting Room consultation is confirmed",
      html: `
        <h2>Booking Confirmed</h2>
        <p>Hi, your consultation has been booked for <strong>${date}</strong> at <strong>${time}</strong>.</p>
        <p>Your advisor will be in touch shortly to confirm the details.</p>
        <p>— The The Accounting Room Team</p>
      `,
    });

    return NextResponse.json(
      { success: true, message: "Booking confirmed" },
      { status: 200 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
