import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import AssistantWidget from "@/components/AssistantWidget";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Accounting Room",
  description:
    "Managed financial services and a secure client portal for organised tax workflows and reporting.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full font-sans" style={{ background: "#F5F2EC", color: "#1a1a1a" }} suppressHydrationWarning>
        <SiteHeader />
        {children}
        <AssistantWidget />
      </body>
    </html>
  );
}
