"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: "LayoutDashboard" },
  { href: "/dashboard/profile", label: "My Profile", icon: "User" },
  { href: "/dashboard/insights", label: "Insights", icon: "Sparkles" },
  { href: "/dashboard/chat", label: "Chat", icon: "MessageSquare" },
  { href: "/dashboard/settings", label: "Settings", icon: "Settings" },
];

function NavIcon({ name, className }: { name: string; className?: string }) {
  const c = className ?? "w-5 h-5";
  switch (name) {
    case "LayoutDashboard":
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
      );
    case "User":
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      );
    case "Sparkles":
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
      );
    case "MessageSquare":
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      );
    case "Settings":
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
      );
    default:
      return null;
  }
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) setUserEmail(user.email);
    };
    loadUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/auth");
  };

  return (
    <div
      className="min-h-screen flex"
      style={{
        background: "radial-gradient(ellipse 80% 50% at 50% 0%, #0f0a1a 0%, #0a0a0a 70%)",
      }}
    >
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 transition-opacity duration-200 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={`fixed left-0 top-0 bottom-0 w-[220px] flex flex-col z-40 transition-transform duration-200 ease-[cubic-bezier(0.2)] lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: "#0d0d0d",
          borderRight: "1px solid #1a1a1a",
        }}
      >
        <div className="p-5 flex items-center justify-between lg:justify-start">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-white font-semibold text-lg hover:opacity-90 transition-opacity duration-200"
          >
            Zyph
            <span
              className="w-2 h-2 rounded-full bg-[#7c3aed] shrink-0 animate-pulse"
              style={{ boxShadow: "0 0 8px #7c3aed" }}
              aria-label="Active"
            />
          </Link>
          <button
            type="button"
            className="lg:hidden p-2 rounded-lg text-[#666] hover:text-[#999] hover:bg-[#141414] transition-colors duration-200"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "text-white bg-[#1a1a2e]"
                    : "text-[#555] hover:text-[#999] hover:bg-[#141414]"
                }`}
                style={
                  isActive
                    ? {
                        borderLeft: "2px solid #7c3aed",
                        paddingLeft: "calc(0.75rem + 2px)",
                      }
                    : { borderLeft: "2px solid transparent" }
                }
              >
                <span className={isActive ? "text-white" : "text-current"}>
                  <NavIcon name={item.icon} />
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div
          className="p-4 border-t border-[#1a1a1a] space-y-2"
          style={{ borderTop: "1px solid #1a1a1a" }}
        >
          {userEmail && (
            <p className="text-xs text-[#666] truncate px-2" title={userEmail}>
              {userEmail}
            </p>
          )}
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full px-3 py-2 rounded-lg text-sm text-[#666] hover:text-[#f0f0f0] hover:bg-[#141414] transition-colors duration-200 text-left"
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 min-h-screen flex flex-col lg:pl-[220px]">
        <header className="sticky top-0 z-20 lg:hidden flex items-center justify-between px-4 py-3 border-b border-[#1a1a1a] bg-[#0d0d0d]">
          <button
            type="button"
            className="p-2 rounded-lg text-[#666] hover:text-[#999] hover:bg-[#141414] transition-colors duration-200"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 5h16M4 12h16M4 19h16"/></svg>
          </button>
          <Link href="/dashboard" className="font-semibold text-white">
            Zyph
          </Link>
          <div className="w-10" />
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
