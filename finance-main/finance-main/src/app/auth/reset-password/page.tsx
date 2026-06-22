"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleReset = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setDone(true);
    }
  };

  if (done) {
    return (
      <main className="min-h-screen bg-[#F7F8FA] py-16">
        <div className="mx-auto max-w-md px-6">
          <div className="rounded-[32px] border border-[#E5E7EB] bg-white p-8 shadow-[0_18px_40px_rgba(17,24,39,0.05)] text-center">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <svg className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#B89B5E]">Email sent</p>
            <h1 className="mt-3 text-2xl font-semibold text-[#111827]">Check your inbox</h1>
            <p className="mt-4 text-sm leading-7 text-[#6B7280]">
              We sent a password reset link to <strong>{email}</strong>. Click the link to set a new password.
            </p>
            <Link
              href="/auth/login"
              className="mt-6 inline-block rounded-full bg-[#B89B5E] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#a3864d]"
            >
              Back to Log In
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F8FA] py-16">
      <div className="mx-auto max-w-md px-6">
        <div className="rounded-[32px] border border-[#E5E7EB] bg-white p-8 shadow-[0_18px_40px_rgba(17,24,39,0.05)]">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#B89B5E]">Client Portal</p>
            <h1 className="text-3xl font-semibold text-[#111827]">Reset password</h1>
            <p className="text-sm leading-7 text-[#6B7280]">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          <form onSubmit={handleReset} className="mt-8 space-y-5">
            <label className="block space-y-2 text-sm font-medium text-[#111827]">
              Email address
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 w-full rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA] px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#B89B5E]"
                required
              />
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#B89B5E] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#a3864d] disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#6B7280]">
            <Link href="/auth/login" className="font-semibold text-[#111827] hover:text-[#B89B5E]">
              Back to Log In
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
