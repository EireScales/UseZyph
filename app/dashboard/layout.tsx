"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home" },
  { href: "/dashboard/profile", label: "My Profile" },
  { href: "/dashboard/insights", label: "Insights" },
  { href: "/dashboard/chat", label: "Chat" },
  { href: "/dashboard/settings", label: "Settings" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#000000] flex">
      <aside
        className="fixed left-0 top-0 bottom-0 w-[200px] flex flex-col z-40"
        style={{
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Link
          href="/dashboard"
          className="p-6 text-xl font-bold text-white hover:opacity-90 transition-opacity"
        >
          Zyph
        </Link>
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "text-white"
                    : "text-white/60 hover:text-white/80 hover:bg-white/5"
                }`}
                style={
                  isActive
                    ? {
                        background: "linear-gradient(135deg, rgba(232,131,122,0.2) 0%, rgba(212,149,106,0.15) 100%)",
                        borderLeft: "2px solid #e8837a",
                        marginLeft: "-2px",
                        paddingLeft: "calc(1rem + 2px)",
                      }
                    : undefined
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 min-h-screen pl-[200px]">{children}</main>
    </div>
  );
}
