"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield, TrendingUp, Users, FileText, BarChart3, CheckCircle,
  Clock, CalendarDays, ChevronLeft, ChevronRight,
} from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

const portalFeatures = [
  { icon: Shield, title: "Secure file uploads", description: "Send documents safely with a minimal, trusted workflow." },
  { icon: TrendingUp, title: "Progress tracking", description: "See review stages and completion status at a glance." },
  { icon: Users, title: "Advisor support", description: "A finance professional reviews your documents and keeps you informed." },
];

const services = [
  { icon: FileText, title: "Financial Document Management", description: "Organise and track your tax and financial records in one secure place." },
  { icon: BarChart3, title: "Tax Preparation Support", description: "Receive expert guidance through each step of your tax workflow." },
  { icon: TrendingUp, title: "Income & Expense Structuring", description: "Categorise income and expenses for clear reporting and compliance." },
  { icon: CheckCircle, title: "Compliance Reporting", description: "Stay aligned with deadlines and documentation expectations." },
  { icon: Shield, title: "Ongoing Financial Assistance", description: "Access ongoing support for questions and portfolio review." },
];

const steps = [
  "Submit your documents",
  "We review and organise them",
  "Receive structured updates and reports",
];

const trust = [
  { title: "Secure client portal", body: "Encrypted access and controlled permissions for your financial documents." },
  { title: "Private financial handling", body: "Your records are managed with a privacy-first process and responsible review." },
  { title: "Structured workflow system", body: "A clear workflow that keeps every step visible and organised." },
];

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

// ─── Animation helpers ───────────────────────────────────────────────────────

const anim = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: "easeOut" as const },
});

const inView = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, delay, ease: "easeOut" as const },
});

