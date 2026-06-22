"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import AuthWrapper from "@/components/AuthWrapper";

const REQUIRED_DOCS = [
  { id: "id_document", label: "ID Document / Passport", description: "SA ID book, smart card or passport — clear copy both sides" },
  { id: "irp5", label: "IRP5 / IT3(a)", description: "Tax certificate from your employer for the current tax year" },
  { id: "bank_statements", label: "Bank Statements", description: "Last 3 months from all bank accounts" },
  { id: "payslips", label: "Payslips", description: "Last 3 months of payslips" },
  { id: "medical_aid", label: "Medical Aid Certificate", description: "Annual tax certificate from your medical aid provider" },
  { id: "ra_certificate", label: "Retirement Annuity (RA)", description: "RA or pension fund certificate — if applicable" },
];

const portalSections = [
  { id: "dashboard", label: "Dashboard" },
  { id: "requirements", label: "Required Documents" },
  { id: "files", label: "My Files" },
  { id: "messages", label: "Messages" },
  { id: "progress", label: "Progress" },
] as const;

type DocRow = {
  id: string;
  file_name: string;
  category: string;
  status: string;
  created_at: string;
};

type MessageRow = {
  id: string;
  sender: string;
  content: string;
  created_at: string;
};

export default function PortalPage() {
  const [section, setSection] = useState<typeof portalSections[number]["id"]>("dashboard");
  const [user, setUser] = useState<any>(null);
  const [files, setFiles] = useState<DocRow[]>([]);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [uploadCategory, setUploadCategory] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false); // used by onDragOver handlers
  const [newMessage, setNewMessage] = useState("");
  const [messageSending, setMessageSending] = useState(false);
  const [notified, setNotified] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  const fetchFiles = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("documents")
      .select("id, file_name, category, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setFiles(data || []);
  }, [user]);

  const fetchMessages = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("messages")
      .select("id, sender, content, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    setMessages(data || []);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchFiles();
    if (section === "messages") fetchMessages();
  }, [user, section, fetchFiles, fetchMessages]);

  const uploadedCategories = new Set(files.map(f => f.category));
  const completedCount = REQUIRED_DOCS.filter(d => uploadedCategories.has(d.id)).length;
  const allComplete = completedCount === REQUIRED_DOCS.length;

  const notifyComplete = async (userEmail: string) => {
    if (notified) return;
    await fetch("/api/notify-documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientEmail: userEmail }),
    });
    setNotified(true);
  };

  const uploadFile = async (file: File, category: string) => {
    if (!user) return;
    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);
      formData.append("userId", user.id);
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Upload failed");
      }
      await fetchFiles();

      // Check if all required docs are now uploaded
      const updatedCategories = new Set([...Array.from(uploadedCategories), category]);
      const nowComplete = REQUIRED_DOCS.every(d => updatedCategories.has(d.id));
      if (nowComplete) await notifyComplete(user.email);

    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadLoading(false);
      setUploadCategory(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && uploadCategory) uploadFile(file, uploadCategory);
  };

  const handleDrop = (e: React.DragEvent, category: string) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file, category);
  };

  const triggerUpload = (docId: string) => {
    setUploadCategory(docId);
    setTimeout(() => fileInputRef.current?.click(), 50);
  };

  const handleSendMessage = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    setMessageSending(true);
    try {
      const { error } = await supabase.from("messages").insert([{
        user_id: user.id,
        sender: "You",
        content: newMessage.trim(),
        created_at: new Date().toISOString(),
      }]);
      if (error) throw new Error(error.message);
      setNewMessage("");
      await fetchMessages();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setMessageSending(false);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-ZA", { month: "short", day: "numeric" });


  return (
    <AuthWrapper>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.xlsx,.xls,.jpg,.jpeg,.png,.zip"
        className="hidden"
        onChange={handleFileInput}
      />
      <main className="min-h-screen bg-[#F7F8FA] py-6 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">

          {/* Header */}
          <div className="mb-6 rounded-[28px] border border-[#E5E7EB] bg-white p-5 shadow-[0_18px_50px_rgba(17,24,39,0.05)] sm:mb-8 sm:rounded-[32px] sm:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#B89B5E]">Client Portal</p>
                <h1 className="mt-3 text-xl font-semibold text-[#111827] sm:text-3xl">Manage your documents securely.</h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-[#6B7280]">
                  Upload your required documents, track your submission progress, and communicate with your advisor — all in one place.
                </p>
              </div>
              {/* Progress pill */}
              <div className="flex flex-col items-start gap-2 md:items-end">
                <div className={`rounded-full px-4 py-2 text-sm font-semibold ${allComplete ? "bg-green-100 text-green-700" : "bg-[#FDF9F2] text-[#B89B5E]"}`}>
                  {allComplete ? "✓ All documents submitted" : `${completedCount} / ${REQUIRED_DOCS.length} documents submitted`}
                </div>
                <button
                  onClick={() => setSection("messages")}
                  className="rounded-full border border-[#E5E7EB] bg-white px-5 py-2 text-sm font-semibold text-[#111827] transition hover:bg-[#F3F4F6]"
                >
                  Message Advisor
                </button>
              </div>
            </div>
          </div>

          {/* Mobile tabs */}
          <div className="mb-4 overflow-x-auto lg:hidden">
            <div className="flex min-w-max gap-2 rounded-2xl border border-[#E5E7EB] bg-white p-2">
              {portalSections.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSection(item.id)}
                  className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition ${
                    section === item.id ? "bg-[#B89B5E] text-white shadow-sm" : "text-[#6B7280] hover:bg-[#F3F4F6]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
            {/* Desktop sidebar */}
            <aside className="hidden space-y-4 rounded-[28px] border border-[#E5E7EB] bg-white p-5 lg:block" style={{ alignSelf: "start" }}>
              <div className="space-y-1 rounded-3xl bg-[#F7F8FA] p-4">
                <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#6B7280]">Workspace</p>
                {portalSections.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSection(item.id)}
                    className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                      section === item.id
                        ? "bg-white text-[#111827] shadow-[0_8px_20px_rgba(17,24,39,0.06)]"
                        : "text-[#6B7280] hover:bg-[#F3F4F6]"
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.id === "requirements" && (
                      <span className="ml-2 rounded-full bg-[#B89B5E] px-2 py-0.5 text-[10px] font-bold text-white">
                        {completedCount}/{REQUIRED_DOCS.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </aside>

            <section className="space-y-6">

              {/* ── Dashboard ── */}
              {section === "dashboard" && (
                <>
                  <div className="grid gap-6 xl:grid-cols-3">
                    {[
                      { label: "Documents Submitted", value: String(files.length) },
                      { label: "Required Remaining", value: String(REQUIRED_DOCS.length - completedCount) },
                      { label: "Completed", value: String(files.filter(f => f.status === "completed").length) },
                    ].map((item) => (
                      <div key={item.label} className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-[0_20px_40px_rgba(17,24,39,0.04)]">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6B7280]">{item.label}</p>
                        <p className="mt-4 text-3xl font-semibold text-[#111827]">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Quick checklist preview */}
                  <div className="rounded-[28px] border border-[#E5E7EB] bg-white p-6">
                    <div className="mb-5 flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-[#111827]">Required Documents</h2>
                      <button onClick={() => setSection("requirements")} className="text-sm font-semibold text-[#B89B5E] hover:underline">View all →</button>
                    </div>
                    <div className="space-y-3">
                      {REQUIRED_DOCS.map((doc) => {
                        const uploaded = uploadedCategories.has(doc.id);
                        return (
                          <div key={doc.id} className={`flex items-center justify-between rounded-2xl border p-4 ${uploaded ? "border-green-200 bg-green-50" : "border-[#E5E7EB] bg-[#F7F8FA]"}`}>
                            <div className="flex items-center gap-3">
                              <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${uploaded ? "bg-green-500 text-white" : "bg-[#E5E7EB] text-[#6B7280]"}`}>
                                {uploaded ? "✓" : "·"}
                              </div>
                              <span className="text-sm font-medium text-[#111827]">{doc.label}</span>
                            </div>
                            {!uploaded && (
                              <button
                                onClick={() => { setSection("requirements"); }}
                                className="rounded-full bg-[#B89B5E] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#a3864d]"
                              >
                                Upload
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {allComplete && (
                      <div className="mt-5 rounded-2xl bg-green-50 border border-green-200 p-4 text-center">
                        <p className="text-sm font-semibold text-green-700">All documents submitted — your advisor has been notified.</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* ── Required Documents ── */}
              {section === "requirements" && (
                <div className="space-y-4">
                  <div className="rounded-[28px] border border-[#E5E7EB] bg-white p-6">
                    <h2 className="text-lg font-semibold text-[#111827]">Required Documents</h2>
                    <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                      Upload each document below. Your advisor will be notified automatically once all are submitted.
                    </p>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#F3F4F6]">
                      <div
                        className="h-full rounded-full bg-[#B89B5E] transition-all duration-500"
                        style={{ width: `${Math.round((completedCount / REQUIRED_DOCS.length) * 100)}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-[#6B7280]">{completedCount} of {REQUIRED_DOCS.length} submitted</p>
                  </div>

                  {REQUIRED_DOCS.map((doc) => {
                    const uploaded = uploadedCategories.has(doc.id);
                    const docFiles = files.filter(f => f.category === doc.id);
                    return (
                      <div
                        key={doc.id}
                        className={`rounded-[24px] border p-5 ${uploaded ? "border-green-200 bg-green-50" : "border-[#E5E7EB] bg-white"}`}
                        onDrop={(e) => { if (!uploaded) handleDrop(e, doc.id); }}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${uploaded ? "bg-green-500 text-white" : "bg-[#F3F4F6] text-[#6B7280]"}`}>
                              {uploaded ? "✓" : "·"}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#111827]">{doc.label}</p>
                              <p className="mt-1 text-xs leading-5 text-[#6B7280]">{doc.description}</p>
                              {docFiles.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {docFiles.map(f => (
                                    <p key={f.id} className="text-xs text-green-600">📎 {f.file_name} — uploaded {formatDate(f.created_at)}</p>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="shrink-0">
                            {uploaded ? (
                              <button
                                onClick={() => triggerUpload(doc.id)}
                                className="rounded-full border border-green-300 px-3 py-1.5 text-xs font-semibold text-green-700 transition hover:bg-green-100"
                              >
                                Replace
                              </button>
                            ) : (
                              <button
                                disabled={uploadLoading && uploadCategory === doc.id}
                                onClick={() => triggerUpload(doc.id)}
                                className="rounded-full bg-[#B89B5E] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#a3864d] disabled:opacity-50"
                              >
                                {uploadLoading && uploadCategory === doc.id ? "Uploading..." : "Upload"}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {allComplete && (
                    <div className="rounded-[24px] bg-green-50 border border-green-200 p-6 text-center">
                      <p className="text-base font-semibold text-green-700">All documents submitted!</p>
                      <p className="mt-1 text-sm text-green-600">Your advisor has been notified and will begin reviewing your files shortly.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ── My Files ── */}
              {section === "files" && (
                <div className="rounded-[28px] border border-[#E5E7EB] bg-white p-6">
                  <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-[#111827]">My Files</h2>
                      <p className="mt-2 text-sm text-[#6B7280]">All your uploaded documents and their review status.</p>
                    </div>
                    <span className="rounded-full bg-[#F7F8FA] px-3 py-1 text-xs font-semibold text-[#6B7280]">{files.length} items</span>
                  </div>
                  {files.length === 0 ? (
                    <p className="py-8 text-center text-sm text-[#6B7280]">No documents uploaded yet.</p>
                  ) : (
                    <div className="overflow-x-auto rounded-[24px] border border-[#E5E7EB]">
                      <table className="min-w-full text-left text-sm">
                        <thead className="bg-[#F7F8FA] text-[#6B7280]">
                          <tr>
                            <th className="px-4 py-4">File name</th>
                            <th className="px-4 py-4">Document type</th>
                            <th className="px-4 py-4">Status</th>
                            <th className="px-4 py-4">Uploaded</th>
                          </tr>
                        </thead>
                        <tbody>
                          {files.map((file) => {
                            const req = REQUIRED_DOCS.find(d => d.id === file.category);
                            return (
                              <tr key={file.id} className="border-t border-[#E5E7EB]">
                                <td className="px-4 py-4 text-[#111827]">{file.file_name}</td>
                                <td className="px-4 py-4 text-[#6B7280]">{req?.label || file.category}</td>
                                <td className="px-4 py-4">
                                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                                    file.status === "completed" ? "bg-green-100 text-green-700" :
                                    file.status === "in_review" ? "bg-blue-100 text-blue-700" :
                                    "bg-[#F7F8FA] text-[#6B7280]"
                                  }`}>
                                    {file.status === "in_review" ? "In Review" : file.status === "completed" ? "Completed" : "Received"}
                                  </span>
                                </td>
                                <td className="px-4 py-4 text-[#6B7280]">{formatDate(file.created_at)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ── Messages ── */}
              {section === "messages" && (
                <div className="rounded-[28px] border border-[#E5E7EB] bg-white p-6">
                  <h2 className="text-lg font-semibold text-[#111827]">Messages</h2>
                  <p className="mt-2 text-sm text-[#6B7280]">Direct communication with your finance advisor.</p>
                  <div className="mt-6 space-y-4">
                    {messages.length === 0 ? (
                      <p className="py-8 text-center text-sm text-[#6B7280]">No messages yet. Send one below.</p>
                    ) : (
                      messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`rounded-3xl border p-5 ${
                            msg.sender === "You"
                              ? "ml-8 border-[#B89B5E] bg-[#FDF9F2]"
                              : "mr-8 border-[#E5E7EB] bg-[#F7F8FA]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <p className="font-semibold text-[#111827]">{msg.sender}</p>
                            <span className="text-xs text-[#6B7280]">
                              {new Date(msg.created_at).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" })}
                            </span>
                          </div>
                          <p className="mt-3 text-sm leading-6 text-[#6B7280]">{msg.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <form onSubmit={handleSendMessage} className="mt-6 flex gap-3">
                    <input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Write a message to your advisor..."
                      className="min-w-0 flex-1 rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA] px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#B89B5E]"
                    />
                    <button
                      type="submit"
                      disabled={messageSending || !newMessage.trim()}
                      className="rounded-full bg-[#B89B5E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#a3864d] disabled:opacity-50"
                    >
                      {messageSending ? "Sending..." : "Send"}
                    </button>
                  </form>
                </div>
              )}

              {/* ── Progress ── */}
              {section === "progress" && (
                <div className="rounded-[28px] border border-[#E5E7EB] bg-white p-6">
                  <h2 className="text-lg font-semibold text-[#111827]">Submission Progress</h2>
                  <p className="mt-2 text-sm text-[#6B7280]">Track which documents have been submitted and reviewed.</p>
                  <div className="mt-6 space-y-4">
                    {REQUIRED_DOCS.map((doc) => {
                      const uploaded = uploadedCategories.has(doc.id);
                      const docFile = files.find(f => f.category === doc.id);
                      return (
                        <div key={doc.id} className="flex items-center gap-4">
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                            docFile?.status === "completed" ? "bg-green-500 text-white" :
                            uploaded ? "bg-[#B89B5E] text-white" :
                            "bg-[#F3F4F6] text-[#9CA3AF]"
                          }`}>
                            {docFile?.status === "completed" ? "✓" : uploaded ? "↑" : "·"}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-[#111827]">{doc.label}</p>
                              <span className={`text-xs font-semibold ${
                                docFile?.status === "completed" ? "text-green-600" :
                                uploaded ? "text-[#B89B5E]" :
                                "text-[#9CA3AF]"
                              }`}>
                                {docFile?.status === "completed" ? "Completed" : uploaded ? "Submitted" : "Pending"}
                              </span>
                            </div>
                            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#F3F4F6]">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  docFile?.status === "completed" ? "bg-green-500" :
                                  uploaded ? "bg-[#B89B5E]" : "bg-transparent"
                                }`}
                                style={{ width: docFile?.status === "completed" ? "100%" : uploaded ? "60%" : "0%" }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {!allComplete && (
                    <button
                      onClick={() => setSection("requirements")}
                      className="mt-6 rounded-full bg-[#B89B5E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#a3864d]"
                    >
                      Upload missing documents →
                    </button>
                  )}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </AuthWrapper>
  );
}
