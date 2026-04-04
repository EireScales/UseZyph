"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const PURPLE = "#7c3aed";
const ROSE = "#e8837a";
const BORDER = "#e5e7eb";
const GRAY = "#6b7280";
const BLACK = "#0a0a0a";

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const statRef = useRef<HTMLDivElement>(null);
  const [statVisible, setStatVisible] = useState(false);
  const [counts, setCounts] = useState({ weeks: 0, prompts: 0, infinity: 0 });

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("section-visible");
          }
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
      (entries) => {
        if (entries[0]?.isIntersecting) setStatVisible(true);
      },
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
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&display=swap');
        html { scroll-behavior: smooth; }
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .hero-anim { opacity: 0; animation: heroFadeUp 0.6s ease-out forwards; }
        .section-anim { opacity: 0; transform: translateY(16px); transition: opacity 0.5s ease, transform 0.5s ease; }
        .section-anim.section-visible { opacity: 1; transform: translateY(0); }
        .btn-primary:hover, .btn-secondary:hover { transform: scale(1.02); }
        .btn-primary, .btn-secondary { transition: transform 0.2s ease; }
      `}</style>

      <div className="min-h-screen bg-white text-[#0a0a0a]" style={{ fontFamily: "system-ui, sans-serif" }}>
        {/* Navbar */}
        <nav
          className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 h-16 bg-white border-b"
          style={{ borderColor: BORDER }}
        >
          <Link href="/" className="text-xl font-bold text-[#0a0a0a]" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
            Zyph
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/auth" className="hidden md:inline text-sm font-medium hover:text-[#0a0a0a] transition-colors" style={{ color: GRAY }}>
              Sign In
            </Link>
            <Link
              href="/auth"
              className="btn-primary px-8 py-3 rounded-full text-sm font-semibold text-white"
              style={{ background: PURPLE }}
            >
              Get Started
            </Link>
          </div>
        </nav>

        <main>
          {/* Section 1 — Hero */}
          <section ref={heroRef} className="min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-16 bg-white">
            <p
              className="hero-anim text-xs font-semibold tracking-[0.2em] uppercase mb-6"
              style={{ color: PURPLE, animationDelay: "0.1s" }}
            >
              NOW IN BETA ✦
            </p>
            <h1
              className="hero-anim text-5xl md:text-[80px] font-extrabold leading-[1.05] tracking-tight text-center max-w-4xl mb-8"
              style={{ fontFamily: "'DM Sans', system-ui, sans-serif", animationDelay: "0.2s" }}
            >
              Your AI that
              <br />
              <span className="relative inline-block">
                actually knows you.
                <svg className="absolute -bottom-1 left-0 w-full h-3" viewBox="0 0 200 12" fill="none" style={{ color: ROSE }}>
                  <path d="M2 8C40 4 80 10 120 6C160 2 180 8 198 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
            <p
              className="hero-anim text-lg text-center max-w-[520px] mb-10 leading-relaxed"
              style={{ color: GRAY, animationDelay: "0.35s" }}
            >
              Zyph watches how you work and builds a personal AI profile — so every conversation starts where you left off.
            </p>
            <div className="hero-anim flex flex-wrap items-center justify-center gap-4 mb-6" style={{ animationDelay: "0.45s" }}>
              <Link
                href="https://github.com/EireScales/UseZyph/releases/download/v1.0.0/Zyph%20Setup%201.0.0.exe"
                className="btn-primary px-8 py-3 rounded-full font-semibold text-white"
                style={{ background: PURPLE }}
              >
                Download Desktop App
              </Link>
              <Link
                href="/auth"
                className="btn-secondary px-8 py-3 rounded-full font-semibold bg-white border-2"
                style={{ borderColor: BLACK, color: BLACK }}
              >
                Sign in free
              </Link>
            </div>
            <p className="hero-anim text-sm" style={{ color: GRAY, animationDelay: "0.55s" }}>
              Free to start · No credit card · Works in the background
            </p>

            {/* Chat UI mockup */}
            <div
              className="hero-anim mt-16 w-full max-w-4xl mx-auto rounded-2xl shadow-2xl overflow-hidden border"
              style={{ borderColor: BORDER, animationDelay: "0.65s", transform: "scale(0.75)", transformOrigin: "top center" }}
            >
              <div className="bg-[#f3f4f6] px-4 py-3 flex items-center gap-2 border-b" style={{ borderColor: BORDER }}>
                <span className="w-3 h-3 rounded-full bg-[#e5e7eb]" />
                <span className="w-3 h-3 rounded-full bg-[#e5e7eb]" />
                <span className="w-3 h-3 rounded-full bg-[#e5e7eb]" />
              </div>
              <div className="flex min-h-[380px]" style={{ background: BLACK }}>
                <aside className="w-48 shrink-0 py-6 px-4 border-r" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                  <p className="text-white font-bold text-sm mb-8">Zyph</p>
                  <nav className="space-y-1 text-sm text-white/70">
                    <div className="py-2 px-3 rounded-lg text-white/90">Home</div>
                    <div className="py-2 px-3">My Profile</div>
                    <div className="py-2 px-3">Insights</div>
                    <div className="py-2 px-3 rounded-lg bg-white/10 text-white">Chat</div>
                    <div className="py-2 px-3">Settings</div>
                  </nav>
                </aside>
                <div className="flex-1 flex flex-col p-6">
                  <p className="text-white/50 text-sm text-center mt-16 mb-6">
                    Ask anything. Zyph uses your profile to respond.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {["Help me write an email", "What have you learned about me?", "Summarise my week"].map((s) => (
                      <span
                        key={s}
                        className="px-4 py-2 rounded-full text-sm text-white/80 border border-white/10"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="mt-auto flex gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="flex-1 text-sm text-white/40">Message Zyph...</span>
                    <button type="button" className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: PURPLE }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2 — Social proof */}
          <section className="py-8 border-t border-b overflow-hidden" style={{ borderColor: BORDER, background: '#f9fafb' }}>
            <div style={{ display: 'flex', width: 'max-content', animation: 'marquee 20s linear infinite' }}>
              {[...Array(16)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 shrink-0 px-8" style={{ opacity: 0.35 }}>
                  <svg width="28" height="28" viewBox="0 0 100 100" fill="none">
                    <circle cx="50" cy="50" r="26" stroke="#7c3aed" strokeWidth="5" opacity="0.35"/>
                    <circle cx="50" cy="50" r="16" stroke="#7c3aed" strokeWidth="5" opacity="0.65"/>
                    <circle cx="50" cy="50" r="7" fill="#7c3aed"/>
                    <line x1="50" y1="16" x2="50" y2="10" stroke="#7c3aed" strokeWidth="4" strokeLinecap="round" opacity="0.5"/>
                    <line x1="50" y1="84" x2="50" y2="90" stroke="#7c3aed" strokeWidth="4" strokeLinecap="round" opacity="0.5"/>
                    <line x1="16" y1="50" x2="10" y2="50" stroke="#7c3aed" strokeWidth="4" strokeLinecap="round" opacity="0.5"/>
                    <line x1="84" y1="50" x2="90" y2="50" stroke="#7c3aed" strokeWidth="4" strokeLinecap="round" opacity="0.5"/>
                  </svg>
                  <span className="text-sm font-bold tracking-tight" style={{ color: '#7c3aed', fontFamily: "'DM Sans', system-ui, sans-serif" }}>Zyph</span>
                </div>
              ))}
            </div>
          </section>

          {/* Section 3 — Problem */}
          <section className="py-24 px-6 bg-white">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-start gap-16">
              <div className="flex-1">
                <p className="text-xs font-semibold tracking-widest mb-4" style={{ color: GRAY }}>THE PROBLEM</p>
                <h2
                  ref={(el) => { sectionRefs.current[0] = el; }}
                  className="section-anim text-4xl md:text-[56px] font-extrabold leading-tight tracking-tight mb-4"
                  style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
                >
                  Every other AI starts from zero.
                </h2>
                <p className="text-2xl md:text-3xl font-extrabold italic mb-8 pl-4 border-l-4" style={{ borderColor: ROSE, color: BLACK }}>
                  Every. Single. Time.
                </p>
                <p className="text-lg leading-relaxed max-w-xl" style={{ color: GRAY }}>
                  You explain your role, your context, your preferences — then close the tab. Tomorrow you do it again. ChatGPT doesn&apos;t remember you. Claude doesn&apos;t know your style. You&apos;re always the new hire explaining yourself to a tool that should work for you.
                </p>
              </div>
              <div ref={statRef} className="flex-1 grid gap-8 md:max-w-xs">
                <div>
                  <p className="text-4xl font-extrabold text-[#0a0a0a]" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
                    {statVisible ? `2–${counts.weeks} weeks` : "2–4 weeks"}
                  </p>
                  <p className="text-sm mt-1" style={{ color: GRAY }}>to build your full profile</p>
                </div>
                <div>
                  <p className="text-4xl font-extrabold text-[#0a0a0a]" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>0</p>
                  <p className="text-sm mt-1" style={{ color: GRAY }}>prompts needed to get started</p>
                </div>
                <div>
                  <p className="text-4xl font-extrabold text-[#0a0a0a]" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>∞</p>
                  <p className="text-sm mt-1" style={{ color: GRAY }}>context retained over time</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4 — What is Zyph? */}
          <section className="py-32 px-6 bg-[#0a0a0a] text-white overflow-hidden">
            <div className="max-w-5xl mx-auto">
              {/* Label */}
              <p className="text-center text-xs font-semibold tracking-[0.25em] uppercase mb-6 text-[#7c3aed]">
                WHAT IS ZYPH?
              </p>

              {/* Main equation */}
              <div
                ref={(el) => { sectionRefs.current[1] = el; }}
                className="section-anim text-center mb-6"
              >
                <h2
                  className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight"
                  style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
                >
                  <span className="text-white">Zyph = </span>
                  <span style={{ color: "#7c3aed" }}>Personal Data Engine</span>
                  <span className="text-white/40"> + </span>
                  <span style={{ color: "#e8837a" }}>Behavioural Memory Layer</span>
                </h2>
              </div>

              {/* Subheading */}
              <p className="text-center text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-20 leading-relaxed">
                Most AI tools give you a blank canvas every session. Zyph gives you an AI that has been silently studying you — your patterns, your tools, your language, your pace — and remembers all of it.
              </p>

              {/* Two column pillars */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {/* Pillar 1 */}
                <div
                  className="rounded-2xl p-8 border relative overflow-hidden"
                  style={{ background: "rgba(124,58,237,0.06)", borderColor: "rgba(124,58,237,0.25)" }}
                >
                  <div
                    className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-20"
                    style={{ background: "#7c3aed" }}
                  />
                  <div
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-5"
                    style={{ background: "rgba(124,58,237,0.15)", color: "#a78bfa" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7c3aed]" />
                    Personal Data Engine
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
                    It observes. Constantly.
                  </h3>
                  <p className="text-white/50 leading-relaxed text-sm mb-6">
                    Every 30 seconds, Zyph silently reads your screen — every app, every document, every browser tab. It doesn&apos;t interrupt. It doesn&apos;t ask. It simply watches and extracts signal from noise.
                  </p>
                  <ul className="space-y-2">
                    {["Screen-level context capture", "OCR across every application", "App usage & behavioural patterns", "Structured, categorised memory"].map((item) => (
                      <li key={item} className="flex items-center gap-2.5 text-sm text-white/70">
                        <span className="w-1 h-1 rounded-full shrink-0" style={{ background: "#7c3aed" }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pillar 2 */}
                <div
                  className="rounded-2xl p-8 border relative overflow-hidden"
                  style={{ background: "rgba(232,131,122,0.06)", borderColor: "rgba(232,131,122,0.25)" }}
                >
                  <div
                    className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-20"
                    style={{ background: "#e8837a" }}
                  />
                  <div
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-5"
                    style={{ background: "rgba(232,131,122,0.15)", color: "#f9a89f" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#e8837a]" />
                    Behavioural Memory Layer
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
                    It remembers. Everything.
                  </h3>
                  <p className="text-white/50 leading-relaxed text-sm mb-6">
                    Observations are distilled into a living intelligence profile — your work style, communication patterns, tools, interests, and cognitive rhythms. This profile powers every conversation, permanently.
                  </p>
                  <ul className="space-y-2">
                    {["Persistent insight profile", "Communication style modelling", "Tool & workflow mapping", "Context that compounds over time"].map((item) => (
                      <li key={item} className="flex items-center gap-2.5 text-sm text-white/70">
                        <span className="w-1 h-1 rounded-full shrink-0" style={{ background: "#e8837a" }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bottom contrast statement */}
              <div
                className="rounded-2xl p-8 border text-center"
                style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}
              >
                <p className="text-white/30 text-sm uppercase tracking-widest mb-3 font-semibold">The result</p>
                <p className="text-2xl md:text-3xl font-extrabold text-white leading-snug" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
                  An AI that doesn&apos;t need you to explain yourself.<br />
                  <span className="text-white/40">Because it was already paying attention.</span>
                </p>
              </div>
            </div>
          </section>

          {/* Section 5 — How it works */}
          <section className="py-24 px-6 bg-[#f9fafb]">
            <div className="max-w-5xl mx-auto">
              <p className="text-center text-xs font-semibold tracking-widest mb-4" style={{ color: GRAY }}>HOW IT WORKS</p>
              <h2
                ref={(el) => { sectionRefs.current[2] = el; }}
                className="section-anim text-4xl md:text-5xl font-extrabold text-center mb-20"
                style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
              >
                Zyph becomes you.
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4 relative">
                <div className="absolute top-1/2 left-0 right-0 h-0 border-t border-dashed hidden md:block" style={{ borderColor: BORDER, transform: "translateY(-50%)", left: "12.5%", right: "12.5%" }} />
                {[
                  { num: "01", title: "Runs quietly", body: "Install the desktop app. It captures your screen every 30 seconds, silently." },
                  { num: "02", title: "Reads everything", body: "OCR extracts text from every app, doc, and browser tab you use." },
                  { num: "03", title: "Builds your profile", body: "Over 2–4 weeks, Zyph maps your communication style, interests, and patterns." },
                  { num: "04", title: "Knows you", body: "Open chat and ask anything. No context needed. It already knows." },
                ].map((step, i) => (
                  <div key={step.num} ref={(el) => { sectionRefs.current[3 + i] = el; }} className="section-anim relative bg-white rounded-2xl p-8 border z-10" style={{ borderColor: BORDER }}>
                    <p className="text-6xl font-extrabold mb-2" style={{ color: "#f3f4f6", fontFamily: "'DM Sans', system-ui, sans-serif" }}>{step.num}</p>
                    <h3 className="text-lg font-bold text-[#0a0a0a] mb-2" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>{step.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: GRAY }}>{step.body}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-center mt-12">
                <Link
                  href="/auth"
                  className="btn-primary px-8 py-3 rounded-full font-semibold text-white"
                  style={{ background: PURPLE }}
                >
                  Start for free
                </Link>
              </div>
            </div>
          </section>

          {/* Section 6 — See it in action */}
          <section className="py-24 px-6 bg-[#0a0a0a]">
            <div className="max-w-5xl mx-auto text-center">
              <h2
                ref={(el) => { sectionRefs.current[7] = el; }}
                className="section-anim text-4xl md:text-5xl font-extrabold text-center mb-4 text-white"
                style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
              >
                See it in action
              </h2>
              <p className="section-anim text-center text-lg text-white/60">
                Watch how Zyph learns and adapts to you.
              </p>

              <div
                ref={(el) => { sectionRefs.current[8] = el; }}
                className="section-anim mt-12 w-full max-w-[900px] mx-auto rounded-2xl overflow-hidden border border-white/10"
                style={{ aspectRatio: "16 / 9" }}
              >
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/nsGnxbgrk14"
                  title="See it in action"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </section>

          {/* Section 7 — Dashboard mockup */}
          <section className="py-24 px-6 bg-white">
            <div className="max-w-6xl mx-auto">
              <h2
                ref={(el) => { sectionRefs.current[9] = el; }}
                className="section-anim text-4xl md:text-5xl font-extrabold text-center mb-4"
                style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
              >
                A dashboard that thinks like you
              </h2>
              <p className="section-anim text-center text-lg mb-16 max-w-2xl mx-auto" style={{ color: GRAY }}>
                Track what Zyph has learned, review your insights, and chat with an AI that already has full context.
              </p>
              <div
                ref={(el) => { sectionRefs.current[10] = el; }}
                className="section-anim rounded-2xl shadow-2xl overflow-hidden border w-full"
                style={{ borderColor: BORDER }}
              >
                <div className="bg-[#f3f4f6] px-4 py-3 flex items-center gap-2 border-b" style={{ borderColor: BORDER }}>
                  <span className="w-3 h-3 rounded-full bg-[#e5e7eb]" /><span className="w-3 h-3 rounded-full bg-[#e5e7eb]" /><span className="w-3 h-3 rounded-full bg-[#e5e7eb]" />
                </div>
                <div className="flex min-h-[420px]" style={{ background: BLACK }}>
                  <aside className="w-48 shrink-0 py-6 px-4 border-r" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                    <p className="text-white font-bold text-sm mb-8">Zyph</p>
                    <nav className="space-y-1 text-sm text-white/70">
                      <div className="py-2 px-3 rounded-lg text-white/90">Home</div>
                      <div className="py-2 px-3">My Profile</div>
                      <div className="py-2 px-3">Insights</div>
                      <div className="py-2 px-3">Chat</div>
                      <div className="py-2 px-3">Settings</div>
                    </nav>
                  </aside>
                  <div className="flex-1 p-8">
                    <h3 className="text-2xl font-bold text-white mb-6">Good evening</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      {["Total Observations", "Days Active", "Insights Generated", "Top App Used"].map((label, i) => (
                        <div key={label} className="rounded-xl p-4 bg-white/5 border border-white/10">
                          <div className="h-1 w-8 rounded mb-2" style={{ background: i % 2 === 0 ? PURPLE : ROSE }} />
                          <p className="text-xs text-white/50">{label}</p>
                          <p className="text-lg font-semibold text-white">—</p>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2 rounded-xl p-4 bg-white/5 border border-white/10">
                        <p className="text-sm font-medium text-white mb-2">Recent Activity</p>
                        <p className="text-xs text-white/40">No observations yet.</p>
                      </div>
                      <div className="rounded-xl p-4 border" style={{ borderColor: "rgba(232,131,122,0.3)", background: "rgba(232,131,122,0.08)" }}>
                        <p className="text-sm font-medium text-white mb-1">Chat with Zyph</p>
                        <p className="text-xs text-white/50 mb-3">Ask anything.</p>
                        <span className="text-xs" style={{ color: ROSE }}>Open Chat →</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 8 — Features */}
          <section className="py-24 px-6 bg-[#f9fafb]">
            <div className="max-w-5xl mx-auto">
              <h2
                ref={(el) => { sectionRefs.current[11] = el; }}
                className="section-anim text-4xl font-extrabold text-center mb-16"
                style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
              >
                Built for people who move fast
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { emoji: "🧠", title: "Writes in your voice", body: "Emails, Slack messages, proposals. All sound exactly like you." },
                  { emoji: "⚡", title: "Zero setup", body: "No prompts, no onboarding questionnaires. Just install and work normally." },
                  { emoji: "🔒", title: "Private by design", body: "Your data is yours. Processed securely, never sold, never shared." },
                ].map((f, i) => (
                  <div
                    key={f.title}
                    ref={(el) => { sectionRefs.current[12 + i] = el; }}
                    className="section-anim bg-white rounded-2xl p-8 border"
                    style={{ borderColor: BORDER }}
                  >
                    <span className="text-3xl block mb-4">{f.emoji}</span>
                    <h3 className="text-xl font-bold text-[#0a0a0a] mb-3" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>{f.title}</h3>
                    <p className="text-base leading-relaxed" style={{ color: GRAY }}>{f.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section 9 — Download CTA */}
          <section id="download" className="py-24 px-6 bg-[#0a0a0a] text-white">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-4xl md:text-[56px] font-extrabold leading-tight mb-6" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
                Meet the AI that gets you.
              </h2>
              <p className="text-lg mb-10 opacity-60">
                Download the desktop app and let Zyph start learning. Free to start.
              </p>
              <Link
                href="https://github.com/EireScales/UseZyph/releases/download/v1.0.0/Zyph%20Setup%201.0.0.exe"
                className="btn-primary inline-block px-10 py-4 rounded-full font-semibold text-[#0a0a0a] bg-white hover:opacity-95 transition-opacity"
              >
                Download Desktop App
              </Link>
              <p className="mt-6">
                <Link href="/auth" className="text-sm font-medium hover:underline" style={{ color: PURPLE }}>
                  Also available on web →
                </Link>
              </p>
            </div>
          </section>

          {/* Section 10 — Footer */}
          <footer
            className="flex flex-wrap items-center justify-between px-6 md:px-12 h-24 border-t bg-white"
            style={{ borderColor: BORDER }}
          >
            <div className="flex items-center gap-4">
              <Link href="/" className="text-lg font-bold text-[#0a0a0a]" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>Zyph</Link>
              <span className="text-sm" style={{ color: GRAY }}>© 2025 Zyph. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/auth" className="text-sm hover:text-[#0a0a0a] transition-colors" style={{ color: GRAY }}>Sign In</Link>
              <Link href="/privacy" className="text-sm hover:text-[#0a0a0a] transition-colors" style={{ color: GRAY }}>Privacy</Link>
              <Link href="/terms" className="text-sm hover:text-[#0a0a0a] transition-colors" style={{ color: GRAY }}>Terms</Link>
            </div>
          </footer>
        </main>
      </div>
    </>
  );
}
