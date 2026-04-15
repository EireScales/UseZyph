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
        html { scroll-behavior: smooth; }

        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        .hero-anim { opacity: 0; animation: heroFadeUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards; }

        .section-anim {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.55s ease, transform 0.55s ease;
        }
        .section-anim.section-visible { opacity: 1; transform: translateY(0); }

        .btn-primary  { transition: opacity 0.18s ease, transform 0.18s ease; }
        .btn-primary:hover  { opacity: 0.88; transform: scale(1.02); }
        .btn-secondary { transition: background 0.18s ease, transform 0.18s ease; }
        .btn-secondary:hover { background: rgba(255,255,255,0.06); transform: scale(1.02); }

        .card-hover { transition: border-color 0.2s ease, transform 0.2s ease; }
        .card-hover:hover { border-color: #333333 !important; transform: translateY(-2px); }
      `}</style>

      <div style={{ background: "var(--bg)", color: "var(--text-1)", minHeight: "100vh" }}>

        {/* ── NAVBAR ── */}
        <nav style={{
          position: "sticky", top: 0, zIndex: 50,
          height: 56,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 40px",
          background: "rgba(8,8,8,0.8)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border)",
        }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 4, textDecoration: "none" }}>
            <span style={{ fontFamily: "var(--font-sans), sans-serif", fontWeight: 700, fontSize: 18, color: "var(--text-1)", letterSpacing: "-0.02em" }}>
              Zyph
            </span>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--primary)", display: "inline-block", marginBottom: 8 }} />
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <Link href="/auth" style={{ fontSize: 13, color: "var(--text-2)", textDecoration: "none", fontWeight: 500 }}>
              Sign in
            </Link>
            <Link
              href="/auth"
              className="btn-primary"
              style={{
                fontSize: 13, fontWeight: 600, color: "#fff",
                background: "var(--primary)",
                padding: "7px 16px", borderRadius: 99,
                textDecoration: "none", letterSpacing: "-0.01em",
              }}
            >
              Get started
            </Link>
          </div>
        </nav>

        <main>

          {/* ── HERO ── */}
          <section style={{
            minHeight: "calc(100vh - 56px)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            padding: "80px 24px 64px",
            background: "var(--bg)",
          }}>

            {/* Beta pill */}
            <div
              className="hero-anim"
              style={{
                animationDelay: "0.05s",
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "5px 14px", borderRadius: 99,
                border: "1px solid rgba(99,102,241,0.35)",
                background: "rgba(99,102,241,0.07)",
                marginBottom: 36,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--primary)" }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--primary)", letterSpacing: "0.04em" }}>
                NOW IN BETA
              </span>
            </div>

            {/* H1 */}
            <h1
              className="hero-anim"
              style={{
                animationDelay: "0.15s",
                fontFamily: "var(--font-sans), sans-serif",
                fontWeight: 800,
                fontSize: "clamp(48px, 7vw, 80px)",
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
                textAlign: "center",
                maxWidth: 760,
                marginBottom: 28,
                color: "var(--text-1)",
              }}
            >
              Your AI that
              <br />
              <span style={{ color: "var(--primary)" }}>actually knows you.</span>
            </h1>

            {/* Subheading */}
            <p
              className="hero-anim"
              style={{
                animationDelay: "0.25s",
                fontSize: 18,
                color: "var(--text-2)",
                textAlign: "center",
                maxWidth: 480,
                lineHeight: 1.65,
                marginBottom: 44,
              }}
            >
              Zyph watches how you work and builds a personal AI profile — so every conversation starts where you left off.
            </p>

            {/* CTAs */}
            <div
              className="hero-anim"
              style={{
                animationDelay: "0.35s",
                display: "flex", flexWrap: "wrap", gap: 12,
                justifyContent: "center", marginBottom: 28,
              }}
            >
              <Link
                href="https://github.com/EireScales/UseZyph/releases/download/v1.0.0/Zyph.Setup.1.0.0.exe"
                className="btn-primary"
                style={{
                  padding: "14px 28px", borderRadius: 99,
                  background: "var(--primary)", color: "#fff",
                  fontWeight: 600, fontSize: 15, letterSpacing: "-0.01em",
                  textDecoration: "none", whiteSpace: "nowrap",
                }}
              >
                Download for Windows
              </Link>
              <Link
                href="/auth"
                className="btn-secondary"
                style={{
                  padding: "14px 28px", borderRadius: 99,
                  background: "transparent",
                  border: "1px solid var(--border-hover)",
                  color: "var(--text-1)",
                  fontWeight: 600, fontSize: 15, letterSpacing: "-0.01em",
                  textDecoration: "none", whiteSpace: "nowrap",
                }}
              >
                Sign in free
              </Link>
            </div>

            {/* Trust pills */}
            <div
              className="hero-anim"
              style={{
                animationDelay: "0.45s",
                display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center",
                marginBottom: 72,
              }}
            >
              {["Free to start", "No credit card", "Works in background"].map((t) => (
                <span key={t} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-2)" }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="6.5" stroke="var(--border-hover)" />
                    <path d="M4 7l2 2 4-4" stroke="var(--success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {t}
                </span>
              ))}
            </div>

            {/* Chat mockup */}
            <div className="hero-anim" style={{ animationDelay: "0.55s", width: "100%", maxWidth: 820, display: "none" }} id="hero-mockup-desktop">
            </div>
            <div
              className="hero-anim"
              style={{
                animationDelay: "0.55s",
                width: "100%", maxWidth: 820,
              }}
            >
              <div style={{
                borderRadius: 16,
                border: "1px solid var(--border)",
                overflow: "hidden",
                background: "var(--card)",
              }}>
                {/* Window chrome */}
                <div style={{
                  padding: "10px 16px",
                  borderBottom: "1px solid var(--border)",
                  display: "flex", alignItems: "center", gap: 8,
                  background: "var(--surface)",
                }}>
                  {["#3d3d3d", "#3d3d3d", "#3d3d3d"].map((c, i) => (
                    <span key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
                  ))}
                </div>

                {/* App interior */}
                <div style={{ display: "flex", minHeight: 340 }}>
                  {/* Sidebar */}
                  <aside style={{
                    width: 168, flexShrink: 0,
                    borderRight: "1px solid var(--border)",
                    padding: "20px 12px",
                  }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)", marginBottom: 24, paddingLeft: 8 }}>Zyph</p>
                    <nav style={{ display: "flex", flexDirection: "column", gap: 2, fontSize: 13 }}>
                      {["Home", "My Profile", "Insights", "Chat", "Settings"].map((item) => (
                        <div
                          key={item}
                          style={{
                            padding: "7px 10px", borderRadius: 8,
                            color: item === "Chat" ? "var(--text-1)" : "var(--text-3)",
                            background: item === "Chat" ? "rgba(99,102,241,0.1)" : "transparent",
                          }}
                        >
                          {item}
                        </div>
                      ))}
                    </nav>
                  </aside>

                  {/* Main chat area */}
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "24px 24px 16px" }}>
                    <p style={{ fontSize: 13, color: "var(--text-3)", textAlign: "center", marginTop: 20, marginBottom: 20 }}>
                      Ask anything. Zyph uses your profile to respond.
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, marginBottom: 24 }}>
                      {["Help me write an email", "What have you learned about me?", "Summarise my week"].map((s) => (
                        <span
                          key={s}
                          style={{
                            padding: "6px 14px", borderRadius: 99, fontSize: 12,
                            color: "var(--text-2)", border: "1px solid var(--border)",
                          }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                    <div style={{ marginTop: "auto" }}>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "10px 12px",
                        borderRadius: 10,
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                      }}>
                        <span style={{ flex: 1, fontSize: 13, color: "var(--text-3)" }}>Message Zyph...</span>
                        <button type="button" style={{
                          width: 32, height: 32, borderRadius: 8, border: "none", cursor: "pointer",
                          background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── MARQUEE ── */}
          <section style={{
            borderTop: "1px solid var(--border)",
            borderBottom: "1px solid var(--border)",
            padding: "18px 0",
            overflow: "hidden",
            background: "var(--surface)",
          }}>
            <div style={{ display: "flex", width: "max-content", animation: "marquee 24s linear infinite" }}>
              {[...Array(16)].map((_, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, padding: "0 36px", opacity: 0.4 }}>
                  <svg width="22" height="22" viewBox="0 0 100 100" fill="none">
                    <circle cx="50" cy="50" r="26" stroke="var(--primary)" strokeWidth="5" opacity="0.4" />
                    <circle cx="50" cy="50" r="16" stroke="var(--primary)" strokeWidth="5" opacity="0.7" />
                    <circle cx="50" cy="50" r="7" fill="var(--primary)" />
                    <line x1="50" y1="16" x2="50" y2="10" stroke="var(--primary)" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
                    <line x1="50" y1="84" x2="50" y2="90" stroke="var(--primary)" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
                    <line x1="16" y1="50" x2="10" y2="50" stroke="var(--primary)" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
                    <line x1="84" y1="50" x2="90" y2="50" stroke="var(--primary)" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
                  </svg>
                  <span style={{
                    fontSize: 13, fontWeight: 700, letterSpacing: "-0.01em",
                    color: "var(--primary)",
                    fontFamily: "var(--font-sans), sans-serif",
                  }}>
                    Zyph
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* ── PROBLEM ── */}
          <section style={{ padding: "100px 40px", background: "var(--bg)" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: 64, alignItems: "flex-start" }}>

              {/* Left — statement */}
              <div style={{ flex: "1 1 340px" }}>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", color: "var(--text-3)", textTransform: "uppercase", marginBottom: 24 }}>
                  The Problem
                </p>
                <h2
                  ref={(el) => { sectionRefs.current[0] = el; }}
                  className="section-anim"
                  style={{
                    fontFamily: "var(--font-sans), sans-serif",
                    fontWeight: 800, fontSize: "clamp(32px, 4vw, 52px)",
                    lineHeight: 1.1, letterSpacing: "-0.03em",
                    color: "var(--text-1)", marginBottom: 20,
                  }}
                >
                  Every AI starts from zero.
                </h2>
                <p style={{
                  fontSize: 22, fontWeight: 800, fontStyle: "italic",
                  color: "var(--accent)", marginBottom: 28,
                  paddingLeft: 16, borderLeft: "3px solid var(--accent)",
                }}>
                  Every. Single. Time.
                </p>
                <p style={{ fontSize: 16, lineHeight: 1.7, color: "var(--text-2)", maxWidth: 460 }}>
                  You explain your role, your context, your preferences — then close the tab. Tomorrow you do it again. ChatGPT doesn&apos;t remember you. Claude doesn&apos;t know your style. You&apos;re always the new hire explaining yourself to a tool that should work for you.
                </p>
              </div>

              {/* Right — stats */}
              <div ref={statRef} style={{ flex: "1 1 240px", display: "flex", flexDirection: "column", gap: 0 }}>
                {[
                  {
                    value: statVisible ? `2–${counts.weeks} weeks` : "2–4 weeks",
                    label: "to build your full profile",
                  },
                  {
                    value: "0",
                    label: "prompts needed to get started",
                  },
                  {
                    value: "∞",
                    label: "context retained over time",
                  },
                ].map((stat, i) => (
                  <div
                    key={stat.label}
                    style={{
                      padding: "28px 0",
                      borderTop: i === 0 ? "1px solid var(--border)" : "1px solid var(--border)",
                      borderBottom: i === 2 ? "1px solid var(--border)" : "none",
                    }}
                  >
                    <p style={{
                      fontFamily: "var(--font-sans), sans-serif",
                      fontWeight: 800, fontSize: 40, letterSpacing: "-0.03em",
                      color: "var(--text-1)", lineHeight: 1,
                      marginBottom: 6,
                    }}>
                      {stat.value}
                    </p>
                    <p style={{ fontSize: 13, color: "var(--text-3)" }}>{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── WHAT IS ZYPH ── */}
          <section style={{ padding: "100px 40px", background: "var(--surface)" }}>
            <div style={{ maxWidth: 1000, margin: "0 auto" }}>

              <p style={{ textAlign: "center", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", color: "var(--text-3)", textTransform: "uppercase", marginBottom: 24 }}>
                WHAT IS ZYPH?
              </p>

              <div
                ref={(el) => { sectionRefs.current[1] = el; }}
                className="section-anim"
                style={{ textAlign: "center", marginBottom: 16 }}
              >
                <h2 style={{
                  fontFamily: "var(--font-sans), sans-serif",
                  fontWeight: 800, fontSize: "clamp(26px, 3.5vw, 44px)",
                  letterSpacing: "-0.03em", lineHeight: 1.15,
                  color: "var(--text-1)",
                }}>
                  Zyph ={" "}
                  <span style={{ color: "var(--primary)" }}>Personal Data Engine</span>
                  <span style={{ color: "var(--text-3)" }}> + </span>
                  <span style={{ color: "var(--accent)" }}>Behavioural Memory Layer</span>
                </h2>
              </div>

              <p style={{
                textAlign: "center", fontSize: 17, color: "var(--text-2)",
                maxWidth: 580, margin: "0 auto 64px", lineHeight: 1.65,
              }}>
                Most AI tools give you a blank canvas every session. Zyph gives you an AI that has been silently studying you — your patterns, your tools, your language, your pace — and remembers all of it.
              </p>

              {/* Two pillars */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 16 }}>

                {/* Pillar 1 — indigo */}
                <div
                  className="card-hover"
                  style={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderTop: "2px solid var(--primary)",
                    borderRadius: "0 0 var(--radius-md) var(--radius-md)",
                    padding: "28px 28px 32px",
                    position: "relative", overflow: "hidden",
                  }}
                >
                  <div style={{
                    position: "absolute", top: -60, right: -60,
                    width: 160, height: 160, borderRadius: "50%",
                    background: "var(--primary)", opacity: 0.05, filter: "blur(40px)",
                  }} />
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "4px 10px", borderRadius: 99,
                    background: "var(--primary-glow)", marginBottom: 20,
                  }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--primary)" }} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: "var(--primary)", letterSpacing: "0.04em" }}>
                      Personal Data Engine
                    </span>
                  </div>
                  <h3 style={{
                    fontFamily: "var(--font-sans), sans-serif",
                    fontWeight: 700, fontSize: 18, color: "var(--text-1)",
                    letterSpacing: "-0.02em", marginBottom: 12,
                  }}>
                    It observes. Constantly.
                  </h3>
                  <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.65, marginBottom: 24 }}>
                    Every 30 seconds, Zyph silently reads your screen — every app, every document, every browser tab. It doesn&apos;t interrupt. It doesn&apos;t ask. It simply watches and extracts signal from noise.
                  </p>
                  <ul style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {["Screen-level context capture", "OCR across every application", "App usage & behavioural patterns", "Structured, categorised memory"].map((item) => (
                      <li key={item} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--text-2)" }}>
                        <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--primary)", flexShrink: 0 }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pillar 2 — orange */}
                <div
                  className="card-hover"
                  style={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderTop: "2px solid var(--accent)",
                    borderRadius: "0 0 var(--radius-md) var(--radius-md)",
                    padding: "28px 28px 32px",
                    position: "relative", overflow: "hidden",
                  }}
                >
                  <div style={{
                    position: "absolute", top: -60, right: -60,
                    width: 160, height: 160, borderRadius: "50%",
                    background: "var(--accent)", opacity: 0.05, filter: "blur(40px)",
                  }} />
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "4px 10px", borderRadius: 99,
                    background: "rgba(249,115,22,0.1)", marginBottom: 20,
                  }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--accent)" }} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: "var(--accent)", letterSpacing: "0.04em" }}>
                      Behavioural Memory Layer
                    </span>
                  </div>
                  <h3 style={{
                    fontFamily: "var(--font-sans), sans-serif",
                    fontWeight: 700, fontSize: 18, color: "var(--text-1)",
                    letterSpacing: "-0.02em", marginBottom: 12,
                  }}>
                    It remembers. Everything.
                  </h3>
                  <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.65, marginBottom: 24 }}>
                    Observations are distilled into a living intelligence profile — your work style, communication patterns, tools, interests, and cognitive rhythms. This profile powers every conversation, permanently.
                  </p>
                  <ul style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {["Persistent insight profile", "Communication style modelling", "Tool & workflow mapping", "Context that compounds over time"].map((item) => (
                      <li key={item} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--text-2)" }}>
                        <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--accent)", flexShrink: 0 }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Result card */}
              <div style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                padding: "36px 40px",
                textAlign: "center",
              }}>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", color: "var(--text-3)", textTransform: "uppercase", marginBottom: 16 }}>
                  The Result
                </p>
                <p style={{
                  fontFamily: "var(--font-sans), sans-serif",
                  fontWeight: 800, fontSize: "clamp(20px, 2.5vw, 30px)",
                  letterSpacing: "-0.025em", lineHeight: 1.25,
                  color: "var(--text-1)",
                }}>
                  An AI that doesn&apos;t need you to explain yourself.
                  <br />
                  <span style={{ color: "var(--text-3)" }}>Because it was already paying attention.</span>
                </p>
              </div>
            </div>
          </section>

          {/* ── HOW IT WORKS ── */}
          <section style={{ padding: "100px 40px", background: "var(--bg)" }}>
            <div style={{ maxWidth: 1000, margin: "0 auto" }}>
              <p style={{ textAlign: "center", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", color: "var(--text-3)", textTransform: "uppercase", marginBottom: 24 }}>
                HOW IT WORKS
              </p>
              <h2
                ref={(el) => { sectionRefs.current[2] = el; }}
                className="section-anim"
                style={{
                  fontFamily: "var(--font-sans), sans-serif",
                  fontWeight: 800, fontSize: "clamp(32px, 4vw, 52px)",
                  letterSpacing: "-0.03em", textAlign: "center",
                  color: "var(--text-1)", marginBottom: 64,
                }}
              >
                Zyph becomes you.
              </h2>

              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 1,
                background: "var(--border)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                overflow: "hidden",
              }}>
                {[
                  { num: "01", title: "Runs quietly", body: "Install the desktop app. It captures your screen every 30 seconds, silently." },
                  { num: "02", title: "Reads everything", body: "OCR extracts text from every app, doc, and browser tab you use." },
                  { num: "03", title: "Builds your profile", body: "Over 2–4 weeks, Zyph maps your communication style, interests, and patterns." },
                  { num: "04", title: "Knows you", body: "Open chat and ask anything. No context needed. It already knows." },
                ].map((step, i) => (
                  <div
                    key={step.num}
                    ref={(el) => { sectionRefs.current[3 + i] = el; }}
                    className="section-anim"
                    style={{
                      background: "var(--card)",
                      padding: "32px 28px",
                    }}
                  >
                    <p style={{
                      fontFamily: "var(--font-sans), sans-serif",
                      fontWeight: 800, fontSize: 48, lineHeight: 1,
                      color: "var(--border)", marginBottom: 20,
                      letterSpacing: "-0.04em",
                    }}>
                      {step.num}
                    </p>
                    <h3 style={{
                      fontFamily: "var(--font-sans), sans-serif",
                      fontWeight: 700, fontSize: 16, color: "var(--text-1)",
                      letterSpacing: "-0.01em", marginBottom: 10,
                    }}>
                      {step.title}
                    </h3>
                    <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.65 }}>{step.body}</p>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "center", marginTop: 40 }}>
                <Link
                  href="/auth"
                  className="btn-primary"
                  style={{
                    padding: "13px 28px", borderRadius: 99,
                    background: "var(--primary)", color: "#fff",
                    fontWeight: 600, fontSize: 14, letterSpacing: "-0.01em",
                    textDecoration: "none",
                  }}
                >
                  Start for free
                </Link>
              </div>
            </div>
          </section>

          {/* ── VIDEO ── */}
          <section style={{ padding: "80px 40px", background: "var(--surface)" }}>
            <div style={{ maxWidth: 960, margin: "0 auto", textAlign: "center" }}>
              <h2
                ref={(el) => { sectionRefs.current[7] = el; }}
                className="section-anim"
                style={{
                  fontFamily: "var(--font-sans), sans-serif",
                  fontWeight: 800, fontSize: "clamp(28px, 3.5vw, 48px)",
                  letterSpacing: "-0.03em", color: "var(--text-1)",
                  marginBottom: 12,
                }}
              >
                See it in action
              </h2>
              <p
                ref={(el) => { sectionRefs.current[8] = el; }}
                className="section-anim"
                style={{ fontSize: 16, color: "var(--text-2)", marginBottom: 48 }}
              >
                Watch how Zyph learns and adapts to you.
              </p>

              <div
                style={{
                  borderRadius: "var(--radius-lg)",
                  overflow: "hidden",
                  border: "1px solid var(--border)",
                  aspectRatio: "16 / 9",
                  width: "100%",
                }}
              >
                <iframe
                  className="w-full h-full"
                  style={{ width: "100%", height: "100%", display: "block" }}
                  src="https://www.youtube.com/embed/nsGnxbgrk14"
                  title="See it in action"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </section>

          {/* ── DASHBOARD MOCKUP ── */}
          <section style={{ padding: "100px 40px", background: "var(--bg)" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto" }}>
              <h2
                ref={(el) => { sectionRefs.current[9] = el; }}
                className="section-anim"
                style={{
                  fontFamily: "var(--font-sans), sans-serif",
                  fontWeight: 800, fontSize: "clamp(28px, 3.5vw, 48px)",
                  letterSpacing: "-0.03em", textAlign: "center",
                  color: "var(--text-1)", marginBottom: 16,
                }}
              >
                A dashboard that thinks like you
              </h2>
              <p style={{
                textAlign: "center", fontSize: 16, color: "var(--text-2)",
                maxWidth: 500, margin: "0 auto 52px", lineHeight: 1.65,
              }}>
                Track what Zyph has learned, review your insights, and chat with an AI that already has full context.
              </p>

              <div
                ref={(el) => { sectionRefs.current[10] = el; }}
                className="section-anim"
                style={{
                  borderRadius: "var(--radius-lg)",
                  overflow: "hidden",
                  border: "1px solid var(--border)",
                  background: "var(--card)",
                }}
              >
                {/* Chrome bar */}
                <div style={{
                  padding: "10px 16px",
                  borderBottom: "1px solid var(--border)",
                  display: "flex", alignItems: "center", gap: 8,
                  background: "var(--surface)",
                }}>
                  {["#3d3d3d", "#3d3d3d", "#3d3d3d"].map((c, i) => (
                    <span key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
                  ))}
                </div>

                {/* Mobile fallback */}
                <div style={{ padding: "32px", textAlign: "center", display: "block" }} className="md:hidden">
                  <p style={{ color: "var(--text-3)", fontSize: 14 }}>Your personal AI dashboard</p>
                </div>

                {/* Desktop layout */}
                <div style={{ display: "flex", minHeight: 420 }}>
                  <aside style={{
                    width: 168, flexShrink: 0,
                    borderRight: "1px solid var(--border)",
                    padding: "20px 12px",
                  }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)", marginBottom: 24, paddingLeft: 8 }}>Zyph</p>
                    <nav style={{ display: "flex", flexDirection: "column", gap: 2, fontSize: 13 }}>
                      {["Home", "My Profile", "Insights", "Chat", "Settings"].map((item) => (
                        <div
                          key={item}
                          style={{
                            padding: "7px 10px", borderRadius: 8,
                            color: item === "Home" ? "var(--text-1)" : "var(--text-3)",
                          }}
                        >
                          {item}
                        </div>
                      ))}
                    </nav>
                  </aside>

                  <div style={{ flex: 1, padding: "28px 28px 24px" }}>
                    <h3 style={{
                      fontFamily: "var(--font-sans), sans-serif",
                      fontWeight: 700, fontSize: 22,
                      color: "var(--text-1)", letterSpacing: "-0.02em",
                      marginBottom: 24,
                    }}>
                      Good evening
                    </h3>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 12 }}>
                      {[
                        { label: "Total Observations", accent: "var(--primary)" },
                        { label: "Days Active",         accent: "var(--accent)" },
                        { label: "Insights Generated",  accent: "var(--primary)" },
                        { label: "Top App Used",        accent: "var(--accent)" },
                      ].map(({ label, accent }) => (
                        <div key={label} style={{
                          borderRadius: 10, padding: "14px 14px 16px",
                          background: "var(--surface)",
                          border: "1px solid var(--border)",
                        }}>
                          <div style={{ height: 2, width: 28, borderRadius: 2, background: accent, marginBottom: 10 }} />
                          <p style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 6 }}>{label}</p>
                          <p style={{ fontSize: 16, fontWeight: 600, color: "var(--text-1)" }}>—</p>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10 }}>
                      <div style={{
                        borderRadius: 10, padding: "16px",
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                      }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)", marginBottom: 8 }}>Recent Activity</p>
                        <p style={{ fontSize: 12, color: "var(--text-3)" }}>No observations yet.</p>
                      </div>
                      <div style={{
                        borderRadius: 10, padding: "16px",
                        border: "1px solid rgba(249,115,22,0.25)",
                        background: "rgba(249,115,22,0.05)",
                      }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)", marginBottom: 6 }}>Chat with Zyph</p>
                        <p style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 12 }}>Ask anything.</p>
                        <span style={{ fontSize: 12, fontWeight: 500, color: "var(--accent)" }}>Open Chat →</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── FEATURES ── */}
          <section style={{ padding: "100px 40px", background: "var(--surface)" }}>
            <div style={{ maxWidth: 1000, margin: "0 auto" }}>
              <h2
                ref={(el) => { sectionRefs.current[11] = el; }}
                className="section-anim"
                style={{
                  fontFamily: "var(--font-sans), sans-serif",
                  fontWeight: 800, fontSize: "clamp(28px, 3.5vw, 44px)",
                  letterSpacing: "-0.03em", textAlign: "center",
                  color: "var(--text-1)", marginBottom: 56,
                }}
              >
                Built for people who move fast
              </h2>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 1, background: "var(--border)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                {[
                  { icon: "🧠", accent: "var(--primary)", title: "Writes in your voice",    body: "Emails, Slack messages, proposals. All sound exactly like you." },
                  { icon: "⚡", accent: "var(--accent)",   title: "Zero setup",              body: "No prompts, no onboarding questionnaires. Just install and work normally." },
                  { icon: "🔒", accent: "var(--success)",  title: "Private by design",       body: "Your data is yours. Processed securely, never sold, never shared." },
                ].map((f, i) => (
                  <div
                    key={f.title}
                    ref={(el) => { sectionRefs.current[12 + i] = el; }}
                    className="section-anim card-hover"
                    style={{
                      background: "var(--card)",
                      borderTop: `2px solid ${f.accent}`,
                      padding: "32px 28px",
                    }}
                  >
                    <span style={{ fontSize: 28, display: "block", marginBottom: 20 }}>{f.icon}</span>
                    <h3 style={{
                      fontFamily: "var(--font-sans), sans-serif",
                      fontWeight: 700, fontSize: 17, color: "var(--text-1)",
                      letterSpacing: "-0.02em", marginBottom: 12,
                    }}>
                      {f.title}
                    </h3>
                    <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.65 }}>{f.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── DOWNLOAD CTA ── */}
          <section id="download" style={{ padding: "120px 40px", background: "var(--bg)", position: "relative", overflow: "hidden" }}>
            {/* Indigo glow */}
            <div style={{
              position: "absolute", top: "0%", left: "50%",
              transform: "translateX(-50%)",
              width: 600, height: 300,
              background: "radial-gradient(ellipse at center, rgba(99,102,241,0.15) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />

            <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center", position: "relative" }}>
              <h2 style={{
                fontFamily: "var(--font-sans), sans-serif",
                fontWeight: 800, fontSize: "clamp(32px, 5vw, 56px)",
                letterSpacing: "-0.035em", lineHeight: 1.1,
                color: "var(--text-1)", marginBottom: 20,
              }}>
                Meet the AI that gets you.
              </h2>
              <p style={{ fontSize: 17, color: "var(--text-2)", marginBottom: 44, lineHeight: 1.65 }}>
                Download the desktop app and let Zyph start learning. Free to start.
              </p>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <Link
                  href="https://github.com/EireScales/UseZyph/releases/download/v1.0.0/Zyph.Setup.1.0.0.exe"
                  className="btn-primary"
                  style={{
                    padding: "16px 36px", borderRadius: 99,
                    background: "var(--primary)", color: "#fff",
                    fontWeight: 700, fontSize: 16, letterSpacing: "-0.01em",
                    textDecoration: "none",
                  }}
                >
                  Download Desktop App
                </Link>

                <p style={{ fontSize: 12, color: "var(--text-3)", maxWidth: 380, lineHeight: 1.6 }}>
                  Windows may show a security warning on first install — click{" "}
                  <span style={{ color: "var(--text-2)" }}>&quot;More info&quot; → &quot;Run anyway&quot;</span>{" "}
                  to proceed. This is normal for new apps.
                </p>

                <Link href="/auth" style={{ fontSize: 13, fontWeight: 500, color: "var(--primary)", textDecoration: "none", marginTop: 4 }}>
                  Also available on web →
                </Link>
              </div>
            </div>
          </section>

          {/* ── FOOTER ── */}
          <footer style={{
            borderTop: "1px solid var(--border)",
            background: "var(--bg)",
            padding: "0 40px",
            height: 64,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: 16,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Link href="/" style={{ display: "flex", alignItems: "center", gap: 4, textDecoration: "none" }}>
                <span style={{
                  fontFamily: "var(--font-sans), sans-serif",
                  fontWeight: 700, fontSize: 15, color: "var(--text-1)", letterSpacing: "-0.02em",
                }}>
                  Zyph
                </span>
                <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--primary)", display: "inline-block", marginBottom: 6 }} />
              </Link>
              <span style={{ fontSize: 12, color: "var(--text-3)", marginLeft: 12 }}>© 2025 Zyph. All rights reserved.</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              {[
                { href: "/auth",    label: "Sign In" },
                { href: "/privacy", label: "Privacy" },
                { href: "/terms",   label: "Terms" },
              ].map(({ href, label }) => (
                <Link key={href} href={href} style={{ fontSize: 13, color: "var(--text-3)", textDecoration: "none" }}>
                  {label}
                </Link>
              ))}
            </div>
          </footer>

        </main>
      </div>
    </>
  );
}
