"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: "LayoutDashboard" },
  { href: "/dashboard/profile", label: "My Profile", icon: "User" },
  { href: "/dashboard/insights", label: "Insights", icon: "Sparkles" },
  { href: "/dashboard/chat", label: "Chat", icon: "MessageSquare" },
  { href: "/dashboard/caught", label: "Caught in 4K", icon: "Camera" },
  { href: "/dashboard/dna", label: "Zyph DNA", icon: "Dna" },
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
    case "Camera":
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
          <circle cx="12" cy="13" r="4"/>
        </svg>
      );
    case "Dna":
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 15c6.667-6 13.333 0 20-6"/>
          <path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993"/>
          <path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993"/>
          <path d="m17 6-2.5-2.5"/>
          <path d="m14 8-1-1"/>
          <path d="m7 18 2.5 2.5"/>
          <path d="m3.5 14.5.5.5"/>
          <path d="m20 9 .5.5"/>
          <path d="m6.5 12.5 1 1"/>
          <path d="M2 9c6.667 6 13.333 0 20 6"/>
        </svg>
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
  const supabase = createSupabaseBrowserClient();
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
    <div style={{ minHeight: "100vh", background: "#08090a" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital,wght@0,400;1,400&family=Inter:wght@400;500;600;700&display=swap');
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .dash-nav-link { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 7px; font-size: 13px; font-weight: 500; font-family: Inter, sans-serif; transition: background 0.12s, color 0.12s; text-decoration: none; }
        .dash-nav-link.active { background: rgba(99,102,241,0.1); color: #818cf8; }
        .dash-nav-link.inactive { color: #525252; }
        .dash-nav-link.inactive:hover { background: rgba(255,255,255,0.04); color: #8a8f98; }
        .dash-nav-link.inactive:hover .nav-icon { color: #8a8f98; }
        .dash-footer-link { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 7px; font-size: 13px; color: #3f3f46; text-decoration: none; transition: color 0.12s, background 0.12s; width: 100%; }
        .dash-footer-link:hover { color: #8a8f98; background: rgba(255,255,255,0.04); }
        .dash-signout { display: flex; align-items: center; width: 100%; padding: 8px 10px; border-radius: 7px; font-size: 13px; color: #3f3f46; background: none; border: none; cursor: pointer; font-family: Inter, sans-serif; text-align: left; transition: color 0.12s, background 0.12s; }
        .dash-signout:hover { color: #8a8f98; background: rgba(255,255,255,0.04); }
        .hamburger-btn { padding: 8px; border-radius: 6px; background: none; border: none; cursor: pointer; color: #525252; transition: color 0.12s; }
        .hamburger-btn:hover { color: #8a8f98; }
      `}</style>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          style={{ background: "rgba(0,0,0,0.7)", transition: "opacity 200ms" }}
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
        style={{
          position: "fixed",
          left: 0, top: 0, bottom: 0,
          width: 220,
          display: "flex",
          flexDirection: "column",
          zIndex: 40,
          background: "#08090a",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          transition: "transform 200ms ease",
        }}
      >
        {/* Sidebar header */}
        <div style={{
          padding: "20px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <Link href="/dashboard" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <span style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontStyle: "italic",
              fontSize: 20,
              color: "#F2F2F2",
              letterSpacing: "-0.02em",
            }}>
              Zyph
            </span>
            <span style={{
              display: "inline-block",
              width: 5, height: 5,
              background: "#6366f1",
              borderRadius: "50%",
              marginLeft: 3, marginBottom: 1,
              verticalAlign: "middle",
              animation: "pulse 2.5s ease-in-out infinite",
            }} />
          </Link>

          {/* Close button — mobile only */}
          <button
            type="button"
            className="hamburger-btn lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
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
                className={`dash-nav-link ${isActive ? "active" : "inactive"}`}
              >
                <span
                  className="nav-icon"
                  style={{
                    width: 16, height: 16, flexShrink: 0,
                    color: isActive ? "#6366f1" : "currentColor",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <NavIcon name={item.icon} className="w-4 h-4" />
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div style={{
          padding: "12px 10px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}>
          <Link href="/" className="dash-footer-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to home
          </Link>

          {userEmail && (
            <p
              title={userEmail}
              style={{
                padding: "6px 10px",
                fontSize: 11,
                color: "#3f3f46",
                fontFamily: "monospace",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {userEmail}
            </p>
          )}

          <button
            type="button"
            onClick={handleSignOut}
            className="dash-signout"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div
        className="lg:ml-[220px] ml-0"
        style={{ marginLeft: 0, minHeight: "100vh", display: "flex", flexDirection: "column" }}
      >
        {/* Mobile header */}
        <header
          className="sticky top-0 z-20 lg:hidden"
          style={{
            height: 52,
            background: "rgba(8,9,10,0.9)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
          }}
        >
          <button
            type="button"
            className="hamburger-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 5h16M4 12h16M4 19h16"/>
            </svg>
          </button>

          <Link href="/dashboard" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
            <span style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontStyle: "italic",
              fontSize: 19,
              color: "#F2F2F2",
              letterSpacing: "-0.02em",
            }}>
              Zyph
            </span>
            <span style={{
              display: "inline-block",
              width: 5, height: 5,
              background: "#6366f1",
              borderRadius: "50%",
              marginLeft: 3, marginBottom: 1,
              verticalAlign: "middle",
            }} />
          </Link>

          <div style={{ width: 36 }} />
        </header>

        <main style={{ flex: 1, width: "100%" }}>{children}</main>
      </div>
    </div>
  );
}
