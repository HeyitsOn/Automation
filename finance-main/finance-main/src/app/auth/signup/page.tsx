"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      // Redirect to portal or show success
      window.location.href = "/portal";
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#F7F8FA] py-16">
      <div className="mx-auto max-w-md px-6">
        <div className="rounded-[32px] border border-[#E5E7EB] bg-white p-8 shadow-[0_18px_40px_rgba(17,24,39,0.05)]">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#B89B5E]">Sign Up</p>
            <h1 className="text-3xl font-semibold text-[#111827]">Create your TaxFlow account</h1>
            <p className="text-sm leading-7 text-[#6B7280]">
              Get started with secure document management and financial workflow tracking.
            </p>
          </div>

          <form onSubmit={handleSignup} className="mt-8 space-y-6">
            <label className="space-y-2 text-sm text-[#111827]">
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA] px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#B89B5E]"
                required
              />
            </label>
            <label className="space-y-2 text-sm text-[#111827]">
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA] px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#B89B5E]"
                required
              />
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#B89B5E] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#a3864d] disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#6B7280]">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-semibold text-[#111827] hover:text-[#B89B5E]">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
