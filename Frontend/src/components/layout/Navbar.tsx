"use client";

import React, { useState, useEffect } from "react";
import { Bell, Moon, Sun, ChevronDown, Settings, LogOut, UserCircle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { getSession, clearSession, checkSessionExpired } from "@/lib/session";

export function Navbar() {
  const pathname = usePathname();
  const router   = useRouter();
  const [isDark, setIsDark]           = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser]               = useState<{ fullname?: string; email?: string; role?: string } | null>(null);

  // Periodic check for session expiry
  useEffect(() => {
    const checkExpiry = () => {
      if (checkSessionExpired()) {
        clearSession();
        alert("Your session has expired. Please log in again.");
        router.push("/");
      }
    };

    checkExpiry();
    const interval = setInterval(checkExpiry, 5000);
    return () => clearInterval(interval);
  }, [router]);

  // Read session once on mount (sessionStorage is client-only)
  useEffect(() => {
    const session = getSession();
    if (session?.user) {
      setUser(session.user as { fullname?: string; email?: string; role?: string });
    }
  }, []);

  const handleLogout = async () => {
    const session = getSession();
    if (session?.token) {
      await fetch("http://127.0.0.1:8000/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: session.token }),
      });
    }
    clearSession();
    router.push("/");
  };

  // Derive initials from name, fallback to "?"
  const initials = user?.fullname
    ? user.fullname.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const pageTitle = pathname
    ? pathname.split("/").filter(Boolean).pop()?.replace(/-/g, " ") ?? "Dashboard"
    : "Dashboard";
  const formattedTitle = pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1);

  return (
    <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between px-6 sticky top-0 z-50 w-full">
      {/* Left: Page title */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">
            Overview
          </span>
          <h1 className="text-[17px] font-semibold text-slate-800 dark:text-slate-100 leading-none tracking-tight">
            {formattedTitle}
          </h1>
        </div>
      </div>

      {/* Right: Actions + User */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-150"
        >
          {isDark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
        </button>

        {/* Notifications */}
        <button className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-150 relative">
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-2 right-2 w-[7px] h-[7px] bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
        </button>

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

        {/* User dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-150"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm shadow-violet-200 dark:shadow-violet-900/50">
                {initials}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-white dark:ring-slate-900" />
            </div>

            <div className="hidden sm:flex flex-col items-start leading-none">
              <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">
                {user?.fullname ?? "—"}
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                {user?.role ?? "—"}
              </span>
            </div>

            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-52 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xl overflow-hidden py-1">
                {/* User info header */}
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">
                    {user?.fullname ?? "—"}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                    {user?.email ?? "—"}
                  </p>
                </div>

                {[
                //   { icon: UserCircle, label: "My Profile" },
                //   { icon: Settings,    label: "Settings"   },
                ].map(({ icon: Icon, label }) => (
                  <button
                    key={label}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    {/* <Icon className="w-4 h-4 text-slate-400" />
                    {label} */}
                  </button>
                ))}

                <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}