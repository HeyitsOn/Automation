"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import AuthWrapper from "@/components/AuthWrapper";

const portalSections = [
  { id: "dashboard", label: "Dashboard" },
  { id: "upload", label: "Upload Documents" },
  { id: "files", label: "Files" },
  { id: "messages", label: "Messages" },
  { id: "progress", label: "Progress" },
  { id: "assistant", label: "AI Assistant" },
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
  const [uploadCategory, setUploadCategory] = useState("tax");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [messageSending, setMessageSending] = useState(false);
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
    if (section === "dashboard" || section === "files" || section === "progress") {
      fetchFiles();
    }
    if (section === "messages") {
      fetchMessages();
    }
  }, [user, section, fetchFiles, fetchMessages]);

  const uploadFile = async (file: File) => {
    if (!user) return;
    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", uploadCategory);
      formData.append("userId", user.id);
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Upload failed");
      }
      await fetchFiles();
      setSection("files");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
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

  const total = files.length;
  const inReview = files.filter(f => f.status === "in_review").length;
  const completed = files.filter(f => f.status === "completed").length;

  const progressSteps = [
    { label: "Uploaded", value: total > 0 ? 100 : 0 },
    { label: "In Review", value: total > 0 ? Math.round((inReview / total) * 100) : 0 },
    { label: "Completed", value: total > 0 ? Math.round((completed / total) * 100) : 0 },
  ];

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-ZA", { month: "short", day: "numeric" });

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

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
          <div className="mb-6 rounded-[28px] border border-[#E5E7EB] bg-white p-5 shadow-[0_18px_50px_rgba(17,24,39,0.05)] sm:mb-8 sm:rounded-[32px] sm:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#B89B5E]">Client Portal</p>
                <h1 className="mt-3 text-xl font-semibold text-[#111827] sm:text-3xl">Manage documents, progress, and communication in one place.</h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-[#6B7280]">
                  Access your secure finance workspace, track review status, and get direct guidance from your advisor.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setSection("assistant")}
                  className="rounded-full bg-[#B89B5E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#a3864d]"
                >
                  Ask Assistant
                </button>
                <button
                  onClick={() => setSection("messages")}
                  className="rounded-full border border-[#E5E7EB] bg-white px-5 py-3 text-sm font-semibold text-[#111827] transition hover:bg-[#F3F4F6]"
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>

          {/* Mobile tab bar */}
          <div className="mb-4 overflow-x-auto lg:hidden">
            <div className="flex min-w-max gap-2 rounded-2xl border border-[#E5E7EB] bg-white p-2">
              {portalSections.map((item) => (
                <button
                  key={item.id}
                  type="button"
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
            <aside className="hidden space-y-4 rounded-[28px] border border-[#E5E7EB] bg-white p-5 lg:block">
              <div className="space-y-4 rounded-3xl bg-[#F7F8FA] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[#6B7280]">Workspace</p>
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
                    <span className="text-xs text-[#B89B5E]">›</span>
                  </button>
                ))}
              </div>
            </aside>

            <section className="space-y-6">
              {section === "dashboard" && (
                <>
                  <div className="grid gap-6 xl:grid-cols-3">
                    {[
                      { label: "Documents Received", value: String(total) },
                      { label: "In Review", value: String(inReview) },
                      { label: "Completed", value: String(completed) },
                    ].map((item) => (
                      <div key={item.label} className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-[0_20px_40px_rgba(17,24,39,0.04)]">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6B7280]">{item.label}</p>
                        <p className="mt-4 text-3xl font-semibold text-[#111827]">{item.value}</p>
                        <p className="mt-2 text-sm leading-6 text-[#6B7280]">Your advisor is processing the next items in the workflow.</p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-[28px] border border-[#E5E7EB] bg-white p-6">
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-semibold text-[#111827]">Recent Activity</h2>
                        <p className="mt-2 text-sm text-[#6B7280]">Latest updates from your document workflow.</p>
                      </div>
                      <span className="rounded-full bg-[#F7F8FA] px-3 py-1 text-xs font-semibold text-[#6B7280]">Live</span>
                    </div>
                    <div className="space-y-4">
                      {files.length > 0 ? (
                        files.slice(0, 5).map((file) => (
                          <div key={file.id} className="rounded-3xl border border-[#E5E7EB] bg-[#F7F8FA] p-4">
                            <div className="flex items-center justify-between gap-4">
                              <p className="font-semibold text-[#111827]">Document received</p>
                              <span className="text-sm text-[#6B7280]">{timeAgo(file.created_at)}</span>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                              {file.file_name} — {file.category} ({file.status})
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="py-4 text-center text-sm text-[#6B7280]">No activity yet. Upload documents to get started.</p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {section === "upload" && (
                <div className="space-y-6">
                  <div className="rounded-[28px] border border-[#E5E7EB] bg-white p-6">
                    <h2 className="text-lg font-semibold text-[#111827]">Upload Documents</h2>
                    <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                      Drag and drop files or select documents from your device. We will classify them as tax, income, or expense records.
                    </p>
                    <div className="mt-5">
                      <label className="block text-sm font-medium text-[#111827]">
                        Category
                        <select
                          value={uploadCategory}
                          onChange={(e) => setUploadCategory(e.target.value)}
                          className="mt-2 w-full rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA] px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#B89B5E]"
                        >
                          <option value="tax">Tax</option>
                          <option value="income">Income</option>
                          <option value="expense">Expenses</option>
                        </select>
                      </label>
                    </div>
                    <div
                      onDrop={handleDrop}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      className={`mt-6 rounded-3xl border border-dashed p-8 text-center transition ${
                        dragOver ? "border-[#B89B5E] bg-[#FDF9F2]" : "border-[#E5E7EB] bg-[#F7F8FA]"
                      }`}
                    >
                      {uploadLoading ? (
                        <div className="flex flex-col items-center gap-3">
                          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#B89B5E] border-t-transparent" />
                          <p className="text-sm text-[#6B7280]">Uploading...</p>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm font-semibold text-[#111827]">Drop files here to upload</p>
                          <p className="mt-2 text-sm text-[#6B7280]">Accepted formats: PDF, XLSX, JPG, PNG, ZIP</p>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-5 rounded-full bg-[#B89B5E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#a3864d]"
                          >
                            Browse documents
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    {[
                      { label: "Tax", detail: "Returns, forms, filings" },
                      { label: "Income", detail: "Statements, payroll, invoices" },
                      { label: "Expenses", detail: "Receipts, bills, statements" },
                    ].map((item) => (
                      <div key={item.label} className="rounded-3xl border border-[#E5E7EB] bg-white p-5">
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6B7280]">{item.label}</p>
                        <p className="mt-3 text-sm leading-6 text-[#6B7280]">{item.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {section === "files" && (
                <div className="rounded-[28px] border border-[#E5E7EB] bg-white p-6">
                  <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-[#111827]">Files</h2>
                      <p className="mt-2 text-sm text-[#6B7280]">Review your uploaded financial documents and track their status.</p>
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
                            <th className="px-4 py-4">Category</th>
                            <th className="px-4 py-4">Status</th>
                            <th className="px-4 py-4">Date uploaded</th>
                          </tr>
                        </thead>
                        <tbody>
                          {files.map((file) => (
                            <tr key={file.id} className="border-t border-[#E5E7EB]">
                              <td className="px-4 py-4 text-[#111827]">{file.file_name}</td>
                              <td className="px-4 py-4 text-[#6B7280]">{file.category}</td>
                              <td className="px-4 py-4 text-[#111827]">{file.status}</td>
                              <td className="px-4 py-4 text-[#6B7280]">{formatDate(file.created_at)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

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

              {section === "progress" && (
                <div className="rounded-[28px] border border-[#E5E7EB] bg-white p-6">
                  <h2 className="text-lg font-semibold text-[#111827]">Workflow Progress</h2>
                  <p className="mt-2 text-sm text-[#6B7280]">Your documents move through a clear, simple workflow.</p>
                  <div className="mt-6 space-y-5">
                    {progressSteps.map((step) => (
                      <div key={step.label}>
                        <div className="flex items-center justify-between text-sm font-medium text-[#111827]">
                          <span>{step.label}</span>
                          <span className="text-[#6B7280]">{step.value}%</span>
                        </div>
                        <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#F3F4F6]">
                          <div
                            className="h-full rounded-full bg-[#B89B5E] transition-all duration-500"
                            style={{ width: `${step.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  {total === 0 && (
                    <p className="mt-6 text-sm text-[#6B7280]">Upload documents to see your workflow progress.</p>
                  )}
                </div>
              )}

              {section === "assistant" && (
                <div className="rounded-[28px] border border-[#E5E7EB] bg-white p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-[#111827]">AI Assistant</h2>
                      <p className="mt-2 text-sm text-[#6B7280]">A financial workflow guide built to support your portal experience.</p>
                    </div>
                    <span className="rounded-full bg-[#F7F8FA] px-3 py-1 text-xs font-semibold text-[#6B7280]">Structured responses</span>
                  </div>
                  <div className="mt-6 space-y-4">
                    {[
                      {
                        q: "What do I upload?",
                        a: "Share recent tax forms, pay statements, invoices, receipts, and any financial records relevant to your current filing period.",
                      },
                      {
                        q: "How does review work?",
                        a: "Once uploaded, your advisor reviews each document and updates the status from Received → In Review → Completed. Check the Progress tab for real-time status.",
                      },
                      {
                        q: "Help me with documents",
                        a: "I can help identify missing categories, confirm acceptable file types (PDF, XLSX, JPG, PNG, ZIP), and explain what your advisor needs.",
                      },
                    ].map((item) => (
                      <div key={item.q} className="rounded-3xl bg-[#F7F8FA] p-5">
                        <p className="text-sm font-semibold text-[#111827]">{item.q}</p>
                        <p className="mt-2 text-sm leading-6 text-[#6B7280]">{item.a}</p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-6 text-sm text-[#6B7280]">
                    For direct help,{" "}
                    <button
                      onClick={() => setSection("messages")}
                      className="font-semibold text-[#B89B5E] hover:underline"
                    >
                      send a message
                    </button>{" "}
                    to reach your advisor.
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </AuthWrapper>
  );
}
