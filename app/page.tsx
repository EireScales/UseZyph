"use client";

import Link from "next/link";
import { Fragment, useEffect, useRef, useState } from "react";

const DL_URL =
  "https://github.com/EireScales/UseZyph/releases/download/v1.0.0/Zyph.Setup.1.0.0.exe";

const WinIcon = ({ size = 15 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} style={{ flexShrink: 0 }}>
    <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
  </svg>
);

const ArrowIcon = ({ size = 14 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const PlayIcon = ({ size = 22 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
    <path d="M8 5v14l11-7z" />
  </svg>
);

const Logo = ({ size = 21 }: { size?: number }) => (
  <span style={{ display: "inline-flex", alignItems: "center" }}>
    <span className="serif-italic" style={{ fontSize: size, color: "#F2F2F2", letterSpacing: "-0.02em", lineHeight: 1 }}>Zyph</span>
    <span style={{ display: "inline-block", width: 6, height: 6, background: "#6366f1", borderRadius: "50%", marginLeft: 4, marginBottom: 2, boxShadow: "0 0 10px rgba(99,102,241,0.8)" }} />
  </span>
);

const Fade = ({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); io.disconnect(); } },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`fade-anim${inView ? " visible" : ""}`} style={{ transitionDelay: `${delay}ms`, ...style }}>
      {children}
    </div>
  );
};

const Navbar = () => (
  <nav style={{
    position: "sticky", top: 0, zIndex: 50, height: 60,
    background: "rgba(8,9,10,0.72)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 max(24px, calc((100vw - 1240px) / 2))",
  }}>
    <Link href="/" aria-label="Zyph home"><Logo /></Link>
    <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
      <a href="#how" className="nav-link" style={{ fontSize: 13, color: "#8a8f98", fontWeight: 500 }}>How it works</a>
      <a href="#architecture" className="nav-link" style={{ fontSize: 13, color: "#8a8f98", fontWeight: 500 }}>Architecture</a>
      <a href="#features" className="nav-link" style={{ fontSize: 13, color: "#8a8f98", fontWeight: 500 }}>Features</a>
      <Link href="/auth" className="nav-link" style={{ fontSize: 13, color: "#525252", fontWeight: 500, marginLeft: 12 }}>Sign in</Link>
      <Link href="/auth" className="btn-primary" style={{ fontSize: 13, padding: "7px 16px" }}>Get started</Link>
    </div>
  </nav>
);

