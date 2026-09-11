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

export function PlatformHeader({
  theme = "light",
  onThemeChange = () => {},
}: {
  theme?: "light" | "dark";
  onThemeChange?: (next: "light" | "dark") => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);

  const themeOptions = [
    { id: "light", label: "Light" },
    { id: "dark", label: "Dark" },
  ] as const;

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
    <header className="sticky top-0 z-50 border-b border-[#e8d9c8] bg-[rgba(250,245,238,0.85)] px-5 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-[15px] font-bold tracking-tight text-[#1f1b17]"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-[#d78d5f] via-[#b8643e] to-[#915a48] text-lg text-white shadow-sm">
            ◈
          </span>
          <span className="gradient-text">qMentor</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-[#584b41] md:flex">
          {navLinks.map(({ href, label }) => {
            const active =
              href === "/learn"
                ? pathname.startsWith("/learn")
                : pathname === href || (href.startsWith("/#") && pathname === "/");
            return (
              <Link
                key={href}
                href={href}
                className={`transition hover:text-[#a75b39] ${
                  active ? "font-semibold text-[#a75b39]" : ""
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-1 rounded-full border border-[#e6d3c0] bg-[rgba(255,250,245,0.7)] p-1 md:flex">
            {themeOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => onThemeChange(option.id)}
                className={`rounded-full px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] transition ${
                  theme === option.id
                    ? "bg-[#b8643e] text-white shadow-sm"
                    : "text-[#5f5049] hover:text-[#a75b39]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {email ? (
            <span className="hidden max-w-[140px] truncate text-xs text-[#6b584c] sm:block">
              {email}
            </span>
          ) : (
            <Link
              href="/login"
              className="hidden rounded-lg px-3 py-2 text-xs font-semibold text-[#584b41] transition hover:text-[#a75b39] sm:block"
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
              className="rounded-lg border border-[#e5d4c3] px-3 py-2 text-xs font-semibold text-[#6b584c] transition hover:border-[#d77a5b] hover:text-[#a75b39]"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
