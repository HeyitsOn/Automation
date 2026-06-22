"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      // Redirect to portal
      window.location.href = "/portal";
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#F7F8FA] py-16">
      <div className="mx-auto max-w-md px-6">
        <div className="rounded-[32px] border border-[#E5E7EB] bg-white p-8 shadow-[0_18px_40px_rgba(17,24,39,0.05)]">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#B89B5E]">Client Portal</p>
            <h1 className="text-3xl font-semibold text-[#111827]">Welcome back</h1>
            <p className="text-sm leading-7 text-[#6B7280]">
              Sign in to manage your documents, track progress, and communicate with your advisor.
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-6">
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
              {loading ? "Signing in..." : "Log In"}
            </button>
          </form>

          <div className="mt-6 space-y-3 text-center text-sm text-[#6B7280]">
            <p>
              Don't have an account?{" "}
              <Link href="/auth/signup" className="font-semibold text-[#111827] hover:text-[#B89B5E]">
                Sign up
              </Link>
            </p>
            <p>
              <Link href="/auth/reset-password" className="text-[#B89B5E] hover:underline">
                Forgot your password?
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