const HeroDashboard = () => (
  <div style={{
    position: "relative", zIndex: 1,
    background: "linear-gradient(180deg, rgba(13,13,18,0.95), rgba(9,9,14,0.95))",
    backdropFilter: "blur(48px) saturate(160%)",
    WebkitBackdropFilter: "blur(48px) saturate(160%)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 0 0 1px rgba(255,255,255,0.03) inset, 0 40px 120px rgba(0,0,0,0.7), 0 80px 160px rgba(99,102,241,0.08)",
    animation: "heroFloat 8s ease-in-out infinite",
  }}>
    <div style={{ height: 40, background: "rgba(6,6,9,0.95)", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", padding: "0 14px", gap: 7 }}>
      <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#ff5f57" }} />
      <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#febc2e" }} />
      <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#28c840" }} />
      <div style={{ flex: 1 }} />
      <span className="mono" style={{ background: "rgba(255,255,255,0.04)", borderRadius: 6, padding: "4px 14px", fontSize: 11, color: "#6b7280" }}>
        zyph.app / dashboard
      </span>
      <div style={{ flex: 1 }} />
    </div>

    <div style={{ padding: "26px 30px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <p className="mono" style={{ fontSize: 10, fontWeight: 600, color: "#525252", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>Good evening</p>
          <p className="serif-italic" style={{ fontSize: 24, color: "#F2F2F2", letterSpacing: "-0.01em" }}>welcome back, Eoin.</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <span className="mono" style={{ fontSize: 11, color: "#6b7280", display: "block" }}>11:47 PM · Thu</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 4, fontSize: 11, color: "#22c55e" }}>
            <span style={{ width: 6, height: 6, background: "#22c55e", borderRadius: "50%", boxShadow: "0 0 8px #22c55e", animation: "pulseDot 2s ease-in-out infinite" }} />
            Observing
          </span>
        </div>
      </div>

      <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)", marginBottom: 20 }} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 14 }}>
        {[
          { label: "OBSERVATIONS", value: "847", c: "#6366f1" },
          { label: "DAYS ACTIVE", value: "23", c: "#f97316" },
          { label: "INSIGHTS", value: "31", c: "#eab308" },
          { label: "TOP APP", value: "Cursor", c: "#22c55e" },
        ].map((s) => (
          <div key={s.label} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderLeft: `2px solid ${s.c}`, borderRadius: 8, padding: "12px 14px" }}>
            <p className="mono" style={{ fontSize: 9, color: "#525252", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{s.label}</p>
            <p className="mono" style={{ fontSize: 22, fontWeight: 700, color: "#F2F2F2", letterSpacing: "-0.02em", lineHeight: 1 }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 10 }}>
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: 14 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#F2F2F2", marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
            <span>Recent Activity</span>
            <span className="mono" style={{ fontSize: 10, color: "#525252", fontWeight: 500 }}>LIVE</span>
          </p>
          {[
            { app: "Cursor", color: "#6366f1", bg: "rgba(99,102,241,0.1)", bd: "rgba(99,102,241,0.15)", lc: "#818cf8", desc: "Working on Next.js dashboard component" },
            { app: "Brave", color: "#f97316", bg: "rgba(249,115,22,0.1)", bd: "rgba(249,115,22,0.15)", lc: "#fb923c", desc: "Browsing Stripe docs for webhook setup" },
            { app: "Claude", color: "#22c55e", bg: "rgba(34,197,94,0.1)", bd: "rgba(34,197,94,0.15)", lc: "#86efac", desc: "Discussing product architecture" },
          ].map((r, i, arr) => (
            <div key={r.app} style={{ display: "flex", alignItems: "flex-start", gap: 10, paddingBottom: i === arr.length - 1 ? 0 : 10, borderBottom: i === arr.length - 1 ? "none" : "1px solid rgba(255,255,255,0.04)", marginBottom: i === arr.length - 1 ? 0 : 10 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: r.color, marginTop: 5, boxShadow: `0 0 8px ${r.color}` }} />
              <div>
                <span className="mono" style={{ fontSize: 10, fontWeight: 600, color: r.lc, background: r.bg, border: `1px solid ${r.bd}`, borderRadius: 4, padding: "1px 6px", marginRight: 7 }}>{r.app}</span>
                <span style={{ fontSize: 12, color: "#8a8f98" }}>{r.desc}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.14), rgba(99,102,241,0.03))", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 8, padding: 14, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#F2F2F2", marginBottom: 4 }}>Chat with Zyph</p>
            <p style={{ fontSize: 11.5, color: "#8a8f98", lineHeight: 1.5 }}>Full context. Ask anything — I know how you work.</p>
          </div>
          <div>
            <div style={{ background: "#6366f1", borderRadius: 6, padding: "9px 10px", textAlign: "center", fontSize: 12, fontWeight: 600, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              Open Chat <ArrowIcon size={12} />
            </div>
            <p style={{ fontSize: 11, color: "#22c55e", marginTop: 9, display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 5, height: 5, background: "#22c55e", borderRadius: "50%" }} />
              Zyph knows you
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Hero = () => (
  <section style={{
    minHeight: "100vh", background: "#08090a", position: "relative", overflow: "hidden",
    display: "flex", flexDirection: "column", alignItems: "center",
    paddingTop: 140, paddingBottom: 100, paddingLeft: 24, paddingRight: 24,
  }}>
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 45% at 50% -8%, rgba(99,102,241,0.28) 0%, transparent 70%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 40% 30% at 15% 80%, rgba(249,115,22,0.08) 0%, transparent 60%)" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.028) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.028) 1px, transparent 1px)", backgroundSize: "80px 80px", maskImage: "radial-gradient(ellipse 80% 70% at 50% 30%, #000 40%, transparent 85%)", WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 30%, #000 40%, transparent 85%)" }} />
    </div>

    <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", width: "100%", textAlign: "center", maxWidth: 1200 }}>
      <div className="hero-in" style={{ marginBottom: 32 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1px solid rgba(99,102,241,0.25)", background: "rgba(99,102,241,0.07)", borderRadius: 99, padding: "6px 14px" }}>
          <span style={{ width: 5, height: 5, background: "#818cf8", borderRadius: "50%", animation: "pulseDot 2.5s ease-in-out infinite", boxShadow: "0 0 10px #818cf8" }} />
          <span className="mono" style={{ fontSize: 11, fontWeight: 500, color: "#c7d2fe", letterSpacing: "0.08em", textTransform: "uppercase" }}>Personal Intelligence · Now in Beta</span>
        </div>
      </div>

      <h1 className="hero-in serif-italic hero-h1" style={{
        animationDelay: ".1s",
        fontSize: "clamp(48px, 7vw, 96px)", color: "#F2F2F2", lineHeight: 1.02,
        letterSpacing: "-0.035em", maxWidth: 960, margin: "0 auto 28px", fontWeight: 400,
      }}>
        The AI that was already<br />
        <span style={{ background: "linear-gradient(180deg, #a5b4fc 0%, #6366f1 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>paying attention.</span>
      </h1>

      <p className="hero-in" style={{ animationDelay: ".2s", fontSize: 18, fontWeight: 400, color: "#8a8f98", maxWidth: 540, margin: "0 auto 44px", lineHeight: 1.65 }}>
        Zyph runs quietly in the background, learns exactly how you work, and builds a permanent intelligence profile — so every conversation starts with full context.
      </p>

      <div className="hero-in cta-btns" style={{ animationDelay: ".3s", display: "flex", gap: 12, justifyContent: "center" }}>
        <Link href={DL_URL} className="btn-primary" style={{ fontSize: 14, padding: "13px 22px" }}>
          <WinIcon size={14} /> Download for Windows
        </Link>
        <Link href="/auth" className="btn-ghost" style={{ fontSize: 14, padding: "13px 22px" }}>Sign in free <ArrowIcon /></Link>
      </div>

      <div className="hero-in" style={{ animationDelay: ".4s", marginTop: 22, display: "flex", gap: 18, justifyContent: "center", flexWrap: "wrap" }}>
        {["Free to start", "No credit card", "Works in background"].map((t, i, arr) => (
          <Fragment key={t}>
            <span className="mono" style={{ fontSize: 12, color: "#52525b", letterSpacing: "0.02em" }}>{t}</span>
            {i < arr.length - 1 && <span style={{ color: "#27272a" }}>·</span>}
          </Fragment>
        ))}
      </div>

      <div className="hero-in hero-mock" style={{ animationDelay: ".55s", marginTop: 88, maxWidth: 1080, width: "100%", position: "relative" }}>
        <div style={{ position: "absolute", inset: -80, background: "radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.2) 0%, transparent 65%)", filter: "blur(50px)", zIndex: 0, pointerEvents: "none" }} />
        <HeroDashboard />
      </div>

      <div className="hero-mock-mobile" style={{ display: "none", width: "100%", maxWidth: 380, marginTop: 48, background: "rgba(11,11,15,0.92)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 14, padding: 22, flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, paddingBottom: 14, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span className="serif-italic" style={{ fontSize: 15, color: "#fff" }}>Z</span>
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#F2F2F2" }}>Zyph</span>
          <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#22c55e" }}>
            <span style={{ width: 5, height: 5, background: "#22c55e", borderRadius: "50%" }} /> Observing
          </span>
        </div>
        <div style={{ background: "#6366f1", color: "#fff", padding: "10px 14px", borderRadius: "12px 12px 3px 12px", fontSize: 13, maxWidth: "80%", marginLeft: "auto", marginBottom: 12 }}>what do you know about how I work?</div>
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", padding: "12px 14px", borderRadius: "3px 12px 12px 12px", fontSize: 13, color: "#c4c9d4", lineHeight: 1.65 }}>
          You&apos;re a classic midnight coder — grinding between 12am and 1am using Cursor to ship Zyph. Indie founder energy: shipping beats perfection.
        </div>
      </div>
    </div>
  </section>
);

const Marquee = () => {
  const items = ["SILENT CAPTURE", "CONTEXT COMPOUNDS", "ZERO PROMPTS", "INTELLIGENCE PROFILE", "WORKS WHILE YOU WORK", "FULL MEMORY", "INSTALL · FORGET", "PRIVATE BY DESIGN"];
  const loop = [...items, ...items];
  return (
    <section style={{ background: "#060608", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "18px 0", overflow: "hidden" }}>
      <div style={{ display: "flex", width: "max-content", animation: "marquee 40s linear infinite" }}>
        {loop.map((t, i) => (
          <div key={i} style={{ display: "inline-flex", alignItems: "center", gap: 16, padding: "0 28px" }}>
            <span className="mono" style={{ fontSize: 11, color: "#4b5563", letterSpacing: "0.18em", fontWeight: 600 }}>{t}</span>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#6366f1", opacity: 0.4 }} />
          </div>
        ))}
      </div>
    </section>
  );
};

const Proof = () => (
  <section className="sec-v" style={{ background: "#08090a", padding: "140px max(24px, calc((100vw - 1120px) / 2))" }}>
    <div className="two-col" style={{ display: "flex", gap: 80, alignItems: "center" }}>
      <div style={{ flex: 1.1 }}>
        <Fade><p className="mono" style={{ fontSize: 11, fontWeight: 600, color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 18 }}>Real output · No manual input</p></Fade>
        <Fade delay={80}><h2 className="serif-italic" style={{ fontSize: "clamp(34px, 4.2vw, 52px)", color: "#F2F2F2", lineHeight: 1.08, letterSpacing: "-0.025em", marginBottom: 22, fontWeight: 400 }}>
          What Zyph figured out<br />without being told.
        </h2></Fade>
        <Fade delay={160}><p style={{ fontSize: 16, color: "#8a8f98", lineHeight: 1.75, marginBottom: 32, maxWidth: 460 }}>
          After seven days of passive observation — zero prompts, zero setup — Zyph accurately identified work patterns, tools, schedule, and communication style. Nobody typed a word.
        </p></Fade>
        {["Works entirely in the background", "Zero prompts or configuration needed", "Gets sharper the longer it runs"].map((item, i) => (
          <Fade key={item} delay={220 + i * 60}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 14 }}>
              <span style={{ color: "#6366f1", fontSize: 14, marginTop: 3, fontFamily: "serif" }}>✦</span>
              <span style={{ fontSize: 14.5, color: "#c4c9d4" }}>{item}</span>
            </div>
          </Fade>
        ))}
      </div>

      <div style={{ flex: 1 }}>
        <Fade delay={120}>
          <div style={{ background: "linear-gradient(180deg, rgba(13,13,18,0.95), rgba(9,9,14,0.95))", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 22, boxShadow: "0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03) inset", position: "relative" }}>
            <div style={{ position: "absolute", inset: -30, background: "radial-gradient(ellipse at 60% 40%, rgba(99,102,241,0.15), transparent 70%)", filter: "blur(40px)", zIndex: -1, pointerEvents: "none" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 14, borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 18 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(99,102,241,0.5)" }}>
                <span className="serif-italic" style={{ fontSize: 15, color: "#fff" }}>Z</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#F2F2F2" }}>Zyph</span>
              <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#22c55e" }}>
                <span style={{ width: 6, height: 6, background: "#22c55e", borderRadius: "50%", boxShadow: "0 0 8px #22c55e", animation: "pulseDot 2s ease-in-out infinite" }} />
                Active
              </span>
            </div>

            <div style={{ marginLeft: "auto", maxWidth: "82%", marginBottom: 14 }}>
              <div style={{ background: "#6366f1", color: "#fff", padding: "11px 14px", borderRadius: "12px 12px 3px 12px", fontSize: 13.5, lineHeight: 1.5, boxShadow: "0 4px 14px rgba(99,102,241,0.3)" }}>
                what do you know about how I work?
              </div>
              <p className="mono" style={{ fontSize: 10.5, color: "#52525b", textAlign: "right", marginTop: 5 }}>11:47 PM</p>
            </div>

            <div style={{ maxWidth: "95%", marginBottom: 14 }}>
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", padding: "13px 16px", borderRadius: "3px 12px 12px 12px", fontSize: 13.5, color: "#d4d4d8", lineHeight: 1.7 }}>
                You&apos;re a classic <span style={{ color: "#a5b4fc", fontWeight: 500 }}>midnight coder</span> — grinding between 12am–1am in Cursor to ship Zyph. Indie founder energy: shipping beats perfection. Direct, technical communicator who learns by doing. You jump between Stripe docs and Claude when debugging.<span className="caret" />
              </div>
            </div>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
              {["#midnight-coder", "#indie-founder", "#cursor-power-user", "#claude-native"].map((t) => (
                <span key={t} className="mono" style={{ fontSize: 10.5, color: "#818cf8", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.18)", padding: "3px 8px", borderRadius: 4 }}>{t}</span>
              ))}
            </div>

            <p style={{ fontSize: 11, color: "#52525b", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: 12 }}>
              Generated from <span style={{ color: "#818cf8" }}>847 passive captures</span> · Zero manual input
            </p>
          </div>
        </Fade>
      </div>
    </div>
  </section>
);

const HowItWorks = () => (
  <section id="how" className="sec-v" style={{ background: "#060608", padding: "140px max(24px, calc((100vw - 1120px) / 2))", textAlign: "center" }}>
    <Fade><p className="mono" style={{ fontSize: 11, fontWeight: 600, color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 18 }}>How it works</p></Fade>
    <Fade delay={80}><h2 className="serif-italic" style={{ fontSize: "clamp(34px, 4.5vw, 56px)", color: "#F2F2F2", letterSpacing: "-0.03em", marginBottom: 16, fontWeight: 400, lineHeight: 1.05 }}>Three steps. Zero effort.</h2></Fade>
    <Fade delay={160}><p style={{ fontSize: 16.5, color: "#8a8f98", maxWidth: 540, margin: "0 auto 72px", lineHeight: 1.6 }}>Zyph works entirely in the background. You never have to think about it.</p></Fade>

    <div className="steps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 0 }}>
      {([
        { n: "01", title: "Install & forget", body: "Run the desktop app. It captures your screen every 30 seconds, silently. No setup, no configuration.", icon: "↓", extraStyle: { borderRadius: "14px 0 0 14px" } as React.CSSProperties },
        { n: "02", title: "Zyph learns you", body: "Every capture is analysed by a local model plus Claude. Your tools, patterns, and style distil into a growing profile.", icon: "◆", extraStyle: { borderRadius: 0, borderLeft: "none", borderRight: "none" } as React.CSSProperties },
        { n: "03", title: "Chat with full context", body: "Open chat and ask anything. Zyph already knows how you work, what you use, and how you think.", icon: "→", extraStyle: { borderRadius: "0 14px 14px 0" } as React.CSSProperties },
      ] as const).map((s, i) => (
        <Fade key={s.n} delay={i * 120}>
          <div style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.022), rgba(255,255,255,0.005))", border: "1px solid rgba(255,255,255,0.07)", padding: "40px 32px", textAlign: "left", height: "100%", position: "relative", ...s.extraStyle }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 24 }}>
              <p className="serif-italic" style={{ fontSize: 64, color: "rgba(99,102,241,0.18)", lineHeight: 1, fontWeight: 400 }}>{s.n}</p>
              <span className="mono" style={{ fontSize: 16, color: "rgba(99,102,241,0.35)" }}>{s.icon}</span>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: "#F2F2F2", marginBottom: 10, letterSpacing: "-0.01em" }}>{s.title}</h3>
            <p style={{ fontSize: 14.5, color: "#8a8f98", lineHeight: 1.72 }}>{s.body}</p>
          </div>
        </Fade>
      ))}
    </div>
  </section>
);

const Architecture = () => (
  <section id="architecture" className="sec-v" style={{ background: "#08090a", padding: "140px max(24px, calc((100vw - 1120px) / 2))" }}>
    <Fade><p className="mono" style={{ fontSize: 11, fontWeight: 600, color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.12em", textAlign: "center", marginBottom: 18 }}>What is Zyph?</p></Fade>
    <Fade delay={80}><h2 className="serif-italic" style={{ fontSize: "clamp(34px, 4.5vw, 56px)", color: "#F2F2F2", letterSpacing: "-0.03em", textAlign: "center", marginBottom: 16, fontWeight: 400, lineHeight: 1.05 }}>A new category of AI.</h2></Fade>
    <Fade delay={160}><p style={{ fontSize: 17, color: "#8a8f98", textAlign: "center", maxWidth: 540, margin: "0 auto 32px", lineHeight: 1.7 }}>
      Not a chatbot. Not a note-taker. A permanent intelligence layer that compounds over time.
    </p></Fade>
    <Fade delay={240}>
      <div style={{ textAlign: "center", marginBottom: 56 }}>
        <p className="mono" style={{ fontSize: "clamp(15px, 1.9vw, 22px)", fontWeight: 500, color: "#F2F2F2", letterSpacing: "-0.01em" }}>
          Zyph <span style={{ color: "#525252" }}>=</span> <span style={{ color: "#818cf8" }}>Personal Data Engine</span> <span style={{ color: "#525252" }}>+</span> <span style={{ color: "#fb923c" }}>Behavioural Memory Layer</span>
        </p>
      </div>
    </Fade>

    <div className="arch-cols" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
      <Fade delay={100}>
        <div style={{ background: "linear-gradient(180deg, rgba(6,6,20,0.9), rgba(4,4,14,0.9))", border: "1px solid rgba(99,102,241,0.22)", borderTop: "2px solid #6366f1", borderRadius: 14, padding: 36, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, background: "radial-gradient(circle, rgba(99,102,241,0.2), transparent 70%)", filter: "blur(30px)" }} />
          <div style={{ position: "relative" }}>
            <div className="mono" style={{ display: "inline-flex", background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.22)", borderRadius: 99, padding: "5px 12px", fontSize: 10.5, fontWeight: 600, color: "#a5b4fc", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 22 }}>Personal Data Engine</div>
            <h3 className="serif-italic" style={{ fontSize: 28, fontWeight: 400, color: "#F2F2F2", marginBottom: 10, letterSpacing: "-0.015em" }}>It observes. Constantly.</h3>
            <p style={{ fontSize: 14.5, color: "#8a8f98", lineHeight: 1.75, marginBottom: 24 }}>Every 30 seconds, Zyph silently reads your screen — every app, document, browser tab. No interruption. No asking.</p>
            {["Screen-level context capture", "OCR across every application", "App behaviour & usage patterns", "Structured categorised memory"].map((item) => (
              <div key={item} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#6366f1", boxShadow: "0 0 6px #6366f1" }} />
                <span style={{ fontSize: 13.5, color: "#c4c9d4" }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </Fade>

      <Fade delay={200}>
        <div style={{ background: "linear-gradient(180deg, rgba(20,10,0,0.9), rgba(14,6,0,0.9))", border: "1px solid rgba(249,115,22,0.22)", borderTop: "2px solid #f97316", borderRadius: 14, padding: 36, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, background: "radial-gradient(circle, rgba(249,115,22,0.18), transparent 70%)", filter: "blur(30px)" }} />
          <div style={{ position: "relative" }}>
            <div className="mono" style={{ display: "inline-flex", background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.22)", borderRadius: 99, padding: "5px 12px", fontSize: 10.5, fontWeight: 600, color: "#fdba74", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 22 }}>Behavioural Memory Layer</div>
            <h3 className="serif-italic" style={{ fontSize: 28, fontWeight: 400, color: "#F2F2F2", marginBottom: 10, letterSpacing: "-0.015em" }}>It remembers. Everything.</h3>
            <p style={{ fontSize: 14.5, color: "#8a8f98", lineHeight: 1.75, marginBottom: 24 }}>Observations distil into a living intelligence profile — your work style, communication patterns, tools, and cognitive rhythms.</p>
            {["Persistent insight profile", "Communication style modelling", "Tool & workflow mapping", "Context that compounds over time"].map((item) => (
              <div key={item} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#f97316", boxShadow: "0 0 6px #f97316" }} />
                <span style={{ fontSize: 13.5, color: "#c4c9d4" }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </Fade>
    </div>

    <Fade delay={320}>
      <div style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.005))", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "48px 40px", textAlign: "center" }}>
        <p className="serif-italic" style={{ fontSize: "clamp(22px, 3.2vw, 34px)", color: "#F2F2F2", lineHeight: 1.35, marginBottom: 10, fontWeight: 400, letterSpacing: "-0.015em" }}>
          &ldquo;An AI that doesn&apos;t need you to explain yourself.&rdquo;
        </p>
        <p style={{ fontSize: 14.5, color: "#6b7280" }}>Because it was already paying attention.</p>
      </div>
    </Fade>
  </section>
);

const VideoSection = () => {
  const [playing, setPlaying] = useState(false);
  return (
    <section className="sec-v" style={{ background: "#060608", padding: "140px max(24px, calc((100vw - 980px) / 2))", textAlign: "center" }}>
      <Fade><p className="mono" style={{ fontSize: 11, fontWeight: 600, color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 18 }}>See it in action</p></Fade>
      <Fade delay={80}><h2 className="serif-italic" style={{ fontSize: "clamp(34px, 4.5vw, 56px)", color: "#F2F2F2", letterSpacing: "-0.03em", marginBottom: 16, fontWeight: 400, lineHeight: 1.05 }}>Watch Zyph learn.</h2></Fade>
      <Fade delay={160}><p style={{ fontSize: 16.5, color: "#8a8f98", maxWidth: 520, margin: "0 auto 56px", lineHeight: 1.6 }}>Seven days. Zero prompts. This is what it figured out.</p></Fade>

      <Fade delay={220}>
        <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", aspectRatio: "16/9", background: "#0a0a10", boxShadow: "0 40px 100px rgba(0,0,0,0.6), 0 0 60px rgba(99,102,241,0.12)" }}>
          {playing ? (
            <iframe
              src="https://www.youtube.com/embed/nsGnxbgrk14?autoplay=1&rel=0"
              title="Zyph demo"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <button onClick={() => setPlaying(true)} aria-label="Play demo video" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0, padding: 0, cursor: "pointer", background: "linear-gradient(135deg, #0a0a14 0%, #14141c 100%)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)", backgroundSize: "48px 48px", maskImage: "radial-gradient(ellipse at center, #000 40%, transparent 80%)", WebkitMaskImage: "radial-gradient(ellipse at center, #000 40%, transparent 80%)" }} />
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(99,102,241,0.22), transparent 60%)" }} />
              <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
                <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 40px rgba(99,102,241,0.5), inset 0 1px 0 rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.15)", paddingLeft: 6 }}>
                  <PlayIcon size={28} />
                </div>
                <div>
                  <p className="serif-italic" style={{ fontSize: 22, color: "#F2F2F2" }}>Watch the 90s demo</p>
                  <p className="mono" style={{ fontSize: 11, color: "#6b7280", marginTop: 6, letterSpacing: "0.1em", textTransform: "uppercase" }}>Day 1 → Day 7 · Zero prompts</p>
                </div>
              </div>
              <span className="mono" style={{ position: "absolute", top: 16, left: 16, fontSize: 10, color: "#6b7280", letterSpacing: "0.1em" }}>● REC · 04:18:26</span>
              <span className="mono" style={{ position: "absolute", top: 16, right: 16, fontSize: 10, color: "#6b7280", letterSpacing: "0.1em" }}>ZYPH/DEMO_v1</span>
              <span className="mono" style={{ position: "absolute", bottom: 16, left: 16, fontSize: 10, color: "#6b7280", letterSpacing: "0.1em" }}>01:32</span>
              <span className="mono" style={{ position: "absolute", bottom: 16, right: 16, fontSize: 10, color: "#6b7280", letterSpacing: "0.1em" }}>1080p · HDR</span>
            </button>
          )}
        </div>
      </Fade>
    </section>
  );
};

const Features = () => {
  const items = [
    { iconBg: "rgba(99,102,241,0.12)", iconColor: "#a5b4fc", icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={20} height={20}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>), title: "Writes in your voice", body: "Emails, messages, proposals — all sound exactly like you, because Zyph has actually read how you write." },
    { iconBg: "rgba(249,115,22,0.12)", iconColor: "#fdba74", icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={20} height={20}><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>), title: "Zero setup", body: "No onboarding. No questionnaires. Install the app, work normally. Zyph does the rest." },
    { iconBg: "rgba(34,197,94,0.12)", iconColor: "#86efac", icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={20} height={20}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>), title: "Private by design", body: "Your data stays yours. Processed securely, never sold, never shared with third parties." },
    { iconBg: "rgba(234,179,8,0.12)", iconColor: "#fde68a", icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={20} height={20}><path d="M12 3v18M3 12h18"/></svg>), title: "Gets sharper over time", body: "Every capture adds signal. After a week Zyph knows your rhythm; after a month, it knows your craft." },
    { iconBg: "rgba(236,72,153,0.12)", iconColor: "#f9a8d4", icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={20} height={20}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>), title: "Always-on assistant", body: "Open chat from anywhere. Zyph has the full context of what you were just doing — no re-briefing." },
    { iconBg: "rgba(14,165,233,0.12)", iconColor: "#7dd3fc", icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={20} height={20}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6v6H9z"/></svg>), title: "Runs locally first", body: "On-device OCR and classification. Only distilled intelligence ever leaves your machine." },
  ];
  return (
    <section id="features" className="sec-v" style={{ background: "#08090a", padding: "140px max(24px, calc((100vw - 1120px) / 2))" }}>
      <Fade><p className="mono" style={{ fontSize: 11, fontWeight: 600, color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 18 }}>Features</p></Fade>
      <Fade delay={80}><h2 className="serif-italic" style={{ fontSize: "clamp(34px, 4.5vw, 56px)", color: "#F2F2F2", letterSpacing: "-0.03em", marginBottom: 16, fontWeight: 400, lineHeight: 1.05 }}>Built for people who move fast.</h2></Fade>
      <Fade delay={160}><p style={{ fontSize: 16.5, color: "#8a8f98", marginBottom: 64, maxWidth: 520, lineHeight: 1.6 }}>Everything on by default. No toggles, no menus, no &ldquo;AI settings&rdquo; to tune.</p></Fade>
      <div className="feature-cols" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {items.map((f, i) => (
          <Fade key={f.title} delay={i * 80}>
            <div className="feature-card">
              <div style={{ width: 40, height: 40, borderRadius: 10, background: f.iconBg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, color: f.iconColor, border: "1px solid rgba(255,255,255,0.06)" }}>{f.icon}</div>
              <h3 style={{ fontSize: 16.5, fontWeight: 600, color: "#F2F2F2", marginBottom: 8, letterSpacing: "-0.01em" }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: "#8a8f98", lineHeight: 1.7 }}>{f.body}</p>
            </div>
          </Fade>
        ))}
      </div>
    </section>
  );
};

const Traction = () => {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [val, setVal] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    const target = 847;
    const steps = 50;
    let step = 0;
    const t = setInterval(() => {
      step++;
      setVal(Math.min(Math.round((target * step) / steps), target));
      if (step >= steps) clearInterval(t);
    }, 24);
    return () => clearInterval(t);
  }, [inView]);

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="sec-v" style={{ background: "#060608", padding: "120px max(24px, calc((100vw - 980px) / 2))", textAlign: "center" }}>
      <p className="mono" style={{ fontSize: 11, fontWeight: 600, color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 18 }}>Traction</p>
      <h2 className="serif-italic" style={{ fontSize: "clamp(34px, 4.2vw, 52px)", color: "#F2F2F2", letterSpacing: "-0.025em", marginBottom: 64, fontWeight: 400 }}>Built. Shipped. Working.</h2>
      <div className="stats-row" style={{ display: "flex", alignItems: "stretch", justifyContent: "center" }}>
        {[
          { value: `${val}+`, label: "screen captures analysed" },
          { value: "3", label: "tiers: Free · Pro · Mirror", mid: true },
          { value: "30s", label: "capture interval, fully passive" },
        ].map((s) => (
          <div key={s.label} style={{ flex: 1, padding: "0 48px", textAlign: "center", borderLeft: s.mid ? "1px solid rgba(255,255,255,0.08)" : "none", borderRight: s.mid ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
            <p className="serif-italic" style={{ fontSize: "clamp(52px, 6.5vw, 80px)", color: "#F2F2F2", lineHeight: 1, marginBottom: 14 }}>{s.value}</p>
            <p style={{ fontSize: 14, color: "#8a8f98" }}>{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

const DownloadCTA = () => (
  <section id="download" className="sec-v" style={{ background: "#060608", padding: "180px max(24px, calc((100vw - 800px) / 2))", textAlign: "center", position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 800, height: 600, background: "radial-gradient(ellipse, rgba(99,102,241,0.18) 0%, transparent 65%)", filter: "blur(40px)", pointerEvents: "none", zIndex: 0 }} />
    <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)", backgroundSize: "80px 80px", maskImage: "radial-gradient(ellipse at center, #000 30%, transparent 70%)", WebkitMaskImage: "radial-gradient(ellipse at center, #000 30%, transparent 70%)", zIndex: 0 }} />
    <div style={{ position: "relative", zIndex: 1 }}>
      <p className="mono" style={{ fontSize: 11, fontWeight: 600, color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 18 }}>Get started</p>
      <h2 className="serif-italic" style={{ fontSize: "clamp(46px, 6vw, 88px)", color: "#F2F2F2", letterSpacing: "-0.035em", lineHeight: 1, marginBottom: 24, fontWeight: 400 }}>
        Meet the AI<br /><span style={{ background: "linear-gradient(180deg, #a5b4fc, #6366f1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>that gets you.</span>
      </h2>
      <p style={{ fontSize: 17, color: "#8a8f98", margin: "0 auto 44px", maxWidth: 440, lineHeight: 1.7 }}>
        Download the desktop app. Let Zyph start learning. Free to start, no card required.
      </p>
      <div className="cta-btns" style={{ display: "inline-flex", gap: 12, justifyContent: "center" }}>
        <Link href={DL_URL} className="btn-primary" style={{ fontSize: 15, padding: "15px 28px" }}>
          <WinIcon size={15} /> Download for Windows
        </Link>
        <Link href="/auth" className="btn-ghost" style={{ fontSize: 15, padding: "15px 24px" }}>Try on web <ArrowIcon /></Link>
      </div>
      <p className="mono" style={{ marginTop: 32, fontSize: 11.5, color: "#52525b", maxWidth: 460, marginLeft: "auto", marginRight: "auto", lineHeight: 1.7 }}>
        Windows may show a security warning on first install. Click <span style={{ color: "#8a8f98" }}>More info → Run anyway</span>. This is normal for new unsigned apps.
      </p>
    </div>
  </section>
);

const Footer = () => (
  <footer style={{ background: "#060608", borderTop: "1px solid rgba(255,255,255,0.05)", padding: "0 max(24px, calc((100vw - 1240px) / 2))" }}>
    <div className="footer-inner" style={{ height: 72, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <Logo size={18} />
        <span style={{ fontSize: 13, color: "#3f3f46" }}>© 2026 Zyph. All rights reserved.</span>
      </div>
      <div style={{ display: "flex", gap: 24 }}>
        <Link href="/privacy" className="footer-link" style={{ fontSize: 13, color: "#6b7280" }}>Privacy</Link>
        <Link href="/terms" className="footer-link" style={{ fontSize: 13, color: "#6b7280" }}>Terms</Link>
        <Link href="/changelog" className="footer-link" style={{ fontSize: 13, color: "#6b7280" }}>Changelog</Link>
        <Link href="/auth" className="footer-link" style={{ fontSize: 13, color: "#6b7280" }}>Sign in</Link>
      </div>
    </div>
  </footer>
);

export default function Home() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital,wght@0,400;1,400&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body {
          background: #08090a;
          color: #F2F2F2;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          overflow-x: hidden;
        }
        ::selection { background: rgba(99,102,241,0.3); color: #fafafa; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #08090a; }
        ::-webkit-scrollbar-thumb { background: #2a2a32; border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: #3f3f46; }

        .serif-italic { font-family: 'Instrument Serif', Georgia, serif; font-style: italic; font-weight: 400; }
        .mono { font-family: 'JetBrains Mono', ui-monospace, monospace; }

        @keyframes heroFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes pulseDot { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.45; transform: scale(0.8); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes caretBlink { 0%,50% { opacity: 1; } 51%,100% { opacity: 0; } }

        .fade-anim { opacity: 0; transform: translateY(16px); transition: opacity .6s ease, transform .6s cubic-bezier(.19,1,.22,1); }
        .fade-anim.visible { opacity: 1; transform: translateY(0); }
        .hero-in { animation: fadeUp .75s cubic-bezier(.19,1,.22,1) both; }

        a { text-decoration: none; color: inherit; }
        .nav-link { transition: color .15s; }
        .nav-link:hover { color: #F2F2F2 !important; }

        .btn-primary {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          background: #6366f1; color: #fff; font-weight: 600; border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.12);
          box-shadow: 0 0 0 1px rgba(99,102,241,0.45), 0 10px 30px rgba(99,102,241,0.28), inset 0 1px 0 rgba(255,255,255,0.15);
          transition: transform .12s ease, box-shadow .15s, opacity .15s; cursor: pointer;
        }
        .btn-primary:hover { opacity: .95; transform: translateY(-1px); box-shadow: 0 0 0 1px rgba(99,102,241,0.55), 0 14px 36px rgba(99,102,241,0.35), inset 0 1px 0 rgba(255,255,255,0.2); }

        .btn-ghost {
          display: inline-flex; align-items: center; justify-content: center; gap: 6px;
          background: rgba(255,255,255,0.03); color: #F2F2F2; font-weight: 500; border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.09);
          transition: background .15s, border-color .15s; cursor: pointer;
        }
        .btn-ghost:hover { background: rgba(255,255,255,0.07); border-color: rgba(255,255,255,0.14); }

        .feature-card {
          background: linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.01));
          border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 32px;
          transition: border-color .2s, background .2s, transform .2s; height: 100%;
        }
        .feature-card:hover { border-color: rgba(255,255,255,0.14); transform: translateY(-2px); }

        .footer-link { transition: color .15s; }
        .footer-link:hover { color: #F2F2F2 !important; }

        .caret { display: inline-block; width: 2px; height: 1em; background: #818cf8; margin-left: 2px; vertical-align: text-bottom; animation: caretBlink 1s steps(1) infinite; }

        @media (max-width: 860px) {
          .hero-mock { display: none !important; }
          .hero-mock-mobile { display: flex !important; }
          .two-col { flex-direction: column !important; gap: 48px !important; }
          .steps-grid { grid-template-columns: 1fr !important; }
          .steps-grid > * { border-radius: 12px !important; border: 1px solid rgba(255,255,255,0.07) !important; }
          .arch-cols { grid-template-columns: 1fr !important; }
          .feature-cols { grid-template-columns: 1fr !important; }
          .cta-btns { flex-direction: column !important; width: 100% !important; }
          .cta-btns > * { width: 100% !important; }
          .sec-v { padding-top: 96px !important; padding-bottom: 96px !important; }
          .stats-row { flex-direction: column !important; }
          .stats-row > * { border-left: none !important; border-right: none !important; border-top: 1px solid rgba(255,255,255,0.08) !important; padding: 28px 0 !important; }
          .footer-inner { flex-direction: column !important; height: auto !important; padding: 24px !important; gap: 16px !important; text-align: center !important; }
          h1.hero-h1 { font-size: 52px !important; }
        }
      `}</style>
      <Navbar />
      <Hero />
      <Marquee />
      <Proof />
      <HowItWorks />
      <Architecture />
      <VideoSection />
      <Features />
      <Traction />
      <DownloadCTA />
      <Footer />
    </>
  );
}