type Slot = { id: string; date: string; time: string };

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Home() {
  // Booking state
  const [bookingEmail, setBookingEmail] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [customTime, setCustomTime] = useState("09:00");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState("");

  // Contact state
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState("");

  useEffect(() => {
    fetch("/api/availability")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setSlots(Array.isArray(data) ? data : []));
  }, []);

  // Booking helpers
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().split("T")[0];
  const availableDates = new Set(slots.map((s) => s.date));
  const slotsForDate = selectedDate ? slots.filter((s) => s.date === selectedDate) : [];

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const formatDate = (dateStr: string) =>
    new Date(dateStr + "T00:00:00").toLocaleDateString("en-ZA", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });

  const calendarDays: (number | null)[] = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const handleBook = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedDate || !bookingEmail) return;
    setBookingLoading(true);
    setBookingError("");

    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: bookingEmail,
          date: selectedSlot?.date ?? selectedDate,
          time: selectedSlot?.time ?? customTime,
          slotId: selectedSlot?.id ?? null,
        }),
      });

      if (!res.ok) {
        let message = "Booking failed. Please try again.";
        try {
          const data = await res.json();
          if (data?.error) message = data.error;
        } catch { /* empty or non-JSON body */ }

        // If slot was taken, clear selection so client picks again
        if (res.status === 409) {
          setSelectedSlot(null);
          setSelectedDate(null);
          // Refresh available slots
          fetch("/api/availability")
            .then((r) => (r.ok ? r.json() : []))
            .then((data) => setSlots(Array.isArray(data) ? data : []));
        }

        throw new Error(message);
      }

      setBookingSuccess(true);
      setSlots((prev) => prev.filter((s) => s.id !== selectedSlot?.id));
      setSelectedSlot(null);
      setSelectedDate(null);
      setBookingEmail("");
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleContact = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setContactLoading(true);
    setContactError("");
    setContactSuccess(false);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: contactName, email: contactEmail, message: contactMessage }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send message");
      }

      setContactSuccess(true);
      setContactName("");
      setContactEmail("");
      setContactMessage("");
    } catch (err) {
      setContactError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setContactLoading(false);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden" style={{ background: "#F5F2EC" }}>
      <div className="pointer-events-none absolute inset-0 opacity-20" style={{ background: "radial-gradient(ellipse 80% 60% at 60% 20%, #C9A96A22 0%, transparent 70%)" }} />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section id="hero" className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div className="flex flex-col gap-6">
            <motion.p {...anim(0)} className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: "#C9A96A" }}>
              Managed Finance Services
            </motion.p>
            <motion.h1 {...anim(0.1)} className="text-3xl font-bold leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl" style={{ color: "#1a1a1a" }}>
              Financial Management,{" "}
              <span style={{ color: "#C9A96A" }}>Made Simple</span>
            </motion.h1>
            <motion.p {...anim(0.2)} className="max-w-lg text-base leading-8" style={{ color: "#4a4a4a" }}>
              A personal finance service that helps you organise, track, and manage your financial documents with clarity and confidence.
            </motion.p>
            <motion.div {...anim(0.3)} className="flex flex-wrap gap-4">
              <a
                href="#booking"
                className="rounded-full px-7 py-3.5 text-sm font-semibold transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_30px_rgba(201,169,106,0.4)]"
                style={{ background: "#C9A96A", color: "#2d3318" }}
              >
                Book Consultation
              </a>
              <Link
                href="/portal"
                className="rounded-full border px-7 py-3.5 text-sm font-semibold transition-all duration-300 hover:scale-105"
                style={{ borderColor: "#C9A96A", background: "transparent", color: "#6B7A45" }}
              >
                Access Client Portal
              </Link>
            </motion.div>
          </div>

          <motion.div
            {...anim(0.2)}
            className="rounded-[28px] border p-5 sm:p-7"
            style={{ background: "rgba(107,122,69,0.07)", backdropFilter: "blur(20px)", borderColor: "rgba(248,246,241,0.12)", boxShadow: "0 24px 60px rgba(0,0,0,0.25), inset 0 1px 0 rgba(248,246,241,0.1)" }}
          >
            <p className="mb-6 text-xs font-semibold uppercase tracking-[0.28em]" style={{ color: "#C9A96A" }}>Client Portal Overview</p>
            <div className="space-y-4">
              {portalFeatures.map((item, i) => (
                <motion.div key={item.title} {...anim(0.3 + i * 0.1)} className="flex items-start gap-4 rounded-2xl p-4 transition-all duration-300 hover:scale-[1.02]" style={{ background: "rgba(107,122,69,0.06)", border: "1px solid rgba(107,122,69,0.15)" }}>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: "rgba(201,169,106,0.18)", border: "1px solid rgba(201,169,106,0.25)" }}>
                    <item.icon size={18} style={{ color: "#C9A96A" }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>{item.title}</p>
                    <p className="mt-1 text-sm leading-6" style={{ color: "#5a5a5a" }}>{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Services ─────────────────────────────────────────────────────── */}
      <section id="services" className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <motion.div {...inView(0)} className="mb-10 rounded-[32px] border border-[rgba(107,122,69,0.15)] p-6 sm:p-10" style={{ background: "rgba(107,122,69,0.05)" }}>
          <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: "#C9A96A" }}>Services</p>
          <h2 className="mt-4 text-2xl font-bold sm:text-3xl" style={{ color: "#1a1a1a" }}>Designed to keep your financial workflow clear and compliant.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7" style={{ color: "#5a5a5a" }}>
            Explore the managed finance services that help you stay organised, reduce uncertainty, and maintain confidence across tax and documents.
          </p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((item, i) => (
            <motion.div key={item.title} {...inView(i * 0.08)} className="rounded-[24px] p-6 transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]" style={{ background: "rgba(107,122,69,0.06)", backdropFilter: "blur(12px)", border: "1px solid rgba(107,122,69,0.12)" }}>
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: "rgba(201,169,106,0.15)", border: "1px solid rgba(201,169,106,0.2)" }}>
                <item.icon size={20} style={{ color: "#C9A96A" }} />
              </div>
              <p className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>{item.title}</p>
              <p className="mt-2 text-sm leading-7" style={{ color: "#5a5a5a" }}>{item.description}</p>
            </motion.div>
          ))}
        </div>

        {/* How it works */}
        <motion.div {...inView(0)} className="mt-16 rounded-[28px] p-6 sm:p-10" style={{ background: "rgba(107,122,69,0.05)", backdropFilter: "blur(16px)", border: "1px solid rgba(107,122,69,0.15)" }}>
          <p className="mb-8 text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: "#C9A96A" }}>How It Works</p>
          <div className="grid gap-6 sm:grid-cols-3">
            {steps.map((step, i) => (
              <motion.div key={step} {...inView(i * 0.1)} className="rounded-2xl p-6" style={{ background: "rgba(107,122,69,0.05)", border: "1px solid rgba(107,122,69,0.07)" }}>
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold" style={{ background: "rgba(201,169,106,0.2)", color: "#C9A96A" }}>
                  {i + 1}
                </div>
                <p className="text-sm font-semibold leading-6" style={{ color: "#1a1a1a" }}>{step}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trust */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {trust.map((item, i) => (
            <motion.div key={item.title} {...inView(i * 0.1)} className="rounded-[24px] p-6 transition-all duration-300 hover:scale-[1.02]" style={{ background: "rgba(107,122,69,0.05)", backdropFilter: "blur(10px)", border: "1px solid rgba(107,122,69,0.15)" }}>
              <p className="text-sm font-semibold" style={{ color: "#C9A96A" }}>{item.title}</p>
              <p className="mt-3 text-sm leading-7" style={{ color: "#5a5a5a" }}>{item.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section id="pricing" className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <motion.div {...inView(0)} className="mb-10 rounded-[32px] border border-[rgba(107,122,69,0.15)] p-6 sm:p-10" style={{ background: "rgba(107,122,69,0.05)" }}>
          <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: "#C9A96A" }}>Pricing</p>
          <h2 className="mt-4 text-2xl font-bold sm:text-3xl" style={{ color: "#1a1a1a" }}>Transparent fees for every service.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7" style={{ color: "#5a5a5a" }}>
            All prices are exclusive of VAT. Click Enquire to get started or ask a question about any service.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Personal Tax Returns */}
          <motion.div {...inView(0)} className="rounded-[28px] bg-white p-7 shadow-[0_18px_40px_rgba(17,24,39,0.05)]" style={{ border: "1px solid rgba(107,122,69,0.12)" }}>
            <h3 className="text-xl font-bold" style={{ color: "#1a1a1a" }}>Personal Tax Returns</h3>
            <p className="mt-1 text-sm leading-6" style={{ color: "#6B7280" }}>Your SARS return prepared, reviewed and lodged — with every legitimate deduction claimed.</p>
            <div className="mt-6 space-y-0">
              {[
                { label: "Standard IT12 (IRP5 only)", price: "R1 665" },
                { label: "IT12 (IRP5 + Rental income)", price: "R2 248" },
                { label: "Sole Proprietor IT12", price: "R2 831" },
                { label: "Catch-up standard return (per year)", price: "R1 665" },
                { label: "Catch-up extended return (per year)", price: "R2 248" },
                { label: "SARS audit / verification (per hour)", price: "R988" },
              ].map((item, i, arr) => (
                <div key={item.label} className={`flex items-center justify-between py-3 ${i < arr.length - 1 ? "border-b" : ""}`} style={{ borderColor: "rgba(107,122,69,0.1)" }}>
                  <span className="text-sm" style={{ color: "#374151" }}>{item.label}</span>
                  <span className="ml-4 shrink-0 text-sm font-bold" style={{ color: "#1a1a1a" }}>{item.price}</span>
                </div>
              ))}
            </div>
            <a href="#contact" className="mt-6 flex items-center gap-1 text-sm font-semibold transition hover:opacity-70" style={{ color: "#C9A96A" }}>
              Enquire <span>→</span>
            </a>
          </motion.div>

          {/* Business & Provisional Tax */}
          <motion.div {...inView(0.05)} className="rounded-[28px] bg-white p-7 shadow-[0_18px_40px_rgba(17,24,39,0.05)]" style={{ border: "1px solid rgba(107,122,69,0.12)" }}>
            <h3 className="text-xl font-bold" style={{ color: "#1a1a1a" }}>Business & Provisional Tax</h3>
            <p className="mt-1 text-sm leading-6" style={{ color: "#6B7280" }}>Year-end returns for companies, close corporations and trusts — plus provisional tax for sole traders.</p>
            <div className="mt-6 space-y-0">
              {[
                { label: "Provisional Tax — IRP6 (per period)", price: "R904" },
                { label: "Company / CC — IT14", price: "R1 915" },
                { label: "Trust — IT12TR", price: "R1 915" },
              ].map((item, i, arr) => (
                <div key={item.label} className={`flex items-center justify-between py-3 ${i < arr.length - 1 ? "border-b" : ""}`} style={{ borderColor: "rgba(107,122,69,0.1)" }}>
                  <span className="text-sm" style={{ color: "#374151" }}>{item.label}</span>
                  <span className="ml-4 shrink-0 text-sm font-bold" style={{ color: "#1a1a1a" }}>{item.price}</span>
                </div>
              ))}
            </div>
            <a href="#contact" className="mt-6 flex items-center gap-1 text-sm font-semibold transition hover:opacity-70" style={{ color: "#C9A96A" }}>
              Enquire <span>→</span>
            </a>
          </motion.div>

          {/* Monthly Books & Compliance */}
          <motion.div {...inView(0.1)} className="rounded-[28px] bg-white p-7 shadow-[0_18px_40px_rgba(17,24,39,0.05)]" style={{ border: "1px solid rgba(107,122,69,0.12)" }}>
            <h3 className="text-xl font-bold" style={{ color: "#1a1a1a" }}>Monthly Books & Compliance</h3>
            <p className="mt-1 text-sm leading-6" style={{ color: "#6B7280" }}>Bookkeeping, payroll and the monthly returns that go with running a business.</p>
            <div className="mt-6 space-y-0">
              {[
                { label: "VAT201 return (per return)", price: "R288" },
                { label: "EMP201 / PAYE return (per return)", price: "R288" },
                { label: "Bookkeeping data entry (per hour)", price: "R476" },
                { label: "Payroll — payslips (per employee / month)", price: "R77" },
              ].map((item, i, arr) => (
                <div key={item.label} className={`flex items-center justify-between py-3 ${i < arr.length - 1 ? "border-b" : ""}`} style={{ borderColor: "rgba(107,122,69,0.1)" }}>
                  <span className="text-sm" style={{ color: "#374151" }}>{item.label}</span>
                  <span className="ml-4 shrink-0 text-sm font-bold" style={{ color: "#1a1a1a" }}>{item.price}</span>
                </div>
              ))}
            </div>
            <a href="#contact" className="mt-6 flex items-center gap-1 text-sm font-semibold transition hover:opacity-70" style={{ color: "#C9A96A" }}>
              Enquire <span>→</span>
            </a>
          </motion.div>

          {/* Companies & CIPC */}
          <motion.div {...inView(0.15)} className="rounded-[28px] bg-white p-7 shadow-[0_18px_40px_rgba(17,24,39,0.05)]" style={{ border: "1px solid rgba(107,122,69,0.12)" }}>
            <h3 className="text-xl font-bold" style={{ color: "#1a1a1a" }}>Companies & CIPC</h3>
            <p className="mt-1 text-sm leading-6" style={{ color: "#6B7280" }}>From start-up to staying compliant year after year.</p>
            <div className="mt-6 space-y-0">
              {[
                { label: "Register a new Pty (Ltd)", price: "R2 350" },
                { label: "CIPC annual return", price: "R2 500" },
              ].map((item, i, arr) => (
                <div key={item.label} className={`flex items-center justify-between py-3 ${i < arr.length - 1 ? "border-b" : ""}`} style={{ borderColor: "rgba(107,122,69,0.1)" }}>
                  <span className="text-sm" style={{ color: "#374151" }}>{item.label}</span>
                  <span className="ml-4 shrink-0 text-sm font-bold" style={{ color: "#1a1a1a" }}>{item.price}</span>
                </div>
              ))}
            </div>
            <a href="#contact" className="mt-6 flex items-center gap-1 text-sm font-semibold transition hover:opacity-70" style={{ color: "#C9A96A" }}>
              Enquire <span>→</span>
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── Booking ──────────────────────────────────────────────────────── */}
      <section id="booking" className="py-12 sm:py-20" style={{ background: "linear-gradient(135deg, #4F5B35 0%, #6B7A45 50%, #3d4728 100%)" }}>
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <motion.div {...inView(0)} className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: "#C9A96A" }}>Booking</p>
            <h2 className="mt-3 text-2xl font-bold sm:text-4xl" style={{ color: "#F8F6F1" }}>Schedule your consultation</h2>
            <p className="mt-3 text-sm leading-7" style={{ color: "rgba(248,246,241,0.6)" }}>
              Choose from available slots below. Your advisor will confirm the details by email.
            </p>
          </motion.div>

          {bookingSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-[28px] p-8 sm:p-12 text-center"
              style={{ background: "rgba(248,246,241,0.07)", border: "1px solid rgba(201,169,106,0.25)", backdropFilter: "blur(16px)" }}
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: "rgba(201,169,106,0.2)" }}>
                <CalendarDays size={28} style={{ color: "#C9A96A" }} />
              </div>
              <h3 className="text-2xl font-bold" style={{ color: "#F8F6F1" }}>Booking Confirmed!</h3>
              <p className="mt-3 text-sm" style={{ color: "rgba(248,246,241,0.6)" }}>
                A confirmation email has been sent to you. Your advisor will be in touch shortly.
              </p>
              <button
                onClick={() => setBookingSuccess(false)}
                className="mt-8 rounded-full px-6 py-3 text-sm font-semibold transition hover:opacity-80"
                style={{ background: "#C9A96A", color: "#2d3318" }}
              >
                Book another
              </button>
            </motion.div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
              {/* Calendar */}
              <motion.div
                {...inView(0.1)}
                className="rounded-[28px] p-4"
                style={{ background: "rgba(248,246,241,0.07)", border: "1px solid rgba(248,246,241,0.1)", backdropFilter: "blur(16px)" }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <button onClick={prevMonth} className="rounded-lg p-1.5 transition hover:opacity-70" style={{ background: "rgba(248,246,241,0.08)", color: "#F8F6F1" }}>
                    <ChevronLeft size={15} />
                  </button>
                  <p className="text-xs font-semibold" style={{ color: "#F8F6F1" }}>
                    {currentMonth.toLocaleDateString("en-ZA", { month: "long", year: "numeric" })}
                  </p>
                  <button onClick={nextMonth} className="rounded-lg p-1.5 transition hover:opacity-70" style={{ background: "rgba(248,246,241,0.08)", color: "#F8F6F1" }}>
                    <ChevronRight size={15} />
                  </button>
                </div>

                <div className="mb-2 grid grid-cols-7 text-center">
                  {DAYS.map((d, i) => (
                    <p key={i} className="text-[10px] font-semibold" style={{ color: "rgba(248,246,241,0.4)" }}>{d}</p>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-0.5">
                  {calendarDays.map((day, i) => {
                    if (!day) return <div key={`empty-${i}`} />;
                    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const hasSlots = availableDates.has(dateStr);
                    const isSelected = selectedDate === dateStr;
                    const isPast = dateStr < today;
                    return (
                      <button
                        key={dateStr}
                        disabled={isPast}
                        onClick={() => { setSelectedDate(dateStr); setSelectedSlot(null); }}
                        className="aspect-square rounded-lg text-xs font-medium transition-all"
                        style={{
                          background: isSelected ? "#C9A96A" : hasSlots && !isPast ? "rgba(201,169,106,0.15)" : "transparent",
                          color: isSelected ? "#2d3318" : isPast ? "rgba(248,246,241,0.2)" : hasSlots ? "#C9A96A" : "rgba(248,246,241,0.65)",
                          border: hasSlots && !isPast && !isSelected ? "1px solid rgba(201,169,106,0.3)" : "1px solid transparent",
                          cursor: isPast ? "default" : "pointer",
                        }}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>

                <p className="mt-3 text-[10px]" style={{ color: "rgba(248,246,241,0.4)" }}>
                  Gold = pre-set slots. Any future date is selectable.
                </p>
              </motion.div>

              {/* Slot picker + form */}
              <div className="space-y-5">
                <motion.div
                  {...inView(0.2)}
                  className="rounded-[28px] p-6"
                  style={{ background: "rgba(248,246,241,0.07)", border: "1px solid rgba(248,246,241,0.1)", backdropFilter: "blur(16px)" }}
                >
                  <div className="mb-4 flex items-center gap-2">
                    <Clock size={16} style={{ color: "#C9A96A" }} />
                    <p className="text-sm font-semibold" style={{ color: "#F8F6F1" }}>
                      {selectedDate ? formatDate(selectedDate) : "Select a date"}
                    </p>
                  </div>

                  {!selectedDate ? (
                    <p className="text-sm" style={{ color: "rgba(248,246,241,0.4)" }}>Pick a date on the calendar.</p>
                  ) : slotsForDate.length === 0 ? (
                    <div className="space-y-2">
                      <p className="text-xs" style={{ color: "rgba(248,246,241,0.5)" }}>No pre-set slots — choose a time:</p>
                      <input
                        type="time"
                        value={customTime}
                        onChange={(e) => setCustomTime(e.target.value)}
                        className="w-full rounded-2xl px-4 py-3 text-sm outline-none"
                        style={{ background: "rgba(248,246,241,0.07)", border: "1px solid rgba(248,246,241,0.15)", color: "#F8F6F1", colorScheme: "dark" }}
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {slotsForDate.map((slot) => (
                        <button
                          key={slot.id}
                          onClick={() => setSelectedSlot(slot)}
                          className="w-full rounded-2xl px-4 py-3 text-left text-sm font-medium transition-all"
                          style={{
                            background: selectedSlot?.id === slot.id ? "#C9A96A" : "rgba(248,246,241,0.05)",
                            border: `1px solid ${selectedSlot?.id === slot.id ? "#C9A96A" : "rgba(248,246,241,0.1)"}`,
                            color: selectedSlot?.id === slot.id ? "#2d3318" : "#F8F6F1",
                          }}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>

                {selectedDate && (selectedSlot || slotsForDate.length === 0) && (
                  <motion.form
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleBook}
                    className="rounded-[28px] p-6 space-y-4"
                    style={{ background: "rgba(248,246,241,0.07)", border: "1px solid rgba(248,246,241,0.1)", backdropFilter: "blur(16px)" }}
                  >
                    <p className="text-sm font-semibold" style={{ color: "#F8F6F1" }}>Your email</p>
                    <input
                      type="email"
                      value={bookingEmail}
                      onChange={(e) => setBookingEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full rounded-2xl px-4 py-3 text-sm outline-none transition"
                      style={{ background: "rgba(248,246,241,0.07)", border: "1px solid rgba(248,246,241,0.12)", color: "#F8F6F1" }}
                    />
                    {bookingError && <p className="text-sm text-red-400">{bookingError}</p>}
                    <button
                      type="submit"
                      disabled={bookingLoading}
                      className="w-full rounded-full py-3 text-sm font-semibold transition hover:opacity-80 disabled:opacity-50"
                      style={{ background: "#C9A96A", color: "#2d3318" }}
                    >
                      {bookingLoading ? "Confirming..." : `Confirm — ${selectedSlot?.time ?? customTime}`}
                    </button>
                  </motion.form>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Contact ──────────────────────────────────────────────────────── */}
      <section id="contact" className="py-12 sm:py-20" style={{ background: "#F7F8FA" }}>
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <motion.div
            {...inView(0)}
            className="rounded-[32px] border border-[#E5E7EB] bg-white p-6 shadow-[0_18px_40px_rgba(17,24,39,0.05)] sm:p-10"
          >
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#B89B5E]">Contact</p>
              <h2 className="text-2xl font-semibold text-[#111827] sm:text-3xl">We are available to support your financial workflow.</h2>
              <p className="text-sm leading-7 text-[#6B7280]">
                Send a message and your advisor will follow up with the next steps for documents, tax planning, and portal navigation.
              </p>
            </div>

            <form onSubmit={handleContact} className="mt-10 space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-[#111827]">
                  Name
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Your name"
                    required
                    className="mt-1 block w-full rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA] px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#B89B5E]"
                  />
                </label>
                <label className="space-y-2 text-sm text-[#111827]">
                  Email
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="mt-1 block w-full rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA] px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#B89B5E]"
                  />
                </label>
              </div>
              <label className="block space-y-2 text-sm text-[#111827]">
                Message
                <textarea
                  rows={6}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Tell us how we can help"
                  required
                  className="mt-1 block w-full rounded-3xl border border-[#E5E7EB] bg-[#F7F8FA] px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#B89B5E]"
                />
              </label>
              {contactError && <p className="text-sm text-red-600">{contactError}</p>}
              {contactSuccess && <p className="text-sm text-green-600">Message sent successfully! We'll be in touch soon.</p>}
              <button
                type="submit"
                disabled={contactLoading}
                className="rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:opacity-80 disabled:opacity-50"
                style={{ background: "#B89B5E" }}
              >
                {contactLoading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
