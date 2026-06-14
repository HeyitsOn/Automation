"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/#hero", label: "Home" },
  { href: "/#services", label: "Services" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#booking", label: "Booking" },
  { href: "/#contact", label: "Contact" },
  { href: "/portal", label: "Client Portal" },
];

export function SiteHeader() {
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(72);
  const headerRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const measure = () => {
      if (headerRef.current) setHeaderHeight(headerRef.current.offsetHeight);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const active = (href: string) => {
    if (href.startsWith("/#")) return false;
    return href === "/" ? pathname === "/" : pathname?.startsWith(href);
  };

  return (
    <>
      <header
        ref={headerRef}
        className="sticky top-0 z-50"
        style={{
          background: "rgba(245,242,236,0.97)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(107,122,69,0.15)",
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 text-sm font-bold uppercase tracking-[0.25em] transition-opacity hover:opacity-80"
            style={{ color: "#1a1a1a" }}
          >
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold"
              style={{ background: "rgba(201,169,106,0.2)", border: "1px solid rgba(201,169,106,0.3)", color: "#C9A96A" }}
            >
              A
            </span>
            The Accounting Room
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`rounded-xl px-4 py-2 text-sm transition-all ${
                  active(item.href)
                    ? "bg-[rgba(201,169,106,0.12)] font-semibold text-[#C9A96A]"
                    : "font-medium text-[#4a4a4a] hover:bg-[rgba(201,169,106,0.07)] hover:text-[#C9A96A]"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Desktop auth */}
          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <>
                <Link
                  href="/portal"
                  className="rounded-full px-5 py-2 text-sm font-semibold transition-all hover:opacity-80"
                  style={{ background: "#C9A96A", color: "#2d3318" }}
                >
                  Portal
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-full border px-5 py-2 text-sm font-semibold transition-all hover:opacity-80"
                  style={{ borderColor: "rgba(107,122,69,0.3)", color: "#4a4a4a" }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="rounded-full border px-5 py-2 text-sm font-semibold transition-all hover:opacity-80"
                  style={{ borderColor: "rgba(107,122,69,0.3)", color: "#4a4a4a" }}
                >
                  Log In
                </Link>
                <Link
                  href="/auth/signup"
                  className="rounded-full px-5 py-2 text-sm font-semibold transition-all hover:opacity-80"
                  style={{ background: "#C9A96A", color: "#2d3318" }}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Hamburger */}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="flex h-10 w-10 items-center justify-center rounded-xl md:hidden"
            style={{
              background: "rgba(201,169,106,0.12)",
              border: "1px solid rgba(201,169,106,0.3)",
              color: "#C9A96A",
            }}
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile dropdown */}
      {open && (
        <div
          className="fixed inset-x-0 z-[49] md:hidden"
          style={{
            top: headerHeight,
            background: "rgba(245,242,236,0.98)",
            borderBottom: "1px solid rgba(107,122,69,0.15)",
            boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
          }}
        >
          <nav className="flex flex-col gap-1 px-4 pt-3 pb-2">
            {navLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`block rounded-xl px-4 py-3 text-sm transition-all ${
                  active(item.href)
                    ? "bg-[rgba(201,169,106,0.12)] font-semibold text-[#C9A96A]"
                    : "font-medium text-[#4a4a4a] active:bg-[rgba(201,169,106,0.1)]"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div
            className="flex flex-col gap-3 border-t px-4 py-4"
            style={{ borderColor: "rgba(107,122,69,0.12)" }}
          >
            {user ? (
              <>
                <a
                  href="/portal"
                  className="block w-full rounded-full py-3 text-center text-sm font-semibold transition-all active:opacity-70"
                  style={{ background: "#C9A96A", color: "#2d3318" }}
                >
                  Portal
                </a>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full rounded-full border py-3 text-sm font-semibold transition-all active:opacity-70"
                  style={{ borderColor: "rgba(107,122,69,0.3)", color: "#4a4a4a" }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <a
                  href="/auth/login"
                  className="block w-full rounded-full border py-3 text-center text-sm font-semibold transition-all active:opacity-70"
                  style={{ borderColor: "rgba(107,122,69,0.3)", color: "#4a4a4a" }}
                >
                  Log In
                </a>
                <a
                  href="/auth/signup"
                  className="block w-full rounded-full py-3 text-center text-sm font-semibold transition-all active:opacity-70"
                  style={{ background: "#C9A96A", color: "#2d3318" }}
                >
                  Sign Up
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
