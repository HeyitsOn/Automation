"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Mail } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ChatMessage = { role: "user" | "assistant"; message: string };

// ─── Auto-reply logic ─────────────────────────────────────────────────────────

function getAutoReply(input: string): string {
  const t = input.toLowerCase();

  if (/hello|hi\b|hey|good morning|good afternoon|good day/.test(t))
    return "Hello! Welcome to The Accounting Room. How can I help you today? Feel free to ask about our tax, bookkeeping, or compliance services.";

  if (/price|cost|fee|rate|how much|charge/.test(t))
    return "Our fees are transparent and fixed. Personal tax returns start at R1 665, company returns at R1 915, VAT/PAYE submissions at R288 each, and payslips at R77 per employee. Check our Pricing section for the full list — or send this chat to us and we'll quote you.";

  if (/it12|personal tax|sars return|individual tax/.test(t))
    return "We prepare and lodge all personal SARS returns — Standard IT12 (IRP5), IT12 with rental income, and Sole Proprietor IT12. We also handle catch-up returns for prior years. Would you like to book a consultation?";

  if (/provisional|irp6/.test(t))
    return "Provisional tax (IRP6) submissions are R904 per period. We cover both the August and February periods for individuals and entities.";

  if (/company|pty|cipc|register|cc\b|it14/.test(t))
    return "We register new Pty (Ltd) companies for R2 350 and file annual CIPC returns for R2 500. Company/CC income tax (IT14) returns are R1 915. Want us to get in touch?";

  if (/trust|it12tr/.test(t))
    return "We handle Trust income tax returns (IT12TR) at R1 915. We can assist with trust compliance year after year.";

  if (/vat|vat201/.test(t))
    return "VAT201 returns are R288 per return. We manage the full submission on eFiling on your behalf.";

  if (/emp201|paye|payroll/.test(t))
    return "EMP201/PAYE returns are R288 per submission. Payroll and payslip processing is R77 per employee per month.";

  if (/bookkeeping|data entry|books/.test(t))
    return "Bookkeeping data entry is charged at R476 per hour. We can handle your monthly books as an ongoing service.";

  if (/audit|verification/.test(t))
    return "SARS audit and verification support is billed at R988 per hour. We represent you throughout the process.";

  if (/book|appointment|consult|meeting|schedule/.test(t))
    return "You can book a consultation directly on our website using the Booking section. Pick a date and time and we'll confirm by email.";

  if (/document|upload|file|submit|portal/.test(t))
    return "Documents are submitted securely through our Client Portal. Log in to upload tax forms, payslips, bank statements, and any supporting records.";

  if (/contact|email|call|reach|phone|whatsapp/.test(t))
    return "You can reach us via the Contact form on our website, or use the WhatsApp and Email buttons below to send this conversation directly to our team.";

  return "Thanks for reaching out! For personalised assistance, use the WhatsApp or Email buttons below — our team will get back to you within 1 business day.";
}

// ─── Formatters ───────────────────────────────────────────────────────────────

function formatForWhatsApp(messages: ChatMessage[]): string {
  return (
    "*Chat with The Accounting Room*\n\n" +
    messages
      .map((m) => `${m.role === "user" ? "*You*" : "*Assistant*"}: ${m.message}`)
      .join("\n\n")
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    role: "assistant",
    message:
      "Hi! I'm here to help with questions about our accounting, tax, and compliance services. What can I help you with today?",
  },
];

