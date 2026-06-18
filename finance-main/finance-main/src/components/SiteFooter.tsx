import Link from "next/link";

export function SiteFooter() {
  return (
    <footer style={{ background: "#2d3318", color: "#F8F6F1" }}>
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold"
                style={{ background: "rgba(201,169,106,0.2)", border: "1px solid rgba(201,169,106,0.4)", color: "#C9A96A" }}
              >
                A
              </div>
              <span className="text-sm font-semibold" style={{ color: "#F8F6F1" }}>The Accounting Room</span>
            </div>
            <p className="text-sm leading-7" style={{ color: "rgba(248,246,241,0.5)" }}>
              Professional tax, bookkeeping and compliance services for individuals and businesses in South Africa.
            </p>
          </div>

          {/* Services */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: "#C9A96A" }}>Services</p>
            <ul className="space-y-3 text-sm" style={{ color: "rgba(248,246,241,0.6)" }}>
              <li><Link href="/services" className="transition hover:text-white">Personal Tax Returns</Link></li>
              <li><Link href="/services" className="transition hover:text-white">Business &amp; Provisional Tax</Link></li>
              <li><Link href="/services" className="transition hover:text-white">Monthly Bookkeeping</Link></li>
              <li><Link href="/services" className="transition hover:text-white">Payroll &amp; PAYE</Link></li>
              <li><Link href="/services" className="transition hover:text-white">CIPC Registration</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: "#C9A96A" }}>Quick Links</p>
            <ul className="space-y-3 text-sm" style={{ color: "rgba(248,246,241,0.6)" }}>
              <li><Link href="/#pricing" className="transition hover:text-white">Pricing</Link></li>
              <li><Link href="/#booking" className="transition hover:text-white">Book a Consultation</Link></li>
              <li><Link href="/#contact" className="transition hover:text-white">Contact Us</Link></li>
              <li><Link href="/portal" className="transition hover:text-white">Client Portal</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: "#C9A96A" }}>Contact</p>
            <ul className="space-y-3 text-sm" style={{ color: "rgba(248,246,241,0.6)" }}>
              <li>
                <a href="tel:+27609980062" className="transition hover:text-white">+27 60 998 0062</a>
              </li>
              <li>
                <a href="mailto:info@theaccountingroom.org" className="transition hover:text-white">info@theaccountingroom.org</a>
              </li>
              <li className="pt-1">
                <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "rgba(248,246,241,0.35)" }}>Business Hours</p>
                <p>Mon – Fri: 08:00 – 17:00</p>
                <p style={{ color: "rgba(248,246,241,0.4)" }}>Sat – Sun: Closed</p>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 text-xs sm:flex-row"
          style={{ borderColor: "rgba(248,246,241,0.08)", color: "rgba(248,246,241,0.35)" }}
        >
          <p>© {new Date().getFullYear()} The Accounting Room. All rights reserved.</p>
          <p>All prices exclude VAT.</p>
        </div>
      </div>
    </footer>
  );
}
