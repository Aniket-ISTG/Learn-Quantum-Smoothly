"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/quantum/supabase";

const navLinks = [
  { href: "/learn", label: "Learn" },
  { href: "/playground", label: "Playground" },
  { href: "/#simulator", label: "Simulator" },
  { href: "/#progress", label: "Progress" },
];

export function PlatformHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user.email ?? null);
    });
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert(error.message);
      return;
    }
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-cyan-100/80 bg-white/85 px-5 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-[15px] font-bold tracking-tight text-slate-900"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 text-lg text-white shadow-sm">
            ◈
          </span>
          qubit<span className="gradient-text">lab</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
          {navLinks.map(({ href, label }) => {
            const active =
              href === "/learn"
                ? pathname.startsWith("/learn")
                : pathname === href || (href.startsWith("/#") && pathname === "/");
            return (
              <Link
                key={href}
                href={href}
                className={`transition hover:text-cyan-600 ${
                  active ? "font-semibold text-cyan-600" : ""
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {email ? (
            <span className="hidden max-w-[140px] truncate text-xs text-slate-500 sm:block">
              {email}
            </span>
          ) : (
            <Link
              href="/login"
              className="hidden rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 transition hover:text-cyan-600 sm:block"
            >
              Log in
            </Link>
          )}

          <Link href="/learn" className="btn-primary !px-3 !py-2 !text-xs">
            Start learning
          </Link>

          {email && (
            <button
              onClick={handleLogout}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 transition hover:border-red-200 hover:text-red-500"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
