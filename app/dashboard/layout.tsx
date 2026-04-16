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

function NavIcon({ name }: { name: string }) {
  const c = "w-[15px] h-[15px]";
  switch (name) {
    case "LayoutDashboard": return <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>;
    case "User": return <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
    case "Sparkles": return <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>;
    case "MessageSquare": return <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
    case "Camera": return <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>;
    case "Dna": return <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 15c6.667-6 13.333 0 20-6"/><path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993"/><path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993"/><path d="m17 6-2.5-2.5"/><path d="m14 8-1-1"/><path d="m7 18 2.5 2.5"/><path d="m3.5 14.5.5.5"/><path d="m20 9 .5.5"/><path d="m6.5 12.5 1 1"/><path d="M2 9c6.667 6 13.333 0 20 6"/></svg>;
    case "Settings": return <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
    default: return null;
  }
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital,wght@0,400;1,400&family=Inter:wght@400;500;600;700&display=swap');
        @keyframes dotPulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", background: "#08090a" }}>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 30, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
          />
        )}

        {/* SIDEBAR */}
        <aside
          className={sidebarOpen ? "" : "-translate-x-full lg:translate-x-0"}
          style={{
            position: "fixed",
            left: 0, top: 0, bottom: 0,
            width: "220px",
            background: "#08090a",
            borderRight: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            flexDirection: "column",
            zIndex: 40,
            transition: "transform 200ms ease",
          }}
        >
          {/* Logo */}
          <div style={{ padding: "18px 16px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Link href="/dashboard" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
              <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: "20px", color: "#F2F2F2", letterSpacing: "-0.02em" }}>Zyph</span>
              <span style={{ display: "inline-block", width: "5px", height: "5px", background: "#6366f1", borderRadius: "50%", marginLeft: "3px", marginBottom: "1px", animation: "dotPulse 2.5s ease-in-out infinite" }} />
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
              style={{ color: "#525252", background: "none", border: "none", cursor: "pointer", padding: "4px" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: "10px", display: "flex", flexDirection: "column", gap: "1px" }}>
            {NAV_ITEMS.map((item) => {
              const isActive = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "9px",
                    padding: "8px 10px",
                    borderRadius: "7px",
                    fontSize: "13px",
                    fontWeight: 500,
                    fontFamily: "Inter, sans-serif",
                    textDecoration: "none",
                    transition: "background 0.12s, color 0.12s",
                    background: isActive ? "rgba(99,102,241,0.1)" : "transparent",
                    color: isActive ? "#818cf8" : "#525252",
                  }}
                >
                  <span style={{ color: isActive ? "#6366f1" : "inherit", display: "flex", alignItems: "center" }}>
                    <NavIcon name={item.icon} />
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div style={{ padding: "10px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <Link
              href="/"
              style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 10px", borderRadius: "7px", fontSize: "13px", color: "#3f3f46", textDecoration: "none", fontFamily: "Inter, sans-serif" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Back to home
            </Link>
            {userEmail && (
              <p style={{ padding: "4px 10px", fontSize: "11px", color: "#3f3f46", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {userEmail}
              </p>
            )}
            <button
              onClick={handleSignOut}
              style={{ display: "flex", width: "100%", alignItems: "center", padding: "7px 10px", borderRadius: "7px", fontSize: "13px", color: "#3f3f46", background: "none", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif", textAlign: "left" }}
            >
              Sign out
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <div
          className="lg:ml-[220px] ml-0"
          style={{ marginLeft: "220px", flex: 1, minHeight: "100vh", display: "flex", flexDirection: "column", background: "#08090a" }}
        >
          {/* Mobile header */}
          <header
            className="lg:hidden"
            style={{ position: "sticky", top: 0, zIndex: 20, height: "52px", background: "rgba(8,9,10,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }}
          >
            <button onClick={() => setSidebarOpen(true)} style={{ color: "#525252", background: "none", border: "none", cursor: "pointer", padding: "6px" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 5h16M4 12h16M4 19h16"/></svg>
            </button>
            <Link href="/dashboard" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
              <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: "19px", color: "#F2F2F2", letterSpacing: "-0.02em" }}>Zyph</span>
              <span style={{ display: "inline-block", width: "5px", height: "5px", background: "#6366f1", borderRadius: "50%", marginLeft: "3px" }} />
            </Link>
            <div style={{ width: "32px" }} />
          </header>

          <main style={{ flex: 1 }}>{children}</main>
        </div>

      </div>
    </>
  );
}
