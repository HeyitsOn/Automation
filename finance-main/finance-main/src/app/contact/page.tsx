"use client";

import { useState } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send message");
      }

      setSuccess(true);
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F7F8FA] py-16">
      <div className="mx-auto max-w-3xl px-6">
        <div className="rounded-[32px] border border-[#E5E7EB] bg-white p-6 shadow-[0_18px_40px_rgba(17,24,39,0.05)] sm:p-10">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#B89B5E]">Contact</p>
            <h1 className="text-3xl font-semibold text-[#111827]">We are available to support your financial workflow.</h1>
            <p className="text-sm leading-7 text-[#6B7280]">
              Send a message and your advisor will follow up with the next steps for documents, tax planning, and portal navigation.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-[#111827]">
                Name
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="w-full rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA] px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#B89B5E]"
                />
              </label>
              <label className="space-y-2 text-sm text-[#111827]">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA] px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#B89B5E]"
                />
              </label>
            </div>
            <label className="space-y-2 text-sm text-[#111827]">
              Message
              <textarea
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us how we can help"
                required
                className="w-full rounded-3xl border border-[#E5E7EB] bg-[#F7F8FA] px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#B89B5E]"
              />
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">Message sent successfully! We'll be in touch soon.</p>}
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-[#B89B5E] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#a3864d] disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
