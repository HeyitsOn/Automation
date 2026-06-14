"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Clock, CalendarDays } from "lucide-react";
import { motion } from "framer-motion";

type Slot = { id: string; date: string; time: string };

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

const anim = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: "easeOut" as const },
});

export default function BookingPage() {
  const [email, setEmail] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [customTime, setCustomTime] = useState("09:00");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/availability")
      .then((r) => r.json())
      .then((data) => setSlots(Array.isArray(data) ? data : []));
  }, []);

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

  const handleBook = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedDate || !email) return;
    setLoading(true);
    setError("");

    const bookingDate = selectedSlot?.date ?? selectedDate!;
    const bookingTime = selectedSlot?.time ?? customTime;

    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, date: bookingDate, time: bookingTime, slotId: selectedSlot?.id ?? null }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Booking failed");
      }

      setSuccess(true);
      setSlots((prev) => prev.filter((s) => s.id !== selectedSlot?.id));
      setSelectedSlot(null);
      setSelectedDate(null);
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const monthLabel = currentMonth.toLocaleDateString("en-ZA", { month: "long", year: "numeric" });

  const calendarDays: (number | null)[] = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <main className="min-h-screen py-16" style={{ background: "linear-gradient(135deg, #4F5B35 0%, #6B7A45 50%, #3d4728 100%)" }}>
      <div className="mx-auto max-w-5xl px-6">
        <motion.div {...anim(0)} className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: "#C9A96A" }}>Booking</p>
          <h1 className="mt-3 text-2xl font-bold sm:text-4xl" style={{ color: "#F8F6F1" }}>Schedule your consultation</h1>
          <p className="mt-3 text-sm leading-7" style={{ color: "rgba(248,246,241,0.6)" }}>
            Choose from available slots below. Your advisor will confirm the details by email.
          </p>
        </motion.div>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-[28px] p-12 text-center"
            style={{ background: "rgba(248,246,241,0.07)", border: "1px solid rgba(201,169,106,0.25)", backdropFilter: "blur(16px)" }}
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: "rgba(201,169,106,0.2)" }}>
              <CalendarDays size={28} style={{ color: "#C9A96A" }} />
            </div>
            <h2 className="text-2xl font-bold" style={{ color: "#F8F6F1" }}>Booking Confirmed!</h2>
            <p className="mt-3 text-sm" style={{ color: "rgba(248,246,241,0.6)" }}>
              A confirmation email has been sent to you. Your advisor will be in touch shortly.
            </p>
            <button
              onClick={() => setSuccess(false)}
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
              {...anim(0.1)}
              className="rounded-[28px] p-4"
              style={{ background: "rgba(248,246,241,0.07)", border: "1px solid rgba(248,246,241,0.1)", backdropFilter: "blur(16px)" }}
            >
              <div className="mb-4 flex items-center justify-between">
                <button onClick={prevMonth} className="rounded-lg p-1.5 transition hover:opacity-70" style={{ background: "rgba(248,246,241,0.08)", color: "#F8F6F1" }}>
                  <ChevronLeft size={15} />
                </button>
                <p className="text-xs font-semibold" style={{ color: "#F8F6F1" }}>{monthLabel}</p>
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
                        background: isSelected
                          ? "#C9A96A"
                          : hasSlots && !isPast
                          ? "rgba(201,169,106,0.15)"
                          : "transparent",
                        color: isSelected
                          ? "#2d3318"
                          : isPast
                          ? "rgba(248,246,241,0.2)"
                          : hasSlots
                          ? "#C9A96A"
                          : "rgba(248,246,241,0.65)",
                        border: hasSlots && !isPast && !isSelected
                          ? "1px solid rgba(201,169,106,0.3)"
                          : "1px solid transparent",
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
                {...anim(0.2)}
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
                      style={{
                        background: "rgba(248,246,241,0.07)",
                        border: "1px solid rgba(248,246,241,0.15)",
                        color: "#F8F6F1",
                        colorScheme: "dark",
                      }}
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full rounded-2xl px-4 py-3 text-sm outline-none transition"
                    style={{
                      background: "rgba(248,246,241,0.07)",
                      border: "1px solid rgba(248,246,241,0.12)",
                      color: "#F8F6F1",
                    }}
                  />
                  {error && <p className="text-sm text-red-400">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-full py-3 text-sm font-semibold transition hover:opacity-80 disabled:opacity-50"
                    style={{ background: "#C9A96A", color: "#2d3318" }}
                  >
                    {loading ? "Confirming..." : `Confirm — ${selectedSlot?.time ?? customTime}`}
                  </button>
                </motion.form>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
