"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const ADMIN_EMAILS = [
  "snethembasibiya@icloud.com",
  "info@theaccountingroom.org",
  "sinethemba@theaccountingroom.org",
];

const sections = [
  { id: "documents", label: "Documents" },
  { id: "bookings", label: "Bookings" },
  { id: "contacts", label: "Contacts" },
  { id: "messages", label: "Messages" },
  { id: "availability", label: "Availability" },
] as const;

type Doc = { id: string; user_id: string; file_name: string; file_path: string; category: string; category_label: string; client_email: string; client_name: string; status: string; created_at: string };
type Booking = { id: string; email: string; date: string; time: string; created_at: string };
type Contact = { id: string; name: string; email: string; message: string; created_at: string };
type Message = { id: string; user_id: string; sender: string; content: string; created_at: string };
type AvailSlot = { id: string; date: string; time: string; is_booked: boolean };

export default function AdminPage() {
  const [section, setSection] = useState<typeof sections[number]["id"]>("documents");
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replySending, setReplySending] = useState(false);
  const [availSlots, setAvailSlots] = useState<AvailSlot[]>([]);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [addingSlot, setAddingSlot] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: { session } } = await supabase.auth.getSession();
      if (!user || !ADMIN_EMAILS.includes(user.email || "")) {
        router.push("/");
        return;
      }
      setToken(session?.access_token || null);
      setLoading(false);
    };
    init();
  }, [router]);

  const authHeader = (token: string) => ({ Authorization: `Bearer ${token}` });

  const fetchDocuments = useCallback(async () => {
    if (!token) return;
    const res = await fetch("/api/admin/documents", { headers: authHeader(token) });
    const data = await res.json();
    setDocuments(Array.isArray(data) ? data : []);
  }, [token]);

  const fetchBookings = useCallback(async () => {
    if (!token) return;
    const res = await fetch("/api/admin/bookings", { headers: authHeader(token) });
    const data = await res.json();
    setBookings(Array.isArray(data) ? data : []);
  }, [token]);

  const fetchContacts = useCallback(async () => {
    if (!token) return;
    const res = await fetch("/api/admin/contacts", { headers: authHeader(token) });
    const data = await res.json();
    setContacts(Array.isArray(data) ? data : []);
  }, [token]);

  const fetchMessages = useCallback(async () => {
    if (!token) return;
    const res = await fetch("/api/admin/messages", { headers: authHeader(token) });
    const data = await res.json();
    setMessages(Array.isArray(data) ? data : []);
  }, [token]);

  const fetchAvailability = useCallback(async () => {
    if (!token) return;
    const res = await fetch("/api/admin/availability", { headers: authHeader(token) });
    const data = await res.json();
    setAvailSlots(Array.isArray(data) ? data : []);
  }, [token]);

  useEffect(() => {
    if (!token) return;
    if (section === "documents") fetchDocuments();
    if (section === "bookings") fetchBookings();
    if (section === "contacts") fetchContacts();
    if (section === "messages") fetchMessages();
    if (section === "availability") fetchAvailability();
  }, [token, section, fetchDocuments, fetchBookings, fetchContacts, fetchMessages, fetchAvailability]);

  const addSlot = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newDate || !newTime || !token) return;
    setAddingSlot(true);
    await fetch("/api/admin/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader(token) },
      body: JSON.stringify({ date: newDate, time: newTime }),
    });
    setNewDate("");
    setNewTime("");
    setAddingSlot(false);
    fetchAvailability();
  };

  const deleteSlot = async (id: string) => {
    if (!token) return;
    await fetch("/api/admin/availability", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", ...authHeader(token) },
      body: JSON.stringify({ id }),
    });
    fetchAvailability();
  };

  const downloadFile = async (filePath: string, fileName: string) => {
    if (!token) return;
    const res = await fetch("/api/admin/download", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader(token) },
      body: JSON.stringify({ filePath }),
    });
    const { url } = await res.json();
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
  };

  const updateStatus = async (id: string, status: string) => {
    if (!token) return;
    await fetch("/api/admin/documents", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeader(token) },
      body: JSON.stringify({ id, status }),
    });
    fetchDocuments();
  };

  const sendReply = async (e: React.SyntheticEvent<HTMLFormElement>, userId: string) => {
    e.preventDefault();
    if (!replyContent.trim() || !token) return;
    setReplySending(true);
    try {
      await fetch("/api/admin/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader(token) },
        body: JSON.stringify({ userId, content: replyContent }),
      });
      setReplyContent("");
      fetchMessages();
    } finally {
      setReplySending(false);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-ZA", { month: "short", day: "numeric", year: "numeric" });

  const uniqueUserIds = [...new Set(messages.map((m) => m.user_id))];
  const userMessages = selectedUserId ? messages.filter((m) => m.user_id === selectedUserId) : [];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F8FA]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#B89B5E] border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F8FA] py-6 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-6 rounded-[28px] border border-[#E5E7EB] bg-white p-5 shadow-[0_18px_50px_rgba(17,24,39,0.05)] sm:mb-8 sm:rounded-[32px] sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#B89B5E]">Admin</p>
          <h1 className="mt-3 text-xl font-semibold text-[#111827] sm:text-3xl">Admin Dashboard</h1>
          <p className="mt-3 text-sm leading-7 text-[#6B7280]">
            Manage client documents, bookings, and communications.
          </p>
        </div>

        {/* Mobile tab bar */}
        <div className="mb-4 overflow-x-auto lg:hidden">
          <div className="flex min-w-max gap-2 rounded-2xl border border-[#E5E7EB] bg-white p-2">
            {sections.map((item) => (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition ${
                  section === item.id
                    ? "bg-[#B89B5E] text-white shadow-sm"
                    : "text-[#6B7280] hover:bg-[#F3F4F6]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          {/* Desktop sidebar */}
          <aside className="hidden rounded-[28px] border border-[#E5E7EB] bg-white p-5 lg:block">
            <div className="space-y-2 rounded-3xl bg-[#F7F8FA] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#6B7280]">Sections</p>
              {sections.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSection(item.id)}
                  className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                    section === item.id
                      ? "bg-white text-[#111827] shadow-[0_8px_20px_rgba(17,24,39,0.06)]"
                      : "text-[#6B7280] hover:bg-[#F3F4F6]"
                  }`}
                >
                  <span>{item.label}</span>
                  <span className="text-xs text-[#B89B5E]">›</span>
                </button>
              ))}
            </div>
          </aside>

          <section className="space-y-6">
            {section === "documents" && (
              <div className="rounded-[28px] border border-[#E5E7EB] bg-white p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-[#111827]">All Documents</h2>
                    <p className="mt-1 text-sm text-[#6B7280]">Review and update document status for all clients.</p>
                  </div>
                  <span className="rounded-full bg-[#F7F8FA] px-3 py-1 text-xs font-semibold text-[#6B7280]">
                    {documents.length} total
                  </span>
                </div>
                {documents.length === 0 ? (
                  <p className="py-8 text-center text-sm text-[#6B7280]">No documents uploaded yet.</p>
                ) : (
                  <div className="overflow-x-auto rounded-[24px] border border-[#E5E7EB]">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-[#F7F8FA] text-[#6B7280]">
                        <tr>
                          <th className="px-4 py-4">Client</th>
                          <th className="px-4 py-4">Document type</th>
                          <th className="px-4 py-4">File</th>
                          <th className="px-4 py-4">Date</th>
                          <th className="px-4 py-4">Status</th>
                          <th className="px-4 py-4">Download</th>
                        </tr>
                      </thead>
                      <tbody>
                        {documents.map((doc) => (
                          <tr key={doc.id} className="border-t border-[#E5E7EB]">
                            <td className="px-4 py-4">
                              <p className="font-medium text-[#111827]">{doc.client_name || doc.client_email}</p>
                              {doc.client_name && <p className="text-xs text-[#6B7280]">{doc.client_email}</p>}
                            </td>
                            <td className="px-4 py-4 text-[#6B7280]">{doc.category_label || doc.category}</td>
                            <td className="px-4 py-4 text-[#111827]">{doc.file_name}</td>
                            <td className="px-4 py-4 text-[#6B7280]">{formatDate(doc.created_at)}</td>
                            <td className="px-4 py-4">
                              <select
                                value={doc.status}
                                onChange={(e) => updateStatus(doc.id, e.target.value)}
                                className="rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] px-3 py-1.5 text-xs font-medium text-[#111827] outline-none transition focus:border-[#B89B5E]"
                              >
                                <option value="uploaded">Uploaded</option>
                                <option value="received">Received</option>
                                <option value="in_review">In Review</option>
                                <option value="completed">Completed</option>
                              </select>
                            </td>
                            <td className="px-4 py-4">
                              <button
                                onClick={() => downloadFile(doc.file_path, doc.file_name)}
                                className="rounded-xl bg-[#B89B5E] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#a3864d]"
                              >
                                Download
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {section === "bookings" && (
              <div className="rounded-[28px] border border-[#E5E7EB] bg-white p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-[#111827]">All Bookings</h2>
                    <p className="mt-1 text-sm text-[#6B7280]">Consultation requests from clients.</p>
                  </div>
                  <span className="rounded-full bg-[#F7F8FA] px-3 py-1 text-xs font-semibold text-[#6B7280]">
                    {bookings.length} total
                  </span>
                </div>
                {bookings.length === 0 ? (
                  <p className="py-8 text-center text-sm text-[#6B7280]">No bookings yet.</p>
                ) : (
                  <div className="overflow-x-auto rounded-[24px] border border-[#E5E7EB]">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-[#F7F8FA] text-[#6B7280]">
                        <tr>
                          <th className="px-4 py-4">Email</th>
                          <th className="px-4 py-4">Date</th>
                          <th className="px-4 py-4">Time</th>
                          <th className="px-4 py-4">Submitted</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((b) => (
                          <tr key={b.id} className="border-t border-[#E5E7EB]">
                            <td className="px-4 py-4 text-[#111827]">{b.email}</td>
                            <td className="px-4 py-4 text-[#6B7280]">{b.date}</td>
                            <td className="px-4 py-4 text-[#6B7280]">{b.time}</td>
                            <td className="px-4 py-4 text-[#6B7280]">{formatDate(b.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {section === "contacts" && (
              <div className="rounded-[28px] border border-[#E5E7EB] bg-white p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-[#111827]">Contact Submissions</h2>
                    <p className="mt-1 text-sm text-[#6B7280]">Messages sent through the contact form.</p>
                  </div>
                  <span className="rounded-full bg-[#F7F8FA] px-3 py-1 text-xs font-semibold text-[#6B7280]">
                    {contacts.length} total
                  </span>
                </div>
                {contacts.length === 0 ? (
                  <p className="py-8 text-center text-sm text-[#6B7280]">No contact submissions yet.</p>
                ) : (
                  <div className="space-y-4">
                    {contacts.map((c) => (
                      <div key={c.id} className="rounded-3xl border border-[#E5E7EB] bg-[#F7F8FA] p-5">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-semibold text-[#111827]">{c.name}</p>
                            <p className="text-sm text-[#6B7280]">{c.email}</p>
                          </div>
                          <span className="text-xs text-[#6B7280]">{formatDate(c.created_at)}</span>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-[#6B7280]">{c.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {section === "messages" && (
              <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
                <div className="rounded-[28px] border border-[#E5E7EB] bg-white p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#6B7280]">Clients</p>
                  {uniqueUserIds.length === 0 ? (
                    <p className="text-sm text-[#6B7280]">No messages yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {uniqueUserIds.map((uid) => (
                        <button
                          key={uid}
                          onClick={() => setSelectedUserId(uid)}
                          className={`w-full rounded-2xl px-3 py-2 text-left text-sm transition ${
                            selectedUserId === uid
                              ? "bg-[#B89B5E] text-white"
                              : "text-[#6B7280] hover:bg-[#F3F4F6]"
                          }`}
                        >
                          Client {uid.slice(0, 8)}...
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-[28px] border border-[#E5E7EB] bg-white p-6">
                  {!selectedUserId ? (
                    <p className="py-8 text-center text-sm text-[#6B7280]">Select a client to view messages.</p>
                  ) : (
                    <>
                      <h2 className="mb-4 text-lg font-semibold text-[#111827]">Conversation</h2>
                      <div className="space-y-4">
                        {userMessages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`rounded-3xl border p-4 ${
                              msg.sender === "Advisor"
                                ? "ml-8 border-[#B89B5E] bg-[#FDF9F2]"
                                : "mr-8 border-[#E5E7EB] bg-[#F7F8FA]"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <p className="font-semibold text-[#111827]">{msg.sender}</p>
                              <span className="text-xs text-[#6B7280]">
                                {new Date(msg.created_at).toLocaleString("en-ZA", {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                })}
                              </span>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-[#6B7280]">{msg.content}</p>
                          </div>
                        ))}
                      </div>
                      <form onSubmit={(e) => sendReply(e, selectedUserId)} className="mt-6 flex gap-3">
                        <input
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Reply to client..."
                          className="min-w-0 flex-1 rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA] px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#B89B5E]"
                        />
                        <button
                          type="submit"
                          disabled={replySending || !replyContent.trim()}
                          className="rounded-full bg-[#B89B5E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#a3864d] disabled:opacity-50"
                        >
                          {replySending ? "Sending..." : "Reply"}
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </div>
            )}
            {section === "availability" && (
              <div className="space-y-6">
                <div className="rounded-[28px] border border-[#E5E7EB] bg-white p-6">
                  <h2 className="text-lg font-semibold text-[#111827]">Add Available Slot</h2>
                  <p className="mt-1 text-sm text-[#6B7280]">Set dates and times clients can book consultations.</p>
                  <form onSubmit={addSlot} className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      required
                      className="w-full rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA] px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#B89B5E] sm:w-auto"
                    />
                    <input
                      type="time"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      required
                      className="w-full rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA] px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#B89B5E] sm:w-auto"
                    />
                    <button
                      type="submit"
                      disabled={addingSlot}
                      className="rounded-full bg-[#B89B5E] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#a3864d] disabled:opacity-50"
                    >
                      {addingSlot ? "Adding..." : "Add Slot"}
                    </button>
                  </form>
                </div>

                <div className="rounded-[28px] border border-[#E5E7EB] bg-white p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-[#111827]">All Slots</h2>
                    <span className="rounded-full bg-[#F7F8FA] px-3 py-1 text-xs font-semibold text-[#6B7280]">
                      {availSlots.filter(s => !s.is_booked).length} available
                    </span>
                  </div>
                  {availSlots.length === 0 ? (
                    <p className="py-8 text-center text-sm text-[#6B7280]">No slots added yet.</p>
                  ) : (
                    <div className="overflow-x-auto rounded-[24px] border border-[#E5E7EB]">
                      <table className="min-w-full text-left text-sm">
                        <thead className="bg-[#F7F8FA] text-[#6B7280]">
                          <tr>
                            <th className="px-4 py-4">Date</th>
                            <th className="px-4 py-4">Time</th>
                            <th className="px-4 py-4">Status</th>
                            <th className="px-4 py-4">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {availSlots.map((slot) => (
                            <tr key={slot.id} className="border-t border-[#E5E7EB]">
                              <td className="px-4 py-4 text-[#111827]">
                                {new Date(slot.date + "T00:00:00").toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                              </td>
                              <td className="px-4 py-4 text-[#6B7280]">{slot.time}</td>
                              <td className="px-4 py-4">
                                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${slot.is_booked ? "bg-green-100 text-green-700" : "bg-[#F7F8FA] text-[#6B7280]"}`}>
                                  {slot.is_booked ? "Booked" : "Available"}
                                </span>
                              </td>
                              <td className="px-4 py-4">
                                {!slot.is_booked && (
                                  <button
                                    onClick={() => deleteSlot(slot.id)}
                                    className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                                  >
                                    Remove
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
