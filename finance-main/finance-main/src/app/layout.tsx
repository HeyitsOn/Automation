import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import AssistantWidget from "@/components/AssistantWidget";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.theaccountingroom.org"),
  title: {
    default: "The Accounting Room | Tax & Accounting Services South Africa",
    template: "%s | The Accounting Room",
  },
  description:
    "Professional tax returns, bookkeeping, payroll and CIPC services in South Africa. Personal tax from R1 665, VAT returns from R288. Book a consultation online.",
  keywords: [
    "tax returns South Africa", "accounting services", "bookkeeping", "SARS tax",
    "IT12 tax return", "IT14 company tax", "payroll South Africa", "VAT return",
    "CIPC registration", "provisional tax", "tax advisor", "accounting room",
  ],
  authors: [{ name: "The Accounting Room" }],
  openGraph: {
    title: "The Accounting Room | Tax & Accounting Services South Africa",
    description:
      "Professional tax returns, bookkeeping, payroll and CIPC services in South Africa. Personal tax from R1 665. Book a consultation online.",
    url: "https://www.theaccountingroom.org",
    siteName: "The Accounting Room",
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Accounting Room | Tax & Accounting Services South Africa",
    description:
      "Professional tax returns, bookkeeping, payroll and CIPC services in South Africa.",
  },
  alternates: {
    canonical: "https://www.theaccountingroom.org",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "AccountingService",
  name: "The Accounting Room",
  description:
    "Professional tax returns, bookkeeping, payroll and CIPC registration services in South Africa.",
  url: "https://www.theaccountingroom.org",
  telephone: "+27609980062",
  areaServed: "South Africa",
  priceRange: "R288 – R2 500",
  address: {
    "@type": "PostalAddress",
    addressCountry: "ZA",
  },
  sameAs: ["https://www.theaccountingroom.org"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full font-sans" style={{ background: "#F5F2EC", color: "#1a1a1a" }} suppressHydrationWarning>
        <SiteHeader />
        {children}
        <SiteFooter />
        <AssistantWidget />
      </body>
    </html>
  );
}
