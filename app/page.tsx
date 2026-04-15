"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
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
      { threshold: 0.15, rootMargin: "0px 0px -80px 0px" }
    );
    sectionRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const statEl = statRef.current;
    if (!statEl) return;
    const io = new IntersectionObserver(
      (entries) => { if (entries[0]?.isIntersecting) setStatVisible(true); },
      { threshold: 0.3 }
    );
    io.observe(statEl);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!statVisible) return;
    const targets = { weeks: 4, prompts: 0, infinity: 999 };
    const steps = 30;
    const stepMs = 40;
    let step = 0;
    const t = setInterval(() => {
      step++;
      setCounts({
        weeks: Math.min(Math.round((targets.weeks * step) / steps), 4),
        prompts: 0,
        infinity: Math.min(Math.round((999 * step) / steps), 999),
      });
      if (step >= steps) clearInterval(t);
    }, stepMs);
    return () => clearInterval(t);
  }, [statVisible]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');

        html { scroll-behavior: smooth; }

        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(-8px); }
        }

        .hero-anim {
          opacity: 0;
          animation: heroFadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .section-anim {
          opacity: 0;
          transform: translateY(22px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .section-anim.section-visible { opacity: 1; transform: translateY(0); }

        .btn-dl {
          display: inline-flex; align-items: center; gap: 8px;
          transition: opacity 0.18s ease, transform 0.18s ease;
        }
        .btn-dl:hover { opacity: 0.85; transform: scale(1.025); }

        .btn-ghost {
          transition: background 0.18s ease, transform 0.18s ease;
        }
        .btn-ghost:hover { background: rgba(255,255,255,0.07) !important; transform: scale(1.025); }

        .nav-link {
          transition: color 0.15s ease;
        }
        .nav-link:hover { color: #fafafa !important; }

        .footer-link {
          transition: color 0.15s ease;
        }
        .footer-link:hover { color: #fafafa !important; }

        .stat-card {
          transition: border-color 0.2s ease;
        }
        .stat-card:hover { border-color: rgba(99,102,241,0.25) !important; }

        .feature-card {
          transition: border-color 0.2s ease, transform 0.2s ease;
        }
        .feature-card:hover { transform: translateY(-3px); border-color: rgba(255,255,255,0.12) !important; }

        .mockup-float {
          animation: float 6s ease-in-out infinite;
        }

        .instrument { font-family: 'Instrument Serif', Georgia, serif; }
        .instrument-italic { font-family: 'Instrument Serif', Georgia, serif; font-style: italic; }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        height: 56,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 40px",
        background: "rgba(4,4,4,0.85)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 5, textDecoration: "none", flexShrink: 0 }}>
          <span style={{
            fontFamily: "var(--font-sans), sans-serif",
            fontWeight: 700, fontSize: 20, color: "#fff", letterSpacing: "-0.025em",
          }}>
            Zyph
          </span>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "#6366f1", display: "inline-block", marginBottom: 10,
          }} />
        </Link>

        {/* Center nav — hidden on mobile */}
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <Link href="/pricing" className="nav-link" style={{ fontSize: 14, color: "#71717a", textDecoration: "none", fontWeight: 400 }}>
            Pricing
          </Link>
          <Link href="#features" className="nav-link" style={{ fontSize: 14, color: "#71717a", textDecoration: "none", fontWeight: 400 }}>
            Features
          </Link>
          <Link href="/auth" className="nav-link" style={{ fontSize: 14, color: "#71717a", textDecoration: "none", fontWeight: 400 }}>
            Sign in
          </Link>
        </div>

        {/* Right CTAs */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <Link
            href="/auth"
            className="nav-link"
            style={{ fontSize: 14, color: "#71717a", textDecoration: "none", fontWeight: 400, padding: "6px 4px" }}
          >
            Sign in
          </Link>
          <Link
            href="https://github.com/EireScales/UseZyph/releases/download/v1.0.0/Zyph.Setup.1.0.0.exe"
            className="btn-dl"
            style={{
              padding: "8px 18px", borderRadius: 99,
              background: "#6366f1", color: "#fff",
              fontWeight: 600, fontSize: 13, letterSpacing: "-0.01em",
              textDecoration: "none",
            }}
          >
            Download
          </Link>
        </div>
      </nav>

      <main>

        {/* ── HERO ── */}
        <section style={{
          minHeight: "100vh",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start",
          paddingTop: 140, paddingBottom: 80, paddingLeft: 24, paddingRight: 24,
          background: "#040404",
          position: "relative", overflow: "hidden",
        }}>
          {/* Radial indigo glow */}
          <div style={{
            position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
            width: "80%", height: "60%",
            background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.35) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />
          {/* Grid overlay */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, transparent 1px, transparent 72px, rgba(255,255,255,0.03) 72px), repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, transparent 1px, transparent 72px, rgba(255,255,255,0.03) 72px)",
            pointerEvents: "none",
          }} />

          {/* Badge */}
          <div className="hero-anim" style={{ animationDelay: "0.05s", position: "relative", marginBottom: 40 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 16px", borderRadius: 99,
              border: "1px solid rgba(99,102,241,0.3)",
              background: "rgba(99,102,241,0.08)",
            }}>
              <span style={{
                fontSize: 12, fontWeight: 500, color: "#818cf8",
                letterSpacing: "0.06em", textTransform: "uppercase",
              }}>
                Personal AI · Now in Beta
              </span>
            </div>
          </div>

          {/* H1 */}
          <h1
            className="hero-anim instrument-italic"
            style={{
              animationDelay: "0.15s",
              fontSize: "clamp(52px, 8vw, 96px)",
              color: "#fff",
              lineHeight: 1.05,
              letterSpacing: "-1px",
              textAlign: "center",
              maxWidth: 900,
              marginBottom: 24,
              position: "relative",
            }}
          >
            The AI that was
            <br />
            already paying{" "}
            <span style={{ color: "#6366f1" }}>attention.</span>
          </h1>

          {/* Subtext */}
          <p
            className="hero-anim"
            style={{
              animationDelay: "0.25s",
              fontSize: 17, color: "#71717a",
              maxWidth: 500, textAlign: "center",
              lineHeight: 1.7, marginBottom: 40,
              position: "relative",
            }}
          >
            Zyph runs silently in the background, learns how you work, and builds a permanent intelligence profile. No setup. No prompts.
          </p>

          {/* CTAs */}
          <div
            className="hero-anim"
            style={{
              animationDelay: "0.35s",
              display: "flex", flexWrap: "wrap", gap: 12,
              justifyContent: "center", marginBottom: 20,
              position: "relative",
            }}
          >
            <Link
              href="https://github.com/EireScales/UseZyph/releases/download/v1.0.0/Zyph.Setup.1.0.0.exe"
              className="btn-dl"
              style={{
                padding: "14px 28px", borderRadius: 99,
                background: "#6366f1", color: "#fff",
                fontWeight: 600, fontSize: 15, letterSpacing: "-0.01em",
                textDecoration: "none", whiteSpace: "nowrap",
              }}
            >
              {/* Windows icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white" style={{ flexShrink: 0 }}>
                <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
              </svg>
              Download for Windows
            </Link>
            <Link
              href="/auth"
              className="btn-ghost"
              style={{
                padding: "14px 28px", borderRadius: 99,
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#fff",
                fontWeight: 500, fontSize: 15,
                textDecoration: "none", whiteSpace: "nowrap",
              }}
            >
              Sign in free →
            </Link>
          </div>

          {/* Trust row */}
          <div
            className="hero-anim"
            style={{
              animationDelay: "0.45s",
              display: "flex", flexWrap: "wrap", gap: 24,
              justifyContent: "center", marginBottom: 80,
              fontSize: 13, color: "#52525b",
              position: "relative",
            }}
          >
            <span>✦ Free to start</span>
            <span>✦ No credit card</span>
            <span>✦ Works in background</span>
          </div>

          {/* Floating dashboard mockup */}
          <div
            className="hero-anim mockup-float"
            style={{
              animationDelay: "0.55s",
              width: "100%", maxWidth: 900,
              position: "relative",
              boxShadow: "0 0 120px rgba(99,102,241,0.15)",
              borderRadius: 20,
            }}
          >
            <div style={{
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 20, overflow: "hidden",
            }}>
              {/* Browser chrome */}
              <div style={{
                height: 40, background: "#0a0a0a",
                display: "flex", alignItems: "center",
                padding: "0 16px", gap: 8,
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}>
                <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#333", flexShrink: 0 }} />
                <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#333", flexShrink: 0 }} />
                <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#333", flexShrink: 0 }} />
                <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
                  <span style={{
                    background: "#141414", borderRadius: 6,
                    padding: "3px 14px", fontSize: 11, color: "#555",
                    fontFamily: "var(--font-mono), monospace",
                  }}>
                    usezyph.com/dashboard
                  </span>
                </div>
              </div>

              {/* Dashboard body */}
              <div style={{ background: "#080808", padding: "28px 28px 24px" }}>
                {/* Top bar */}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  marginBottom: 20,
                }}>
                  <h3 style={{
                    fontFamily: "var(--font-sans), sans-serif",
                    fontWeight: 700, fontSize: 22, color: "#fff", letterSpacing: "-0.02em",
                  }}>
                    Good evening, Professor
                  </h3>
                  <span style={{
                    fontSize: 13, color: "#555",
                    fontFamily: "var(--font-mono), monospace",
                  }}>
                    11:47 PM
                  </span>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: "#141414", marginBottom: 16 }} />

                {/* Green plan banner */}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: "rgba(34,197,94,0.08)",
                  border: "1px solid rgba(34,197,94,0.2)",
                  borderRadius: 10, padding: "10px 16px",
                  marginBottom: 20,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: "#86efac" }}>
                      You&apos;re on the Mirror plan — unlimited captures enabled.
                    </span>
                  </div>
                  <span style={{ fontSize: 12, color: "#4ade80", whiteSpace: "nowrap", marginLeft: 16, cursor: "pointer" }}>
                    Manage plan →
                  </span>
                </div>

                {/* Stat cards */}
                <div style={{
                  display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10,
                  marginBottom: 16,
                }}>
                  {[
                    { label: "Total Observations", value: "847",    accent: "#6366f1" },
                    { label: "Days Active",         value: "23",     accent: "#f97316" },
                    { label: "Insights Generated",  value: "31",     accent: "#f59e0b" },
                    { label: "Top App Used",         value: "Cursor", accent: "#22c55e" },
                  ].map(({ label, value, accent }) => (
                    <div key={label} style={{
                      background: "#0e0e0e",
                      border: `1px solid #1a1a1a`,
                      borderLeft: `2px solid ${accent}`,
                      borderRadius: 10, padding: "14px 14px 16px",
                    }}>
                      <p style={{ fontSize: 11, color: "#555", marginBottom: 8 }}>{label}</p>
                      <p style={{ fontSize: 20, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* Bottom two-col */}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10 }}>
                  {/* Recent activity */}
                  <div style={{
                    background: "#0e0e0e", border: "1px solid #1a1a1a",
                    borderRadius: 10, padding: "16px",
                  }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 14 }}>Recent Activity</p>
                    {[
                      { app: "Cursor",  summary: "Worked on authentication flow, reviewed 3 PRs" },
                      { app: "Chrome",  summary: "Researched Next.js 15 deployment patterns" },
                      { app: "Slack",   summary: "Responded to 6 messages, team standup notes" },
                    ].map(({ app, summary }) => (
                      <div key={app} style={{
                        display: "flex", gap: 10, alignItems: "flex-start",
                        paddingBottom: 10, marginBottom: 10,
                        borderBottom: "1px solid #141414",
                      }}>
                        <span style={{
                          fontSize: 10, fontWeight: 600, color: "#6366f1",
                          background: "rgba(99,102,241,0.12)",
                          padding: "2px 7px", borderRadius: 4, flexShrink: 0, marginTop: 1,
                        }}>
                          {app}
                        </span>
                        <p style={{ fontSize: 12, color: "#555", lineHeight: 1.5 }}>{summary}</p>
                      </div>
                    ))}
                  </div>

                  {/* Chat card */}
                  <div style={{
                    borderRadius: 10, padding: "20px",
                    background: "linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(99,102,241,0.06) 100%)",
                    border: "1px solid rgba(99,102,241,0.25)",
                    display: "flex", flexDirection: "column", justifyContent: "space-between",
                  }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 8 }}>Chat with Zyph</p>
                      <p style={{ fontSize: 12, color: "#71717a", lineHeight: 1.6 }}>
                        Ask anything. Your full profile is already loaded.
                      </p>
                    </div>
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      padding: "9px 16px", borderRadius: 99, marginTop: 20,
                      background: "#6366f1", cursor: "pointer",
                    }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Open Chat →</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── MARQUEE ── */}
        <section style={{
          background: "#060606",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          padding: "16px 0",
          overflow: "hidden",
        }}>
          <div style={{ display: "flex", width: "max-content", animation: "marquee 28s linear infinite" }}>
            {[...Array(16)].map((_, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, padding: "0 40px", opacity: 0.2 }}>
                <svg width="20" height="20" viewBox="0 0 100 100" fill="none">
                  <circle cx="50" cy="50" r="26" stroke="#6366f1" strokeWidth="5" opacity="0.4" />
                  <circle cx="50" cy="50" r="16" stroke="#6366f1" strokeWidth="5" opacity="0.7" />
                  <circle cx="50" cy="50" r="7" fill="#6366f1" />
                  <line x1="50" y1="16" x2="50" y2="10" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
                  <line x1="50" y1="84" x2="50" y2="90" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
                  <line x1="16" y1="50" x2="10" y2="50" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
                  <line x1="84" y1="50" x2="90" y2="50" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
                </svg>
                <span style={{
                  fontFamily: "var(--font-sans), sans-serif",
                  fontSize: 14, fontWeight: 700, color: "#6366f1", letterSpacing: "-0.01em",
                }}>
                  Zyph
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── PROBLEM ── */}
        <section style={{ background: "#040404", padding: "128px 40px" }}>
          <div style={{
            maxWidth: 1100, margin: "0 auto",
            display: "flex", flexWrap: "wrap", gap: 80, alignItems: "flex-start",
          }}>
            {/* Left */}
            <div style={{ flex: "1 1 360px" }}>
              <p style={{
                fontSize: 11, fontWeight: 600, letterSpacing: "0.14em",
                color: "#52525b", textTransform: "uppercase", marginBottom: 28,
              }}>
                The Problem
              </p>
              <h2
                ref={(el) => { sectionRefs.current[0] = el; }}
                className="section-anim instrument-italic"
                style={{
                  fontSize: "clamp(36px, 4.5vw, 56px)",
                  color: "#fff", lineHeight: 1.1,
                  marginBottom: 20,
                }}
              >
                Every AI you use forgets you exist.
              </h2>
              <p style={{
                fontSize: 28, fontStyle: "italic", fontFamily: "'Instrument Serif', Georgia, serif",
                color: "#f97316", marginBottom: 28,
              }}>
                Every. Single. Session.
              </p>
              <p style={{ fontSize: 16, color: "#71717a", maxWidth: 480, lineHeight: 1.8 }}>
                You explain your role, your tools, your preferences — then close the tab. Tomorrow, you start from zero again. ChatGPT doesn&apos;t remember you. Claude doesn&apos;t know your style.
              </p>
            </div>

            {/* Right — stats */}
            <div ref={statRef} style={{ flex: "1 1 260px" }}>
              {[
                {
                  value: statVisible ? `2–${counts.weeks} weeks` : "2–4 weeks",
                  label: "to build your complete profile",
                },
                { value: "0 prompts", label: "needed to get started" },
                { value: "∞",        label: "context retained, permanently" },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className="stat-card"
                  style={{
                    padding: "28px 4px",
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    borderBottom: i === 2 ? "1px solid rgba(255,255,255,0.06)" : "none",
                  }}
                >
                  <p className="instrument-italic" style={{
                    fontSize: 48, color: "#fff", lineHeight: 1,
                    marginBottom: 8, letterSpacing: "-1px",
                  }}>
                    {stat.value}
                  </p>
                  <p style={{ fontSize: 14, color: "#71717a" }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHAT IS ZYPH ── */}
        <section style={{ background: "#060606", padding: "128px 40px" }}>
          <div style={{ maxWidth: 1040, margin: "0 auto" }}>
            <p style={{
              textAlign: "center", fontSize: 11, fontWeight: 600,
              letterSpacing: "0.14em", color: "#52525b",
              textTransform: "uppercase", marginBottom: 28,
            }}>
              What is Zyph?
            </p>

            <div
              ref={(el) => { sectionRefs.current[1] = el; }}
              className="section-anim"
              style={{ textAlign: "center", marginBottom: 20 }}
            >
              <h2 className="instrument-italic" style={{
                fontSize: "clamp(30px, 4vw, 52px)",
                color: "#fff", lineHeight: 1.15, letterSpacing: "-0.5px",
              }}>
                Zyph ={" "}
                <span style={{ color: "#6366f1" }}>Personal Data Engine</span>
                <span style={{ color: "#3f3f46" }}> + </span>
                <span style={{ color: "#f97316" }}>Behavioural Memory Layer</span>
              </h2>
            </div>

            <p style={{
              textAlign: "center", fontSize: 17, color: "#71717a",
              maxWidth: 580, margin: "0 auto 64px", lineHeight: 1.7,
            }}>
              Most AI tools give you a blank canvas every session. Zyph gives you an AI that has been silently studying you — your patterns, your tools, your language, your pace — and remembers all of it.
            </p>

            {/* Two pillars */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginBottom: 16 }}>
              {/* Indigo card */}
              <div
                className="feature-card"
                style={{
                  background: "#0a0a0e",
                  border: "1px solid rgba(99,102,241,0.2)",
                  borderRadius: 20, padding: 32,
                  position: "relative", overflow: "hidden",
                }}
              >
                <div style={{
                  position: "absolute", top: -80, right: -80,
                  width: 200, height: 200, borderRadius: "50%",
                  background: "#6366f1", opacity: 0.04, filter: "blur(60px)",
                }} />
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "4px 12px", borderRadius: 99,
                  background: "rgba(99,102,241,0.12)",
                  marginBottom: 24,
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#6366f1" }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#818cf8", letterSpacing: "0.04em" }}>
                    Personal Data Engine
                  </span>
                </div>
                <h3 style={{
                  fontFamily: "var(--font-sans), sans-serif",
                  fontWeight: 700, fontSize: 22, color: "#fff",
                  letterSpacing: "-0.02em", marginBottom: 14,
                }}>
                  It observes. Constantly.
                </h3>
                <p style={{ fontSize: 15, color: "#71717a", lineHeight: 1.7, marginBottom: 28 }}>
                  Every 30 seconds, Zyph silently reads your screen — every app, every document, every browser tab. It doesn&apos;t interrupt. It doesn&apos;t ask. It simply watches and extracts signal from noise.
                </p>
                <ul style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {["Screen-level context capture", "OCR across every application", "App usage & behavioural patterns", "Structured, categorised memory"].map((item) => (
                    <li key={item} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#a1a1aa" }}>
                      <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#6366f1", flexShrink: 0 }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Orange card */}
              <div
                className="feature-card"
                style={{
                  background: "#0a0a0e",
                  border: "1px solid rgba(249,115,22,0.2)",
                  borderRadius: 20, padding: 32,
                  position: "relative", overflow: "hidden",
                }}
              >
                <div style={{
                  position: "absolute", top: -80, right: -80,
                  width: 200, height: 200, borderRadius: "50%",
                  background: "#f97316", opacity: 0.04, filter: "blur(60px)",
                }} />
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "4px 12px", borderRadius: 99,
                  background: "rgba(249,115,22,0.12)",
                  marginBottom: 24,
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#f97316" }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#fb923c", letterSpacing: "0.04em" }}>
                    Behavioural Memory Layer
                  </span>
                </div>
                <h3 style={{
                  fontFamily: "var(--font-sans), sans-serif",
                  fontWeight: 700, fontSize: 22, color: "#fff",
                  letterSpacing: "-0.02em", marginBottom: 14,
                }}>
                  It remembers. Everything.
                </h3>
                <p style={{ fontSize: 15, color: "#71717a", lineHeight: 1.7, marginBottom: 28 }}>
                  Observations are distilled into a living intelligence profile — your work style, communication patterns, tools, interests, and cognitive rhythms. This profile powers every conversation, permanently.
                </p>
                <ul style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {["Persistent insight profile", "Communication style modelling", "Tool & workflow mapping", "Context that compounds over time"].map((item) => (
                    <li key={item} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#a1a1aa" }}>
                      <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#f97316", flexShrink: 0 }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom statement */}
            <div style={{
              background: "#0e0e0e",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 20, padding: "40px 48px",
              textAlign: "center",
            }}>
              <p style={{
                fontSize: 11, fontWeight: 600, letterSpacing: "0.14em",
                color: "#52525b", textTransform: "uppercase", marginBottom: 20,
              }}>
                The Result
              </p>
              <p className="instrument-italic" style={{
                fontSize: "clamp(20px, 2.5vw, 28px)",
                color: "#fff", lineHeight: 1.3,
              }}>
                An AI that doesn&apos;t need you to explain yourself.{" "}
                <span style={{ color: "#52525b" }}>Because it was already paying attention.</span>
              </p>
            </div>
          </div>
        </section>

        {/* ── VIDEO ── */}
        <section style={{ background: "#040404", padding: "96px 40px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
            <h2
              ref={(el) => { sectionRefs.current[7] = el; }}
              className="section-anim instrument-italic"
              style={{
                fontSize: "clamp(32px, 4vw, 48px)",
                color: "#fff", marginBottom: 16,
              }}
            >
              See it in action
            </h2>
            <p
              ref={(el) => { sectionRefs.current[8] = el; }}
              className="section-anim"
              style={{ fontSize: 16, color: "#71717a", marginBottom: 48 }}
            >
              Watch Zyph learn and adapt in real time.
            </p>
            <div style={{
              borderRadius: 20, overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.08)",
              aspectRatio: "16 / 9", width: "100%",
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

        {/* ── FEATURES ── */}
        <section id="features" style={{ background: "#060606", padding: "128px 40px" }}>
          <div style={{ maxWidth: 1040, margin: "0 auto" }}>
            <h2
              ref={(el) => { sectionRefs.current[11] = el; }}
              className="section-anim instrument-italic"
              style={{
                fontSize: "clamp(32px, 4vw, 48px)",
                color: "#fff", textAlign: "center", marginBottom: 60,
              }}
            >
              Built for people who move fast
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
              {[
                {
                  icon: "🧠",
                  title: "Writes in your voice",
                  body: "Emails, Slack messages, proposals. All sound exactly like you.",
                },
                {
                  icon: "⚡",
                  title: "Zero setup",
                  body: "No prompts, no onboarding questionnaires. Just install and work normally.",
                },
                {
                  icon: "🔒",
                  title: "Private by design",
                  body: "Your data is yours. Processed securely, never sold, never shared.",
                },
              ].map((f, i) => (
                <div
                  key={f.title}
                  ref={(el) => { sectionRefs.current[12 + i] = el; }}
                  className="section-anim feature-card"
                  style={{
                    background: "#0a0a0a",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 20, padding: 32,
                  }}
                >
                  <span style={{ fontSize: 32, display: "block", marginBottom: 24 }}>{f.icon}</span>
                  <h3 style={{
                    fontFamily: "var(--font-sans), sans-serif",
                    fontWeight: 700, fontSize: 20, color: "#fff",
                    letterSpacing: "-0.02em", marginBottom: 14,
                  }}>
                    {f.title}
                  </h3>
                  <p style={{ fontSize: 15, color: "#71717a", lineHeight: 1.7 }}>{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── DOWNLOAD CTA ── */}
        <section id="download" style={{
          background: "linear-gradient(to bottom, #040404, #080818)",
          padding: "128px 40px",
          position: "relative", overflow: "hidden",
          textAlign: "center",
        }}>
          {/* Radial glow */}
          <div style={{
            position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
            width: 700, height: 400,
            background: "radial-gradient(ellipse at center, rgba(99,102,241,0.18) 0%, transparent 65%)",
            pointerEvents: "none",
          }} />

          <div style={{ maxWidth: 700, margin: "0 auto", position: "relative" }}>
            <h2
              ref={(el) => { sectionRefs.current[9] = el; }}
              className="section-anim instrument-italic"
              style={{
                fontSize: "clamp(40px, 6vw, 64px)",
                color: "#fff", lineHeight: 1.05,
                letterSpacing: "-1px", marginBottom: 24,
              }}
            >
              Meet the AI that gets you.
            </h2>
            <p style={{ fontSize: 18, color: "#71717a", marginBottom: 48, lineHeight: 1.65 }}>
              Download the desktop app and let Zyph start learning. Free to start.
            </p>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <Link
                href="https://github.com/EireScales/UseZyph/releases/download/v1.0.0/Zyph.Setup.1.0.0.exe"
                className="btn-dl"
                style={{
                  padding: "16px 40px", borderRadius: 99,
                  background: "#6366f1", color: "#fff",
                  fontWeight: 600, fontSize: 16, letterSpacing: "-0.01em",
                  textDecoration: "none",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white" style={{ flexShrink: 0 }}>
                  <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
                </svg>
                Download Desktop App
              </Link>

              <p style={{ fontSize: 12, color: "#3f3f46", maxWidth: 400, lineHeight: 1.7 }}>
                Windows may show a security warning on first install — click{" "}
                <span style={{ color: "#71717a" }}>&quot;More info&quot; → &quot;Run anyway&quot;</span>{" "}
                to proceed. This is normal for new apps.
              </p>

              <Link
                href="/auth"
                style={{ fontSize: 14, fontWeight: 500, color: "#6366f1", textDecoration: "none" }}
              >
                Also available on web →
              </Link>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{
          background: "#040404",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          height: 72,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 48px",
          flexWrap: "wrap", gap: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 4, textDecoration: "none" }}>
              <span style={{
                fontFamily: "var(--font-sans), sans-serif",
                fontWeight: 700, fontSize: 16, color: "#fff", letterSpacing: "-0.02em",
              }}>
                Zyph
              </span>
              <span style={{
                width: 5, height: 5, borderRadius: "50%",
                background: "#6366f1", display: "inline-block", marginBottom: 8,
              }} />
            </Link>
            <span style={{ fontSize: 13, color: "#52525b", marginLeft: 14 }}>© 2025 Zyph</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            {[
              { href: "/privacy", label: "Privacy" },
              { href: "/terms",   label: "Terms" },
              { href: "/auth",    label: "Sign In" },
            ].map(({ href, label }) => (
              <Link key={href} href={href} className="footer-link" style={{ fontSize: 13, color: "#52525b", textDecoration: "none" }}>
                {label}
              </Link>
            ))}
          </div>
        </footer>

      </main>
    </>
  );
}
