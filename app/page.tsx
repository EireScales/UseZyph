"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const DL_URL =
  "https://github.com/EireScales/UseZyph/releases/download/v1.0.0/Zyph.Setup.1.0.0.exe";

export default function Home() {
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const statRef = useRef<HTMLDivElement>(null);
  const [statVisible, setStatVisible] = useState(false);
  const [counts, setCounts] = useState({ weeks: 0, prompts: 0, infinity: 0 });

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("section-visible");
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    sectionRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = statRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setStatVisible(true);
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!statVisible) return;
    const steps = 40;
    const stepMs = 35;
    let step = 0;
    const t = setInterval(() => {
      step++;
      setCounts({
        weeks: Math.min(Math.round((4 * step) / steps), 4),
        prompts: 0,
        infinity: Math.min(Math.round((999 * step) / steps), 999),
      });
      if (step >= steps) clearInterval(t);
    }, stepMs);
    return () => clearInterval(t);
  }, [statVisible]);

  const ref =
    (i: number) => (el: HTMLElement | null) => {
      sectionRefs.current[i] = el;
    };

  const WinIcon = ({ size = 15 }: { size?: number }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} style={{ flexShrink: 0 }}>
      <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
    </svg>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital,wght@0,400;1,400&family=Inter:wght@400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; }
        html { scroll-behavior: smooth; }

        .serif-italic {
          font-family: 'Instrument Serif', Georgia, serif;
          font-style: italic;
        }

        @keyframes heroFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.85); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        .fade-anim {
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.19,1,0.22,1);
        }
        .fade-anim.section-visible { opacity: 1; transform: translateY(0); }

        .hero-in { animation: fadeUp 0.7s cubic-bezier(0.19,1,0.22,1) both; }

        .nav-link { transition: color 0.15s; text-decoration: none; }
        .nav-link:hover { color: #F2F2F2 !important; }

        .btn-get-started {
          font-size: 13px; font-weight: 600; color: white;
          background: #6366f1; padding: 7px 16px; border-radius: 8px;
          transition: opacity 0.15s; text-decoration: none; white-space: nowrap;
        }
        .btn-get-started:hover { opacity: 0.85; }

        .btn-dl {
          display: inline-flex; align-items: center; gap: 8px;
          background: #6366f1; color: white;
          font-size: 14px; font-weight: 600;
          padding: 12px 24px; border-radius: 8px;
          box-shadow: 0 0 0 1px rgba(99,102,241,0.5), 0 8px 24px rgba(99,102,241,0.25);
          transition: opacity 0.15s; text-decoration: none;
        }
        .btn-dl:hover { opacity: 0.88; }

        .btn-signin-hero {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.04); color: #F2F2F2;
          font-size: 14px; font-weight: 500;
          padding: 12px 24px; border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
          transition: background 0.15s; text-decoration: none;
        }
        .btn-signin-hero:hover { background: rgba(255,255,255,0.08); }

        .dl-cta-btn {
          display: inline-flex; align-items: center; gap: 10px;
          background: #6366f1; color: white;
          font-size: 15px; font-weight: 600;
          padding: 14px 32px; border-radius: 8px;
          box-shadow: 0 0 0 1px rgba(99,102,241,0.4), 0 12px 36px rgba(99,102,241,0.3);
          transition: opacity 0.15s; text-decoration: none;
        }
        .dl-cta-btn:hover { opacity: 0.88; }

        .also-web {
          display: block; margin-top: 16px;
          font-size: 14px; color: #6366f1;
          transition: color 0.15s; text-decoration: none;
        }
        .also-web:hover { color: #818cf8; }

        .feature-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px; padding: 32px;
          transition: border-color 0.2s, background 0.2s;
        }
        .feature-card:hover {
          border-color: rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.035);
        }

        .footer-link { transition: color 0.15s; text-decoration: none; }
        .footer-link:hover { color: #F2F2F2 !important; }

        @media (max-width: 768px) {
          .hero-mock        { display: none !important; }
          .hero-mock-mobile { display: block !important; }
          .two-col          { flex-direction: column !important; }
          .steps-grid       { grid-template-columns: 1fr !important; }
          .steps-grid > *   { border-radius: 12px !important; border: 1px solid rgba(255,255,255,0.07) !important; }
          .arch-cols        { grid-template-columns: 1fr !important; }
          .feature-cols     { grid-template-columns: 1fr !important; }
          .cta-btns         { flex-direction: column !important; width: 100% !important; }
          .cta-btns > *     { width: 100% !important; justify-content: center !important; }
          .sec-v             { padding-top: 80px !important; padding-bottom: 80px !important; }
          .stats-row         { flex-direction: column !important; }
          .stats-row > *     {
            border-left: none !important; border-right: none !important;
            border-top: 1px solid rgba(255,255,255,0.08) !important;
            padding: 28px 0 !important;
          }
          .footer-inner { flex-direction: column !important; height: auto !important; padding: 20px 24px !important; gap: 12px !important; text-align: center !important; }
        }
      `}</style>

      {/* ── NAVBAR ─────────────────────────────────────────── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        height: 56,
        background: "rgba(8,9,10,0.8)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 max(24px, calc((100vw - 1200px) / 2))",
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <span className="serif-italic" style={{ fontSize: 21, color: "#F2F2F2", letterSpacing: "-0.02em" }}>
            Zyph
          </span>
          <span style={{
            display: "inline-block", width: 6, height: 6,
            background: "#6366f1", borderRadius: "50%",
            marginLeft: 3, marginBottom: 2, verticalAlign: "middle",
          }} />
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link href="/auth" className="nav-link" style={{ fontSize: 14, color: "#525252", fontWeight: 500, marginRight: 24 }}>
            Sign in
          </Link>
          <Link href="/auth" className="btn-get-started">
            Get started
          </Link>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────── */}
      <section style={{
        minHeight: "100vh",
        background: "#08090a",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 140,
        paddingBottom: 80,
        paddingLeft: 24,
        paddingRight: 24,
      }}>
        {/* Background layers */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
          <div style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse 65% 45% at 50% -5%, rgba(99,102,241,0.22) 0%, transparent 70%)",
          }} />
          <div style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse 40% 35% at 0% 100%, rgba(249,115,22,0.07) 0%, transparent 60%)",
          }} />
          <div style={{
            position: "absolute", width: "100%", height: "100%",
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }} />
        </div>

        {/* Content */}
        <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", width: "100%", textAlign: "center" }}>

          {/* Badge */}
          <div className="hero-in" style={{ animationDelay: "0s", marginBottom: 40 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              border: "1px solid rgba(99,102,241,0.2)",
              background: "rgba(99,102,241,0.06)",
              borderRadius: 99, padding: "5px 14px",
            }}>
              <span style={{
                width: 5, height: 5, background: "#818cf8", borderRadius: "50%",
                display: "inline-block",
                animation: "pulse 2.5s ease-in-out infinite",
              }} />
              <span style={{ fontSize: 12, fontWeight: 500, color: "#818cf8", letterSpacing: "0.06em" }}>
                Personal Intelligence · Now in Beta
              </span>
            </div>
          </div>

          {/* H1 */}
          <h1
            className="hero-in serif-italic"
            style={{
              animationDelay: "0.1s",
              fontSize: "clamp(46px,6.5vw,88px)",
              color: "#F2F2F2",
              lineHeight: 1.06,
              letterSpacing: "-0.03em",
              maxWidth: 820,
              margin: "0 auto 24px",
            }}
          >
            The AI that was already
            <br />
            <span style={{ color: "#6366f1" }}>paying attention.</span>
          </h1>

          {/* Subheading */}
          <p
            className="hero-in"
            style={{
              animationDelay: "0.2s",
              fontFamily: "Inter, sans-serif",
              fontSize: 17,
              fontWeight: 400,
              color: "#8a8f98",
              maxWidth: 460,
              margin: "0 auto 40px",
              lineHeight: 1.75,
            }}
          >
            Zyph runs silently in the background, learns exactly how you work, and builds a permanent intelligence profile — so every conversation starts with full context.
          </p>

          {/* CTA buttons */}
          <div
            className="hero-in cta-btns"
            style={{ animationDelay: "0.3s", display: "flex", gap: 12, justifyContent: "center" }}
          >
            <Link href={DL_URL} className="btn-dl">
              <WinIcon />
              Download for Windows
            </Link>
            <Link href="/auth" className="btn-signin-hero">
              Sign in free →
            </Link>
          </div>

          {/* Trust line */}
          <div
            className="hero-in"
            style={{ animationDelay: "0.35s", marginTop: 20, display: "flex", gap: 20, justifyContent: "center" }}
          >
            <span style={{ fontSize: 13, color: "#3f3f46" }}>Free to start</span>
            <span style={{ color: "#27272a" }}>·</span>
            <span style={{ fontSize: 13, color: "#3f3f46" }}>No credit card</span>
            <span style={{ color: "#27272a" }}>·</span>
            <span style={{ fontSize: 13, color: "#3f3f46" }}>Works in background</span>
          </div>

          {/* Floating mockup — desktop */}
          <div
            className="hero-in hero-mock"
            style={{
              animationDelay: "0.5s",
              marginTop: 72,
              maxWidth: 1020,
              width: "100%",
              marginLeft: "auto",
              marginRight: "auto",
              position: "relative",
              padding: "0 24px",
            }}
          >
            {/* Glow */}
            <div style={{
              position: "absolute",
              inset: -60,
              background: "radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.12) 0%, transparent 65%)",
              filter: "blur(48px)",
              zIndex: 0,
              pointerEvents: "none",
            }} />

            {/* Card */}
            <div style={{
              position: "relative", zIndex: 1,
              background: "rgba(11,11,15,0.92)",
              backdropFilter: "blur(48px) saturate(160%)",
              WebkitBackdropFilter: "blur(48px) saturate(160%)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.03) inset, 0 40px 100px rgba(0,0,0,0.6)",
              animation: "heroFloat 8s ease-in-out infinite",
            }}>

              {/* Browser chrome */}
              <div style={{
                height: 38,
                background: "rgba(6,6,9,0.95)",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                display: "flex", alignItems: "center",
                padding: "0 14px", gap: 7,
              }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57", flexShrink: 0 }} />
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e", flexShrink: 0 }} />
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840", flexShrink: 0 }} />
                <div style={{ flex: 1 }} />
                <span style={{
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 6, padding: "3px 12px",
                  fontSize: 11, color: "#3f3f46", fontFamily: "monospace",
                }}>
                  usezyph.com/dashboard
                </span>
                <div style={{ flex: 1 }} />
              </div>

              {/* Dashboard content */}
              <div style={{ padding: "24px 28px" }}>

                {/* Header row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 600, color: "#525252", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 3 }}>
                      Good evening
                    </p>
                    <p className="serif-italic" style={{ fontSize: 22, color: "#F2F2F2", letterSpacing: "-0.01em" }}>
                      Professor
                    </p>
                  </div>
                  <p style={{ fontSize: 12, color: "#3f3f46", fontFamily: "monospace" }}>11:47 PM</p>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: "rgba(255,255,255,0.05)", marginBottom: 18 }} />

                {/* Plan banner */}
                <div style={{
                  background: "rgba(34,197,94,0.06)",
                  border: "1px solid rgba(34,197,94,0.12)",
                  borderRadius: 8, padding: "9px 14px", marginBottom: 18,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <span style={{ fontSize: 12, color: "#86efac" }}>
                    You&apos;re on the <strong style={{ color: "#F2F2F2" }}>Mirror</strong> plan — unlimited captures.
                  </span>
                  <span style={{ fontSize: 12, color: "#22c55e", cursor: "pointer", flexShrink: 0, marginLeft: 12 }}>
                    Manage →
                  </span>
                </div>

                {/* Stats grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 18 }}>
                  {[
                    { label: "OBSERVATIONS", value: "847",    borderColor: "#6366f1" },
                    { label: "DAYS ACTIVE",  value: "23",     borderColor: "#f97316" },
                    { label: "INSIGHTS",     value: "31",     borderColor: "#eab308" },
                    { label: "TOP APP",      value: "Cursor", borderColor: "#22c55e" },
                  ].map(({ label, value, borderColor }) => (
                    <div key={label} style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderLeft: `2px solid ${borderColor}`,
                      borderRadius: 8, padding: "12px 14px",
                    }}>
                      <p style={{ fontSize: 9, color: "#525252", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 5 }}>{label}</p>
                      <p style={{ fontSize: 20, fontWeight: 700, color: "#F2F2F2", fontFamily: "monospace", letterSpacing: "-0.02em" }}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* Two-column bottom */}
                <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 10 }}>

                  {/* Recent Activity */}
                  <div style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 8, padding: 14,
                  }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "#F2F2F2", marginBottom: 12 }}>Recent Activity</p>

                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, paddingBottom: 9, borderBottom: "1px solid rgba(255,255,255,0.04)", marginBottom: 9 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366f1", marginTop: 4, flexShrink: 0 }} />
                      <div>
                        <span style={{ fontSize: 10, fontWeight: 600, color: "#818cf8", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: 4, padding: "1px 6px", marginRight: 6 }}>Cursor</span>
                        <span style={{ fontSize: 12, color: "#8a8f98" }}>Working on Next.js dashboard component</span>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, paddingBottom: 9, borderBottom: "1px solid rgba(255,255,255,0.04)", marginBottom: 9 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f97316", marginTop: 4, flexShrink: 0 }} />
                      <div>
                        <span style={{ fontSize: 10, fontWeight: 600, color: "#fb923c", background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.15)", borderRadius: 4, padding: "1px 6px", marginRight: 6 }}>Brave</span>
                        <span style={{ fontSize: 12, color: "#8a8f98" }}>Browsing Stripe docs for webhook setup</span>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", marginTop: 4, flexShrink: 0 }} />
                      <div>
                        <span style={{ fontSize: 10, fontWeight: 600, color: "#86efac", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: 4, padding: "1px 6px", marginRight: 6 }}>Claude</span>
                        <span style={{ fontSize: 12, color: "#8a8f98" }}>Discussing product architecture</span>
                      </div>
                    </div>
                  </div>

                  {/* Chat card */}
                  <div style={{
                    background: "linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(99,102,241,0.03) 100%)",
                    border: "1px solid rgba(99,102,241,0.18)",
                    borderRadius: 8, padding: 14,
                    display: "flex", flexDirection: "column", justifyContent: "space-between",
                  }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#F2F2F2", marginBottom: 4 }}>Chat with Zyph</p>
                      <p style={{ fontSize: 12, color: "#8a8f98", marginBottom: 12 }}>Full context. Ask anything.</p>
                    </div>
                    <div>
                      <div style={{
                        background: "#6366f1", borderRadius: 6, padding: 9,
                        textAlign: "center", fontSize: 12, fontWeight: 600,
                        color: "white", cursor: "pointer",
                      }}>
                        Open Chat →
                      </div>
                      <p style={{ fontSize: 11, color: "#22c55e", marginTop: 8, display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ width: 5, height: 5, background: "#22c55e", borderRadius: "50%", display: "inline-block" }} />
                        Zyph knows you
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* Mobile fallback */}
          <div className="hero-mock-mobile" style={{
            display: "none",
            width: "100%", maxWidth: 380,
            marginTop: 48,
            background: "rgba(11,11,15,0.92)",
            border: "1px solid rgba(99,102,241,0.18)",
            borderRadius: 14, padding: 22,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, paddingBottom: 14, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span className="serif-italic" style={{ fontSize: 14, color: "white" }}>Z</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#F2F2F2" }}>Zyph</span>
              <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#22c55e" }}>
                <span style={{ width: 5, height: 5, background: "#22c55e", borderRadius: "50%", display: "inline-block" }} />
                Active
              </span>
            </div>
            <div style={{ background: "#6366f1", color: "white", padding: "10px 14px", borderRadius: "12px 12px 3px 12px", fontSize: 13, maxWidth: "80%", marginLeft: "auto", marginBottom: 12 }}>
              what do you know about how I work?
            </div>
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", padding: "12px 14px", borderRadius: "3px 12px 12px 12px", fontSize: 13, color: "#c4c9d4", lineHeight: 1.65 }}>
              You&apos;re a classic midnight coder — grinding between midnight and 1am using Cursor AI to ship Zyph. Indie founder energy: shipping beats perfection.
            </div>
          </div>

        </div>
      </section>

      {/* ── MARQUEE ────────────────────────────────────────── */}
      <section style={{
        background: "#060608",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        padding: "12px 0",
        overflow: "hidden",
      }}>
        <div style={{ display: "flex", width: "max-content", animation: "marquee 25s linear infinite" }}>
          {[...Array(12), ...Array(12)].map((_, i) => (
            <div key={i} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "0 40px", opacity: 0.15, flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="26" stroke="#6366f1" strokeWidth="5" opacity="0.4" />
                <circle cx="50" cy="50" r="16" stroke="#6366f1" strokeWidth="5" opacity="0.7" />
                <circle cx="50" cy="50" r="7" fill="#6366f1" />
                <line x1="50" y1="16" x2="50" y2="8" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" />
                <line x1="50" y1="84" x2="50" y2="92" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" />
                <line x1="14" y1="50" x2="8" y2="50" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" />
                <line x1="86" y1="50" x2="92" y2="50" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" />
              </svg>
              <span className="serif-italic" style={{ fontSize: 17, color: "#F2F2F2" }}>Zyph</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROOF ──────────────────────────────────────────── */}
      <section className="sec-v" style={{
        background: "#08090a",
        padding: "120px max(24px, calc((100vw - 1100px) / 2))",
      }}>
        <div className="two-col" style={{ display: "flex", gap: 80, alignItems: "center" }}>

          {/* Left */}
          <div style={{ flex: 1.1 }}>
            <p ref={ref(0)} className="fade-anim" style={{ fontSize: 11, fontWeight: 600, color: "#525252", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>
              Real output · No manual input
            </p>
            <h2 ref={ref(1)} className="fade-anim serif-italic" style={{
              fontSize: "clamp(32px,4vw,48px)",
              color: "#F2F2F2", lineHeight: 1.12, letterSpacing: "-0.02em", marginBottom: 20,
            }}>
              What Zyph figured out about our founder — without being told.
            </h2>
            <p ref={ref(2)} className="fade-anim" style={{ fontSize: 16, color: "#8a8f98", lineHeight: 1.8, marginBottom: 28 }}>
              After 7 days of passive observation, zero prompts, Zyph accurately identified work patterns, tools, schedule, and personality. Nobody typed a word.
            </p>
            {[
              "Works entirely in the background",
              "Zero prompts or configuration needed",
              "Gets more accurate over time",
            ].map((item) => (
              <div key={item} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 12 }}>
                <span style={{ color: "#6366f1", fontSize: 14, marginTop: 1 }}>✦</span>
                <span style={{ fontSize: 14, color: "#8a8f98" }}>{item}</span>
              </div>
            ))}
          </div>

          {/* Right — chat proof card */}
          <div style={{ flex: 1 }}>
            <div style={{
              background: "rgba(11,11,15,0.95)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 14, padding: 22,
              boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 14, borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 16 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span className="serif-italic" style={{ fontSize: 14, color: "white" }}>Z</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#F2F2F2" }}>Zyph</span>
                <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#22c55e" }}>
                  <span style={{ width: 5, height: 5, background: "#22c55e", borderRadius: "50%", display: "inline-block" }} />
                  Active
                </span>
              </div>

              <div style={{ marginLeft: "auto", maxWidth: "80%", marginBottom: 14 }}>
                <div style={{ background: "#6366f1", color: "white", padding: "10px 14px", borderRadius: "12px 12px 3px 12px", fontSize: 13, lineHeight: 1.5 }}>
                  what do you know about how I work?
                </div>
              </div>

              <div style={{ maxWidth: "95%", marginBottom: 12 }}>
                <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", padding: "12px 14px", borderRadius: "3px 12px 12px 12px", fontSize: 13, color: "#c4c9d4", lineHeight: 1.65 }}>
                  You&apos;re a classic midnight coder — grinding between midnight and 1am using Cursor AI to ship Zyph. Indie founder energy: shipping beats perfection. Direct, technical communicator who learns by doing.
                </div>
              </div>

              <p style={{ fontSize: 11, color: "#3f3f46", textAlign: "center" }}>
                Generated from 847 passive captures · Zero manual input
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────── */}
      <section className="sec-v" style={{
        background: "#060608",
        padding: "120px max(24px, calc((100vw - 900px) / 2))",
        textAlign: "center",
      }}>
        <p ref={ref(3)} className="fade-anim" style={{ fontSize: 11, fontWeight: 600, color: "#525252", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>
          How it works
        </p>
        <h2 ref={ref(4)} className="fade-anim serif-italic" style={{
          fontSize: "clamp(32px,4vw,52px)",
          color: "#F2F2F2", letterSpacing: "-0.02em", marginBottom: 12,
        }}>
          Three steps. Zero effort.
        </h2>
        <p ref={ref(5)} className="fade-anim" style={{ fontSize: 16, color: "#8a8f98", marginBottom: 64 }}>
          Zyph works entirely in the background. You never have to think about it.
        </p>

        <div className="steps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 0 }}>
          {[
            {
              n: "01", title: "Install & forget",
              body: "Run the desktop app. It captures your screen every 30 seconds, silently. No setup, no configuration.",
              extraStyle: { borderRadius: "12px 0 0 12px" },
            },
            {
              n: "02", title: "Zyph learns you",
              body: "Every capture is analysed by Claude. Your patterns, tools, and work style distil into a growing intelligence profile.",
              extraStyle: { borderRadius: 0, borderLeft: "none", borderRight: "none" },
            },
            {
              n: "03", title: "Chat with full context",
              body: "Open chat and ask anything. Zyph already knows how you work, what you use, and how you think.",
              extraStyle: { borderRadius: "0 12px 12px 0" },
            },
          ].map(({ n, title, body, extraStyle }, i) => (
            <div
              key={n}
              ref={ref(6 + i)}
              className="fade-anim"
              style={{
                background: "rgba(255,255,255,0.015)",
                border: "1px solid rgba(255,255,255,0.07)",
                padding: "40px 32px",
                textAlign: "left",
                ...extraStyle,
              }}
            >
              <p className="serif-italic" style={{ fontSize: 56, color: "rgba(99,102,241,0.12)", lineHeight: 1, marginBottom: 20, fontWeight: 400 }}>
                {n}
              </p>
              <h3 style={{ fontSize: 17, fontWeight: 600, color: "#F2F2F2", marginBottom: 10, letterSpacing: "-0.01em" }}>{title}</h3>
              <p style={{ fontSize: 14, color: "#8a8f98", lineHeight: 1.72 }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── ARCHITECTURE ───────────────────────────────────── */}
      <section id="features" className="sec-v" style={{
        background: "#08090a",
        padding: "120px max(24px, calc((100vw - 1100px) / 2))",
      }}>
        <p ref={ref(9)} className="fade-anim" style={{ fontSize: 11, fontWeight: 600, color: "#525252", textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "center", marginBottom: 16 }}>
          What is Zyph?
        </p>
        <h2 ref={ref(10)} className="fade-anim serif-italic" style={{
          fontSize: "clamp(32px,4vw,52px)",
          color: "#F2F2F2", letterSpacing: "-0.02em", textAlign: "center", marginBottom: 12,
        }}>
          A new category of AI.
        </h2>
        <p ref={ref(11)} className="fade-anim" style={{
          fontSize: 17, color: "#8a8f98",
          textAlign: "center", maxWidth: 500, margin: "0 auto 20px", lineHeight: 1.7,
        }}>
          Not a chatbot. Not a note-taker. A permanent intelligence layer that compounds over time.
        </p>

        {/* Equation */}
        <div ref={ref(12)} className="fade-anim" style={{ textAlign: "center", marginBottom: 52 }}>
          <p style={{
            fontSize: "clamp(17px,2.5vw,26px)",
            fontFamily: "monospace",
            fontWeight: 600,
            color: "#F2F2F2",
            letterSpacing: "-0.01em",
          }}>
            Zyph ={" "}
            <span style={{ color: "#6366f1" }}>Personal Data Engine</span>
            <span style={{ color: "#525252" }}> + </span>
            <span style={{ color: "#f97316" }}>Behavioural Memory Layer</span>
          </p>
        </div>

        {/* Two cards */}
        <div className="arch-cols" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

          {/* Indigo */}
          <div style={{
            background: "rgba(6,6,20,0.8)",
            border: "1px solid rgba(99,102,241,0.18)",
            borderTop: "2px solid #6366f1",
            borderRadius: 12, padding: 36,
          }}>
            <div style={{ display: "inline-flex", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.18)", borderRadius: 99, padding: "4px 12px", fontSize: 11, fontWeight: 600, color: "#818cf8", letterSpacing: "0.04em", marginBottom: 20 }}>
              Personal Data Engine
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "#F2F2F2", marginBottom: 10, letterSpacing: "-0.01em" }}>It observes. Constantly.</h3>
            <p style={{ fontSize: 14, color: "#8a8f98", lineHeight: 1.75, marginBottom: 22 }}>
              Every 30 seconds, Zyph silently reads your screen — every app, document, browser tab. No interruption. No asking.
            </p>
            {["Screen-level context capture", "OCR across every application", "App behaviour & usage patterns", "Structured categorised memory"].map((item) => (
              <div key={item} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 9 }}>
                <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#6366f1", flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: "#a1a1aa" }}>{item}</span>
              </div>
            ))}
          </div>

          {/* Orange */}
          <div style={{
            background: "rgba(20,10,0,0.8)",
            border: "1px solid rgba(249,115,22,0.18)",
            borderTop: "2px solid #f97316",
            borderRadius: 12, padding: 36,
          }}>
            <div style={{ display: "inline-flex", background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.18)", borderRadius: 99, padding: "4px 12px", fontSize: 11, fontWeight: 600, color: "#fb923c", letterSpacing: "0.04em", marginBottom: 20 }}>
              Behavioural Memory Layer
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "#F2F2F2", marginBottom: 10, letterSpacing: "-0.01em" }}>It remembers. Everything.</h3>
            <p style={{ fontSize: 14, color: "#8a8f98", lineHeight: 1.75, marginBottom: 22 }}>
              Observations distil into a living intelligence profile — your work style, communication patterns, tools, and cognitive rhythms.
            </p>
            {["Persistent insight profile", "Communication style modelling", "Tool & workflow mapping", "Context that compounds over time"].map((item) => (
              <div key={item} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 9 }}>
                <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#f97316", flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: "#a1a1aa" }}>{item}</span>
              </div>
            ))}
          </div>

        </div>

        {/* Bottom statement */}
        <div style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 12, padding: 40, textAlign: "center",
        }}>
          <p className="serif-italic" style={{ fontSize: "clamp(20px,3vw,30px)", color: "#F2F2F2", lineHeight: 1.4, marginBottom: 6 }}>
            &ldquo;An AI that doesn&apos;t need you to explain yourself.&rdquo;
          </p>
          <p style={{ fontSize: 15, color: "#525252" }}>Because it was already paying attention.</p>
        </div>
      </section>

      {/* ── VIDEO ──────────────────────────────────────────── */}
      <section className="sec-v" style={{
        background: "#060608",
        padding: "120px max(24px, calc((100vw - 900px) / 2))",
        textAlign: "center",
      }}>
        <p ref={ref(13)} className="fade-anim" style={{ fontSize: 11, fontWeight: 600, color: "#525252", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>
          See it in action
        </p>
        <h2 ref={ref(14)} className="fade-anim serif-italic" style={{
          fontSize: "clamp(32px,4vw,52px)",
          color: "#F2F2F2", letterSpacing: "-0.02em", marginBottom: 12,
        }}>
          Watch Zyph learn.
        </h2>
        <p ref={ref(15)} className="fade-anim" style={{ fontSize: 16, color: "#8a8f98", marginBottom: 48 }}>
          Seven days. Zero prompts. This is what it figured out.
        </p>
        <div ref={ref(16)} className="fade-anim" style={{
          marginTop: 48,
          borderRadius: 12, overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.08)",
          aspectRatio: "16/9",
          position: "relative",
        }}>
          <iframe
            src="https://www.youtube.com/embed/nsGnxbgrk14"
            width="100%"
            height="100%"
            style={{ position: "absolute", inset: 0, display: "block" }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────── */}
      <section className="sec-v" style={{
        background: "#08090a",
        padding: "120px max(24px, calc((100vw - 1100px) / 2))",
      }}>
        <p ref={ref(17)} className="fade-anim" style={{ fontSize: 11, fontWeight: 600, color: "#525252", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>
          Features
        </p>
        <h2 ref={ref(18)} className="fade-anim serif-italic" style={{
          fontSize: "clamp(32px,4vw,52px)",
          color: "#F2F2F2", letterSpacing: "-0.02em", marginBottom: 64,
        }}>
          Built for people who move fast.
        </h2>

        <div className="feature-cols" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          {[
            {
              iconBg: "rgba(99,102,241,0.1)",
              iconColor: "#818cf8",
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                  <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
                  <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
                </svg>
              ),
              title: "Writes in your voice",
              body: "Emails, messages, proposals. All sound exactly like you — because Zyph has actually read how you write.",
            },
            {
              iconBg: "rgba(249,115,22,0.1)",
              iconColor: "#fb923c",
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              ),
              title: "Zero setup",
              body: "No onboarding. No questionnaires. Install the app and work normally. Zyph does the rest.",
            },
            {
              iconBg: "rgba(34,197,94,0.1)",
              iconColor: "#4ade80",
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              ),
              title: "Private by design",
              body: "Your data stays yours. Processed securely, never sold, never shared with third parties.",
            },
          ].map(({ iconBg, iconColor, icon, title, body }) => (
            <div key={title} className="feature-card">
              <div style={{ width: 36, height: 36, borderRadius: 8, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18, color: iconColor }}>
                {icon}
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "#F2F2F2", marginBottom: 8, letterSpacing: "-0.01em" }}>{title}</h3>
              <p style={{ fontSize: 14, color: "#8a8f98", lineHeight: 1.7 }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TRACTION ───────────────────────────────────────── */}
      <section className="sec-v" style={{
        background: "#060608",
        padding: "120px max(24px, calc((100vw - 900px) / 2))",
        textAlign: "center",
      }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: "#525252", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>
          Traction
        </p>
        <h2 className="serif-italic" style={{
          fontSize: "clamp(32px,4vw,48px)",
          color: "#F2F2F2", letterSpacing: "-0.02em", marginBottom: 64,
        }}>
          Built. Shipped. Working.
        </h2>
        <div ref={statRef} className="stats-row" style={{ display: "flex", alignItems: "stretch", justifyContent: "center" }}>
          {[
            { value: statVisible ? `${counts.infinity}+` : "847+", label: "screen captures analysed" },
            { value: "3",   label: "tiers: Free, Pro, Mirror",      mid: true },
            { value: "30s", label: "capture interval, fully passive" },
          ].map(({ value, label, mid }) => (
            <div key={label} style={{
              flex: 1, padding: "0 48px", textAlign: "center",
              borderLeft:  mid ? "1px solid rgba(255,255,255,0.08)" : "none",
              borderRight: mid ? "1px solid rgba(255,255,255,0.08)" : "none",
            }}>
              <p className="serif-italic" style={{ fontSize: "clamp(48px,6vw,72px)", color: "#F2F2F2", lineHeight: 1, marginBottom: 12 }}>
                {value}
              </p>
              <p style={{ fontSize: 14, color: "#8a8f98" }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── DOWNLOAD CTA ───────────────────────────────────── */}
      <section id="download" className="sec-v" style={{
        background: "#060608",
        padding: "160px max(24px, calc((100vw - 800px) / 2))",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          width: 700, height: 500,
          background: "radial-gradient(ellipse, rgba(99,102,241,0.13) 0%, transparent 65%)",
          filter: "blur(40px)",
          pointerEvents: "none", zIndex: 0,
        }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#525252", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>
            Get started
          </p>
          <h2 className="serif-italic" style={{
            fontSize: "clamp(40px,5.5vw,72px)",
            color: "#F2F2F2", letterSpacing: "-0.03em", lineHeight: 1.06, marginBottom: 20,
          }}>
            Meet the AI
            <br />that gets you.
          </h2>
          <p style={{
            fontSize: 17, color: "#8a8f98",
            margin: "0 auto 44px", maxWidth: 380, lineHeight: 1.7,
          }}>
            Download the desktop app. Let Zyph start learning. Free to start, no card required.
          </p>
          <Link href={DL_URL} className="dl-cta-btn">
            <WinIcon size={16} />
            Download for Windows
          </Link>
          <Link href="/auth" className="also-web">Also available on web →</Link>
          <p style={{
            marginTop: 32, fontSize: 12, color: "#3f3f46",
            maxWidth: 360, marginLeft: "auto", marginRight: "auto", lineHeight: 1.6,
          }}>
            Windows may show a security warning on first install. Click More info → Run anyway. This is normal for new unsigned apps.
          </p>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer style={{
        background: "#060608",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        padding: "0 max(24px, calc((100vw - 1200px) / 2))",
      }}>
        <div className="footer-inner" style={{
          height: 64,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span className="serif-italic" style={{ fontSize: 18, color: "#F2F2F2" }}>Zyph</span>
            <span style={{ fontSize: 13, color: "#3f3f46" }}>© 2025 Zyph. All rights reserved.</span>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            <Link href="/privacy" className="footer-link" style={{ fontSize: 13, color: "#525252" }}>Privacy</Link>
            <Link href="/terms"   className="footer-link" style={{ fontSize: 13, color: "#525252" }}>Terms</Link>
            <Link href="/auth"    className="footer-link" style={{ fontSize: 13, color: "#525252" }}>Sign in</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
