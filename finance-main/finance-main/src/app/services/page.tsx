import Link from "next/link";

const services = [
  { title: "Financial Document Management", description: "Organise and track your tax and financial records in one secure place." },
  { title: "Tax Preparation Support", description: "Receive expert guidance through each step of your tax workflow." },
  { title: "Income & Expense Structuring", description: "Categorise income and expenses for clear reporting and compliance." },
  { title: "Compliance Reporting", description: "Stay aligned with deadlines and documentation expectations." },
  { title: "Ongoing Financial Assistance", description: "Access ongoing support for questions and portfolio review." },
];

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-[#F7F8FA] py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-10 rounded-[32px] border border-[#E5E7EB] bg-white p-6 shadow-[0_18px_40px_rgba(17,24,39,0.05)] sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#B89B5E]">Services</p>
          <h1 className="mt-4 text-3xl font-semibold text-[#111827]">Designed to keep your financial workflow clear and compliant.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#6B7280]">
            Explore the managed finance services that help you stay organised, reduce uncertainty, and maintain confidence across tax and documents.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div key={service.title} className="rounded-[28px] border border-[#E5E7EB] bg-white p-6 transition hover:shadow-[0_20px_40px_rgba(17,24,39,0.06)]">
              <div className="mb-4 h-12 w-12 rounded-2xl bg-[#F7F8FA] text-center leading-12 text-xl font-semibold text-[#B89B5E]">
                •
              </div>
              <h2 className="text-lg font-semibold text-[#111827]">{service.title}</h2>
              <p className="mt-3 text-sm leading-6 text-[#6B7280]">{service.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link href="/booking" className="rounded-full bg-[#B89B5E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#a3864d]">
            Book Consultation
          </Link>
          <Link href="/portal" className="rounded-full border border-[#E5E7EB] bg-white px-5 py-3 text-sm font-semibold text-[#111827] transition hover:bg-[#F3F4F6]">
            Access Client Portal
          </Link>
        </div>
      </div>
    </main>
  );
}