export default function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom whenever messages change or panel opens
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  const send = () => {
    const text = input.trim();
    if (!text || typing) return;

    const userMsg: ChatMessage = { role: "user", message: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", message: getAutoReply(text) },
      ]);
      setTyping(false);
    }, 800);
  };

  const openWhatsApp = () => {
    const text = formatForWhatsApp(messages);
    window.open(
      `https://wa.me/27609980062?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  const sendEmail = async () => {
    if (emailStatus !== "idle") return;
    setEmailStatus("sending");
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });
      if (!res.ok) throw new Error("failed");
      setEmailStatus("sent");
    } catch {
      setEmailStatus("error");
    } finally {
      setTimeout(() => setEmailStatus("idle"), 3500);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {/* ── Chat panel ─────────────────────────────────────────────────── */}
      <div
        className="flex flex-col overflow-hidden rounded-2xl w-[calc(100vw-2rem)] sm:w-[380px] transition-all duration-300"
        style={{
          height: open ? "520px" : "0px",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          background: "#fff",
          border: "1px solid rgba(107,122,69,0.18)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.14), 0 4px 16px rgba(0,0,0,0.06)",
        }}
      >
        {/* Header */}
        <div
          className="flex shrink-0 items-center justify-between px-4 py-3"
          style={{ background: "#6B7A45" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold"
              style={{ background: "rgba(201,169,106,0.35)", color: "#C9A96A" }}
            >
              A
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-tight">
                The Accounting Room
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.65)" }}>
                  Typically replies within 1 hour
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="rounded-lg p-1.5 text-white transition hover:bg-white/10"
            aria-label="Close chat"
          >
            <X size={16} />
          </button>
        </div>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto space-y-3 px-4 py-4"
          style={{ background: "#F5F2EC" }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className="max-w-[82%] px-4 py-2.5 text-sm leading-[1.65] shadow-sm"
                style={{
                  background: msg.role === "user" ? "#6B7A45" : "#fff",
                  color: msg.role === "user" ? "#fff" : "#1a1a1a",
                  borderRadius:
                    msg.role === "user"
                      ? "18px 18px 4px 18px"
                      : "18px 18px 18px 4px",
                  border:
                    msg.role === "assistant"
                      ? "1px solid rgba(107,122,69,0.1)"
                      : "none",
                }}
              >
                {msg.message}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {typing && (
            <div className="flex justify-start">
              <div
                className="flex items-center gap-1 px-4 py-3 shadow-sm"
                style={{
                  background: "#fff",
                  borderRadius: "18px 18px 18px 4px",
                  border: "1px solid rgba(107,122,69,0.1)",
                }}
              >
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-2 w-2 rounded-full animate-bounce"
                    style={{
                      background: "#C9A96A",
                      animationDelay: `${i * 0.15}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Action buttons */}
        <div
          className="shrink-0 flex gap-2 px-4 py-2 border-t"
          style={{ borderColor: "rgba(107,122,69,0.1)", background: "#fafaf9" }}
        >
          <button
            onClick={openWhatsApp}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold text-white transition hover:opacity-85"
            style={{ background: "#25D366" }}
          >
            {/* WhatsApp SVG icon */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            WhatsApp
          </button>
          <button
            onClick={sendEmail}
            disabled={emailStatus !== "idle"}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition hover:opacity-85 disabled:opacity-60"
            style={{ background: "#C9A96A", color: "#2d3318" }}
          >
            <Mail size={13} />
            {emailStatus === "sending"
              ? "Sending..."
              : emailStatus === "sent"
              ? "Sent!"
              : emailStatus === "error"
              ? "Try again"
              : "Send to Email"}
          </button>
        </div>

        {/* Input row */}
        <div
          className="shrink-0 flex gap-2 border-t bg-white px-4 py-3"
          style={{ borderColor: "rgba(107,122,69,0.1)" }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type a message…"
            className="flex-1 rounded-xl border px-3 py-2 text-sm outline-none transition focus:border-[#6B7A45]"
            style={{ borderColor: "rgba(107,122,69,0.2)", color: "#1a1a1a" }}
          />
          <button
            onClick={send}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition hover:opacity-80"
            style={{ background: "#6B7A45", color: "#fff" }}
            aria-label="Send"
          >
            <Send size={15} />
          </button>
        </div>
      </div>

      {/* ── Toggle button ───────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2.5 rounded-full px-5 py-3 text-sm font-semibold shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
        style={{ background: "#6B7A45", color: "#fff" }}
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? <X size={17} /> : <MessageCircle size={17} />}
        {open ? "Close" : "Chat with us"}
      </button>
    </div>
  );
}
