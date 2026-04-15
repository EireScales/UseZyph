"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const DL_URL = "https://github.com/EireScales/UseZyph/releases/download/v1.0.0/Zyph.Setup.1.0.0.exe";

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
      (entries) => { if (entries[0]?.isIntersecting) setStatVisible(true); },
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

  const ref = (i: number) => (el: HTMLElement | null) => { sectionRefs.current[i] = el; };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');

        *, *::before, *::after { box-sizing: border-box; }
        html { scroll-behavior: smooth; }

        .serif        { font-family: 'Instrument Serif', Georgia, serif; }
        .serif-italic { font-family: 'Instrument Serif', Georgia, serif; font-style: italic; }

        @keyframes heroFloat {
          0%, 100% { transform: perspective(1200px) translateY(0px) rotateX(1.5deg); }
          50%       { transform: perspective(1200px) translateY(-12px) rotateX(0.5deg); }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.35; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .fade-anim {
          opacity: 0;
          transform: translateY(22px);
          transition: opacity 0.65s cubic-bezier(0.16,1,0.3,1), transform 0.65s cubic-bezier(0.16,1,0.3,1);
        }
        .fade-anim.section-visible { opacity: 1; transform: translateY(0); }

        .hero-in { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both; }

        .btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: #6366f1; color: #fff;
          padding: 14px 28px; border-radius: 99px;
          font-size: 15px; font-weight: 600;
          text-decoration: none; border: none; cursor: pointer;
          transition: opacity 0.18s ease, transform 0.18s ease;
          white-space: nowrap;
        }
        .btn-primary:hover { opacity: 0.88; transform: scale(1.025); }

        .btn-ghost {
          display: inline-flex; align-items: center;
          background: rgba(255,255,255,0.04); color: #fff;
          padding: 14px 28px; border-radius: 99px;
          font-size: 15px; font-weight: 500;
          text-decoration: none; border: 1px solid rgba(255,255,255,0.1); cursor: pointer;
          transition: background 0.18s ease, transform 0.18s ease;
          white-space: nowrap;
        }
        .btn-ghost:hover { background: rgba(255,255,255,0.08); transform: scale(1.025); }

        .nav-link { transition: color 0.15s ease; }
        .nav-link:hover { color: #fff !important; }

        .footer-link { transition: color 0.15s ease; text-decoration: none; }
        .footer-link:hover { color: #fff !important; }

        .fact-item { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; font-size: 15px; color: #a1a1aa; }

        .activity-row { display: flex; align-items: flex-start; gap: 10px; padding-bottom: 10px; margin-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .activity-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }

        @media (max-width: 768px) {
          .hero-h1   { font-size: 42px !important; }
          .hero-mock { display: none !important; }
          .hero-mock-mobile { display: block !important; }
          .two-col   { flex-direction: column !important; }
          .steps-grid { grid-template-columns: 1fr !important; }
          .steps-grid > *:first-child { border-radius: 16px 16px 0 0 !important; }
          .steps-grid > *:last-child  { border-radius: 0 0 16px 16px !important; }
          .stats-row  { flex-direction: column !important; }
          .stats-row > * { border-left: none !important; border-right: none !important; border-top: 1px solid rgba(255,255,255,0.08) !important; padding: 28px 0 !important; }
          .arch-cols  { flex-direction: column !important; }
          .sec-pad    { padding-left: 24px !important; padding-right: 24px !important; }
          .proof-card { display: none !important; }
          .nav-center { display: none !important; }
          .nav-pad    { padding: 0 20px !important; }
        }
      `}</style>

      {/* ─── NAVBAR ─────────────────────────────────────── */}
      <nav className="nav-pad" style={{
        position: "sticky", top: 0, zIndex: 50,
        height: 56,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 48px",
        background: "rgba(6,6,6,0.7)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <span className="serif-italic" style={{ fontSize: 22, color: "#fff" }}>Zyph</span>
          <span style={{
            width: 7, height: 7, background: "#6366f1", borderRadius: "50%",
            display: "inline-block", marginLeft: 4, verticalAlign: "middle", marginBottom: 2,
          }} />
        </Link>

        <div className="nav-center" style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <Link href="/pricing" className="nav-link" style={{ fontSize: 14, color: "#71717a", textDecoration: "none" }}>Pricing</Link>
          <Link href="#features" className="nav-link" style={{ fontSize: 14, color: "#71717a", textDecoration: "none" }}>Features</Link>
          <Link href="/auth" className="nav-link" style={{ fontSize: 14, color: "#71717a", textDecoration: "none" }}>Sign in</Link>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Link href="/auth" className="nav-link" style={{ fontSize: 14, color: "#71717a", textDecoration: "none" }}>Sign in</Link>
          <Link href={DL_URL} className="btn-primary" style={{ padding: "8px 18px", fontSize: 13 }}>
            Get started free
          </Link>
        </div>
      </nav>

      {/* ─── HERO ───────────────────────────────────────── */}
      <section style={{
        minHeight: "100vh", background: "#050508",
        position: "relative", overflow: "hidden",
        display: "flex", flexDirection: "column", alignItems: "center",
        paddingTop: 120, paddingBottom: 80, paddingLeft: 24, paddingRight: 24,
      }}>
        {/* Background layers */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(99,102,241,0.2) 0%, transparent 65%)",
          }} />
          <div style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse 40% 40% at 20% 100%, rgba(249,115,22,0.08) 0%, transparent 60%)",
          }} />
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: "repeating-linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), repeating-linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }} />
        </div>

        {/* Content */}
        <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>

          {/* Badge */}
          <div className="hero-in" style={{ animationDelay: "0s", marginBottom: 32 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              border: "1px solid rgba(99,102,241,0.25)",
              background: "rgba(99,102,241,0.07)",
              borderRadius: 99, padding: "6px 14px",
            }}>
              <span style={{
                width: 6, height: 6, background: "#6366f1", borderRadius: "50%",
                display: "inline-block", animation: "pulse 2s infinite",
              }} />
              <span style={{ fontSize: 12, color: "#a5b4fc", letterSpacing: "0.08em", fontWeight: 500 }}>
                Personal Intelligence · Now in Beta
              </span>
            </div>
          </div>

          {/* H1 */}
          <h1
            className="hero-in serif-italic hero-h1"
            style={{
              animationDelay: "0.1s",
              fontSize: "clamp(48px, 7vw, 88px)",
              color: "#fff", lineHeight: 1.05, letterSpacing: "-0.5px",
              textAlign: "center", maxWidth: 900, margin: "0 auto",
            }}
          >
            The AI that was already
            <br />
            <span style={{ color: "#6366f1" }}>paying attention.</span>
          </h1>

          {/* Sub */}
          <p className="hero-in" style={{
            animationDelay: "0.2s",
            fontSize: 17, color: "#71717a", maxWidth: 480,
            margin: "24px auto 0", lineHeight: 1.75, textAlign: "center",
          }}>
            Zyph silently watches your screen, learns your patterns, and builds a permanent intelligence profile — so every conversation starts with full context.
          </p>

          {/* CTAs */}
          <div className="hero-in" style={{
            animationDelay: "0.3s",
            display: "flex", flexWrap: "wrap", gap: 12,
            justifyContent: "center", marginTop: 40,
          }}>
            <Link href={DL_URL} className="btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
              </svg>
              Download for Windows
            </Link>
            <Link href="/auth" className="btn-ghost">Sign in free</Link>
          </div>

          {/* Trust row */}
          <div className="hero-in" style={{
            animationDelay: "0.4s",
            display: "flex", flexWrap: "wrap", gap: 24,
            justifyContent: "center", marginTop: 20,
            fontSize: 13, color: "#3f3f46",
          }}>
            <span>Free to start</span>
            <span style={{ color: "#27272a" }}>·</span>
            <span>No credit card</span>
            <span style={{ color: "#27272a" }}>·</span>
            <span>Works in background</span>
          </div>

          {/* Floating mockup — desktop */}
          <div className="hero-in hero-mock" style={{
            animationDelay: "0.5s",
            width: "100%", maxWidth: 1000,
            margin: "72px auto 0",
            position: "relative",
          }}>
            {/* Glow behind */}
            <div style={{
              position: "absolute", inset: -40,
              background: "radial-gradient(ellipse at center, rgba(99,102,241,0.15) 0%, transparent 70%)",
              filter: "blur(40px)", zIndex: 0, pointerEvents: "none",
            }} />

            {/* Card */}
            <div style={{
              position: "relative", zIndex: 1,
              background: "rgba(10,10,14,0.85)",
              backdropFilter: "blur(40px) saturate(150%)",
              WebkitBackdropFilter: "blur(40px) saturate(150%)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 20, overflow: "hidden",
              boxShadow: "0 32px 80px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.04)",
              animation: "heroFloat 7s ease-in-out infinite",
            }}>
              {/* Browser chrome */}
              <div style={{
                background: "rgba(6,6,8,0.9)",
                height: 38,
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                display: "flex", alignItems: "center",
                padding: "0 16px", gap: 8,
              }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57", flexShrink: 0 }} />
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e", flexShrink: 0 }} />
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840", flexShrink: 0 }} />
                <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
                  <span style={{
                    background: "rgba(255,255,255,0.05)", borderRadius: 6,
                    padding: "4px 12px", fontSize: 11, color: "#555",
                    fontFamily: "var(--font-mono), monospace",
                  }}>
                    usezyph.com/dashboard
                  </span>
                </div>
                <div style={{ flex: 1 }} />
              </div>

              {/* Dashboard body */}
              <div style={{ padding: 28 }}>
                {/* Row 1 */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                  <div>
                    <p style={{ fontSize: 11, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
                      GOOD EVENING
                    </p>
                    <h2 className="serif-italic" style={{ fontSize: 24, fontWeight: 700, color: "#fff", margin: 0 }}>
                      Professor
                    </h2>
                  </div>
                  <p style={{ fontSize: 13, color: "#3f3f46", fontFamily: "var(--font-mono), monospace" }}>11:47 PM</p>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: "rgba(255,255,255,0.05)", marginBottom: 20 }} />

                {/* Plan banner */}
                <div style={{
                  background: "rgba(34,197,94,0.07)",
                  border: "1px solid rgba(34,197,94,0.15)",
                  borderRadius: 10, padding: "10px 16px",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  marginBottom: 20,
                }}>
                  <span style={{ fontSize: 13, color: "#86efac" }}>
                    You&apos;re on the <strong style={{ color: "#fff" }}>Mirror</strong> plan — unlimited captures enabled.
                  </span>
                  <span style={{ fontSize: 13, color: "#22c55e", cursor: "pointer", flexShrink: 0, marginLeft: 16 }}>
                    Manage plan →
                  </span>
                </div>

                {/* Stats */}
                <div style={{
                  display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20,
                }}>
                  {[
                    { label: "TOTAL OBSERVATIONS", value: "847",    accent: "#6366f1" },
                    { label: "DAYS ACTIVE",         value: "23",     accent: "#f97316" },
                    { label: "INSIGHTS",             value: "31",     accent: "#eab308" },
                    { label: "TOP APP",              value: "Cursor", accent: "#22c55e" },
                  ].map(({ label, value, accent }) => (
                    <div key={label} style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderLeft: `2px solid ${accent}`,
                      borderRadius: 10, padding: 14,
                    }}>
                      <p style={{ fontSize: 9, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{label}</p>
                      <p style={{ fontSize: 22, fontWeight: 700, color: "#fff", fontFamily: "var(--font-mono), monospace" }}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* Bottom two-col */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {/* Activity */}
                  <div style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 12, padding: 16,
                  }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 12 }}>Recent Activity</p>
                    {[
                      { dot: "#6366f1", badge: { text: "Cursor",  bg: "#1e1b4b", color: "#a5b4fc" }, body: "Working on a Next.js dashboard component",           time: "2m ago"  },
                      { dot: "#f97316", badge: { text: "Brave",   bg: "#431407", color: "#fb923c" }, body: "Browsing Stripe documentation for webhook setup",     time: "8m ago"  },
                      { dot: "#22c55e", badge: { text: "Claude",  bg: "#052e16", color: "#86efac" }, body: "Discussing product architecture and feature roadmap", time: "14m ago" },
                    ].map(({ dot, badge, body, time }) => (
                      <div key={body} className="activity-row">
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: dot, flexShrink: 0, marginTop: 4 }} />
                        <span style={{
                          fontSize: 10, fontWeight: 600, color: badge.color,
                          background: badge.bg, padding: "2px 7px", borderRadius: 4,
                          flexShrink: 0, whiteSpace: "nowrap",
                        }}>
                          {badge.text}
                        </span>
                        <span style={{ fontSize: 12, color: "#71717a", lineHeight: 1.5, flex: 1 }}>— {body}</span>
                        <span style={{ fontSize: 11, color: "#3f3f46", flexShrink: 0, whiteSpace: "nowrap" }}>{time}</span>
                      </div>
                    ))}
                  </div>

                  {/* Chat card */}
                  <div style={{
                    background: "linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(99,102,241,0.04) 100%)",
                    border: "1px solid rgba(99,102,241,0.2)",
                    borderRadius: 12, padding: 16,
                    display: "flex", flexDirection: "column", justifyContent: "space-between",
                  }}>
                    <div>
                      <h3 style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 4 }}>Chat with Zyph</h3>
                      <p style={{ fontSize: 12, color: "#71717a" }}>Your AI has full context. Ask anything.</p>
                    </div>
                    <div>
                      <button style={{
                        width: "100%", padding: 10,
                        background: "#6366f1", color: "#fff",
                        borderRadius: 8, fontSize: 13, fontWeight: 600,
                        border: "none", cursor: "pointer", marginBottom: 8,
                      }}>
                        Open Chat →
                      </button>
                      <p style={{ fontSize: 11, color: "#22c55e", display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 6, height: 6, background: "#22c55e", borderRadius: "50%", display: "inline-block" }} />
                        Zyph knows you
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile fallback card */}
          <div className="hero-mock-mobile" style={{
            display: "none", width: "100%", maxWidth: 400,
            margin: "48px auto 0",
            background: "rgba(10,10,14,0.9)",
            border: "1px solid rgba(99,102,241,0.2)",
            borderRadius: 16, padding: 24,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, paddingBottom: 14, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%", background: "#6366f1",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 700, color: "#fff",
              }}>Z</div>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>Zyph</span>
              <span style={{ fontSize: 12, color: "#22c55e", marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 6, height: 6, background: "#22c55e", borderRadius: "50%", display: "inline-block" }} />
                Knows you
              </span>
            </div>
            <div style={{ background: "#6366f1", color: "#fff", padding: "10px 14px", borderRadius: "14px 14px 4px 14px", fontSize: 13, marginBottom: 12, marginLeft: "auto", maxWidth: "80%" }}>
              what do you know about how I work?
            </div>
            <div style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
              padding: "12px 14px", borderRadius: "4px 14px 14px 14px",
              fontSize: 13, color: "#e4e4e7", lineHeight: 1.65,
            }}>
              You&apos;re a classic midnight coder — grinding between midnight and 1am using Cursor AI to ship Zyph fast.
            </div>
          </div>
        </div>
      </section>

      {/* ─── MARQUEE ────────────────────────────────────── */}
      <section style={{
        background: "#030305",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        padding: "14px 0", overflow: "hidden",
      }}>
        <div style={{ display: "flex", width: "max-content", animation: "marquee 28s linear infinite" }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "0 40px", opacity: 0.18, flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="28" stroke="#6366f1" strokeWidth="5" opacity="0.4" />
                <circle cx="50" cy="50" r="16" stroke="#6366f1" strokeWidth="5" opacity="0.7" />
                <circle cx="50" cy="50" r="6" fill="#6366f1" />
                <line x1="50" y1="14" x2="50" y2="8" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" />
                <line x1="50" y1="86" x2="50" y2="92" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" />
                <line x1="14" y1="50" x2="8" y2="50" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" />
                <line x1="86" y1="50" x2="92" y2="50" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" />
              </svg>
              <span className="serif-italic" style={{ fontSize: 18, color: "#fff" }}>Zyph</span>
            </div>
          ))}
          {/* duplicate for seamless loop */}
          {[...Array(8)].map((_, i) => (
            <div key={`b${i}`} style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "0 40px", opacity: 0.18, flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="28" stroke="#6366f1" strokeWidth="5" opacity="0.4" />
                <circle cx="50" cy="50" r="16" stroke="#6366f1" strokeWidth="5" opacity="0.7" />
                <circle cx="50" cy="50" r="6" fill="#6366f1" />
                <line x1="50" y1="14" x2="50" y2="8" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" />
                <line x1="50" y1="86" x2="50" y2="92" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" />
                <line x1="14" y1="50" x2="8" y2="50" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" />
                <line x1="86" y1="50" x2="92" y2="50" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" />
              </svg>
              <span className="serif-italic" style={{ fontSize: 18, color: "#fff" }}>Zyph</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── THE PROOF ──────────────────────────────────── */}
      <section className="sec-pad" style={{ background: "#050508", padding: "120px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="two-col" style={{ display: "flex", gap: 80, alignItems: "center", flexWrap: "wrap" }}>

            {/* Left */}
            <div style={{ flex: "1.2 1 300px" }}>
              <p ref={ref(0)} className="fade-anim" style={{ fontSize: 11, color: "#52525b", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 16 }}>
                Real Output
              </p>
              <h2 ref={ref(1)} className="fade-anim serif-italic" style={{
                fontSize: "clamp(32px,4vw,48px)",
                color: "#fff", lineHeight: 1.1, marginBottom: 24,
              }}>
                What Zyph figured out about our founder — without being told.
              </h2>
              <p ref={ref(2)} className="fade-anim" style={{ fontSize: 16, color: "#71717a", lineHeight: 1.8, marginBottom: 32 }}>
                After 7 days of passive observation, no manual input, Zyph accurately identified work patterns, tools, schedule, and personality.
              </p>
              {[
                "Works entirely in the background",
                "Zero prompts or configuration",
                "Compounds over time — gets sharper",
              ].map((f) => (
                <div key={f} className="fact-item">
                  <span style={{ color: "#6366f1", fontSize: 14 }}>✦</span>
                  {f}
                </div>
              ))}
            </div>

            {/* Right — chat proof card */}
            <div className="proof-card" style={{ flex: "1 1 320px" }}>
              <div style={{
                background: "rgba(10,10,14,0.9)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16, padding: 24,
                boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
              }}>
                {/* Card header */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  marginBottom: 20, paddingBottom: 16,
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%", background: "#6366f1",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 700, color: "#fff", flexShrink: 0,
                  }}>Z</div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>Zyph</span>
                  <span style={{ fontSize: 12, color: "#22c55e", marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                    <span style={{ width: 6, height: 6, background: "#22c55e", borderRadius: "50%", display: "inline-block" }} />
                    Knows you
                  </span>
                </div>

                {/* User message */}
                <div style={{
                  background: "#6366f1", color: "#fff",
                  padding: "12px 16px", borderRadius: "16px 16px 4px 16px",
                  fontSize: 14, maxWidth: "80%", marginLeft: "auto", marginBottom: 16,
                }}>
                  what do you know about how I work?
                </div>

                {/* Zyph response */}
                <div style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  padding: 16, borderRadius: "4px 16px 16px 16px",
                  fontSize: 14, color: "#e4e4e7", lineHeight: 1.7, maxWidth: "90%",
                }}>
                  You&apos;re a classic midnight coder — grinding between midnight and 1am using Cursor AI to ship Zyph fast. Indie founder energy: shipping beats perfection. You learn by doing, picking up techniques from YouTube when you need them. Direct, technical communicator.
                </div>

                <p style={{ fontSize: 11, color: "#3f3f46", marginTop: 14, textAlign: "center" }}>
                  Generated from 847 passive captures · No manual input
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ───────────────────────────────── */}
      <section className="sec-pad" style={{ background: "#030305", padding: "120px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <p ref={ref(3)} className="fade-anim" style={{ fontSize: 11, color: "#52525b", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 16 }}>
            How It Works
          </p>
          <h2 ref={ref(4)} className="fade-anim serif-italic" style={{
            fontSize: "clamp(36px,5vw,52px)", color: "#fff", marginBottom: 16,
          }}>
            Three steps. Zero effort.
          </h2>
          <p ref={ref(5)} className="fade-anim" style={{ fontSize: 16, color: "#71717a", marginBottom: 64 }}>
            Zyph works entirely in the background. You never have to think about it.
          </p>

          <div className="steps-grid" style={{
            display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 2,
          }}>
            {[
              {
                n: "01", title: "Install & forget",
                body: "Run the desktop app. It captures your screen every 30 seconds, silently in the background. No configuration needed.",
                radius: "16px 0 0 16px",
              },
              {
                n: "02", title: "Zyph learns you",
                body: "Every capture is analysed by Claude. Your patterns, tools, and style are distilled into a growing intelligence profile.",
                radius: "0",
              },
              {
                n: "03", title: "Chat with context",
                body: "Open chat and ask anything. Zyph already knows your work style, your tools, and how you think.",
                radius: "0 16px 16px 0",
              },
            ].map(({ n, title, body, radius }, i) => (
              <div
                key={n}
                ref={ref(6 + i)}
                className="fade-anim"
                style={{
                  background: "rgba(255,255,255,0.01)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: radius, padding: "40px 32px",
                  textAlign: "left",
                }}
              >
                <p className="serif-italic" style={{
                  fontSize: 64, color: "rgba(99,102,241,0.15)", lineHeight: 1, marginBottom: 16,
                }}>{n}</p>
                <h3 style={{ fontSize: 18, color: "#fff", fontWeight: 600, marginBottom: 10 }}>{title}</h3>
                <p style={{ fontSize: 14, color: "#71717a", lineHeight: 1.7 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ARCHITECTURE ───────────────────────────────── */}
      <section id="features" className="sec-pad" style={{ background: "#050508", padding: "120px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p ref={ref(9)} className="fade-anim" style={{ fontSize: 11, color: "#52525b", letterSpacing: "0.14em", textTransform: "uppercase", textAlign: "center", marginBottom: 16 }}>
            What Is Zyph?
          </p>
          <h2 ref={ref(10)} className="fade-anim serif-italic" style={{
            fontSize: "clamp(32px,4vw,52px)", color: "#fff",
            textAlign: "center", marginBottom: 12,
          }}>
            A new category of AI.
          </h2>
          <p ref={ref(11)} className="fade-anim" style={{
            fontSize: 17, color: "#71717a", textAlign: "center",
            maxWidth: 560, margin: "0 auto 48px", lineHeight: 1.7,
          }}>
            Not a chatbot. Not a note-taker. A permanent intelligence layer that compounds over time.
          </p>

          {/* Equation */}
          <div ref={ref(12)} className="fade-anim" style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{
              fontSize: "clamp(16px,2.5vw,28px)",
              fontFamily: "var(--font-mono), monospace",
              fontWeight: 600, lineHeight: 1.5,
            }}>
              <span style={{ color: "#fff" }}>Zyph = </span>
              <span style={{ color: "#6366f1" }}>Personal Data Engine</span>
              <span style={{ color: "#52525b" }}> + </span>
              <span style={{ color: "#f97316" }}>Behavioural Memory Layer</span>
            </p>
          </div>

          {/* Two cards */}
          <div className="arch-cols" style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
            {/* Indigo */}
            <div style={{
              flex: "1 1 280px",
              background: "rgba(6,6,20,1)",
              border: "1px solid rgba(99,102,241,0.2)",
              borderTop: "2px solid #6366f1",
              borderRadius: 16, padding: 40,
            }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)",
                borderRadius: 99, padding: "4px 12px",
                fontSize: 12, color: "#a5b4fc", marginBottom: 24,
              }}>Personal Data Engine</div>
              <h3 style={{ fontSize: 24, fontWeight: 700, color: "#fff", marginBottom: 12 }}>It observes. Constantly.</h3>
              <p style={{ fontSize: 15, color: "#71717a", lineHeight: 1.7, marginBottom: 24 }}>
                Every 30 seconds, Zyph silently reads your screen — every app, document, browser tab. It extracts signal from noise without interrupting.
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {["Screen-level context capture", "OCR across every application", "App usage & behaviour patterns", "Structured, categorised memory"].map((item) => (
                  <li key={item} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, fontSize: 14, color: "#a1a1aa" }}>
                    <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#6366f1", flexShrink: 0 }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Orange */}
            <div style={{
              flex: "1 1 280px",
              background: "rgba(20,8,4,1)",
              border: "1px solid rgba(249,115,22,0.2)",
              borderTop: "2px solid #f97316",
              borderRadius: 16, padding: 40,
            }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.2)",
                borderRadius: 99, padding: "4px 12px",
                fontSize: 12, color: "#fb923c", marginBottom: 24,
              }}>Behavioural Memory Layer</div>
              <h3 style={{ fontSize: 24, fontWeight: 700, color: "#fff", marginBottom: 12 }}>It remembers. Everything.</h3>
              <p style={{ fontSize: 15, color: "#71717a", lineHeight: 1.7, marginBottom: 24 }}>
                Observations distil into a living intelligence profile — your work style, communication patterns, tools, cognitive rhythms. This powers every conversation.
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {["Persistent insight profile", "Communication style modelling", "Tool & workflow mapping", "Context that compounds over time"].map((item) => (
                  <li key={item} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, fontSize: 14, color: "#a1a1aa" }}>
                    <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#f97316", flexShrink: 0 }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom statement */}
          <div style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 16, padding: 40, textAlign: "center",
          }}>
            <h3 className="serif-italic" style={{ fontSize: 28, color: "#fff", lineHeight: 1.4, marginBottom: 8 }}>
              An AI that doesn&apos;t need you to explain yourself.
            </h3>
            <p style={{ fontSize: 16, color: "#52525b" }}>Because it was already paying attention.</p>
          </div>
        </div>
      </section>

      {/* ─── VIDEO ──────────────────────────────────────── */}
      <section className="sec-pad" style={{ background: "#030305", padding: "120px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <p ref={ref(13)} className="fade-anim" style={{ fontSize: 11, color: "#52525b", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 16 }}>
            See It In Action
          </p>
          <h2 ref={ref(14)} className="fade-anim serif-italic" style={{ fontSize: "clamp(32px,4vw,48px)", color: "#fff", marginBottom: 12 }}>
            Watch Zyph learn.
          </h2>
          <p ref={ref(15)} className="fade-anim" style={{ fontSize: 16, color: "#71717a", marginBottom: 48 }}>
            Watch Zyph learn and adapt in real time.
          </p>
          <div ref={ref(16)} className="fade-anim" style={{
            width: "100%", aspectRatio: "16/9",
            borderRadius: 16, overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.08)",
          }}>
            <iframe
              style={{ width: "100%", height: "100%", display: "block" }}
              src="https://www.youtube.com/embed/nsGnxbgrk14"
              title="See it in action"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      {/* ─── TRACTION ───────────────────────────────────── */}
      <section className="sec-pad" style={{ background: "#050508", padding: "120px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <p ref={ref(17)} className="fade-anim" style={{ fontSize: 11, color: "#52525b", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 16 }}>
            Traction
          </p>
          <h2 ref={ref(18)} className="fade-anim serif-italic" style={{
            fontSize: "clamp(32px,4vw,48px)", color: "#fff", marginBottom: 64,
          }}>
            Built. Shipped. Working.
          </h2>

          <div
            ref={statRef}
            className="stats-row"
            style={{ display: "flex", alignItems: "stretch", justifyContent: "center" }}
          >
            {[
              { value: statVisible ? `${counts.infinity}+` : "847+", label: "screen captures analysed" },
              { value: "3",   label: "tiers: Free, Pro, Mirror",      mid: true },
              { value: "30s", label: "capture interval, fully passive" },
            ].map(({ value, label, mid }) => (
              <div
                key={label}
                style={{
                  flex: 1, padding: "0 48px", textAlign: "center",
                  borderLeft:  mid ? "1px solid rgba(255,255,255,0.08)" : "none",
                  borderRight: mid ? "1px solid rgba(255,255,255,0.08)" : "none",
                }}
              >
                <p className="serif-italic" style={{ fontSize: "clamp(48px,6vw,72px)", color: "#fff", lineHeight: 1, marginBottom: 12 }}>
                  {value}
                </p>
                <p style={{ fontSize: 14, color: "#71717a" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DOWNLOAD CTA ───────────────────────────────── */}
      <section id="download" className="sec-pad" style={{
        background: "#030305", padding: "160px 24px",
        textAlign: "center", position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          width: 600, height: 400,
          background: "radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%)",
          pointerEvents: "none", zIndex: 0,
        }} />

        <div style={{ position: "relative", zIndex: 10 }}>
          <p ref={ref(19)} className="fade-anim" style={{ fontSize: 11, color: "#52525b", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 16 }}>
            Get Started
          </p>
          <h2 ref={ref(20)} className="fade-anim serif-italic" style={{
            fontSize: "clamp(48px,6vw,72px)", color: "#fff",
            lineHeight: 1.05, marginBottom: 16,
          }}>
            Meet the AI that
            <br />gets you.
          </h2>
          <p ref={ref(21)} className="fade-anim" style={{
            fontSize: 18, color: "#71717a", marginBottom: 48,
            maxWidth: 400, marginLeft: "auto", marginRight: "auto", lineHeight: 1.65,
          }}>
            Download the desktop app and let Zyph start learning. Free to start, no card required.
          </p>

          <Link href={DL_URL} className="btn-primary" style={{
            padding: "16px 36px", fontSize: 16,
            boxShadow: "0 0 40px rgba(99,102,241,0.3)",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
              <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
            </svg>
            Download for Windows
          </Link>

          <div style={{ marginTop: 20 }}>
            <Link href="/auth" style={{ fontSize: 14, color: "#6366f1", textDecoration: "none" }}>
              Also available on web →
            </Link>
          </div>

          <p style={{ fontSize: 13, color: "#3f3f46", marginTop: 32 }}>
            Windows may show a security warning — click More info → Run anyway.
          </p>
        </div>
      </section>

      {/* ─── FOOTER ─────────────────────────────────────── */}
      <footer className="nav-pad" style={{
        background: "#030305",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        padding: "0 48px", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <span className="serif-italic" style={{ fontSize: 18, color: "#fff" }}>Zyph</span>
          </Link>
          <span style={{ fontSize: 13, color: "#3f3f46", marginLeft: 16 }}>
            © 2025 Zyph. All rights reserved.
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {[
            { href: "/privacy", label: "Privacy" },
            { href: "/terms",   label: "Terms" },
            { href: "/auth",    label: "Sign In" },
          ].map(({ href, label }) => (
            <Link key={href} href={href} className="footer-link" style={{ fontSize: 13, color: "#52525b" }}>
              {label}
            </Link>
          ))}
        </div>
      </footer>
    </>
  );
}
