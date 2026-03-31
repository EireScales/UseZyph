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
                href="https://github.com/EireScales/UseZyph/releases/download/v1.0.0/Zyph.Setup.1.0.0.exe"
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
          <section className="py-12 border-t border-b bg-[#f9fafb]" style={{ borderColor: BORDER }}>
            <div className="flex flex-wrap items-center justify-center gap-6 px-6">
              <div className="flex -space-x-2">
                {["A", "B", "C", "D", "E"].map((l, i) => (
                  <div
                    key={l}
                    className="w-10 h-10 rounded-full border-2 border-[#f9fafb] flex items-center justify-center text-xs font-semibold text-white"
                    style={{ background: i % 2 === 0 ? PURPLE : ROSE }}
                  >
                    {l}
                  </div>
                ))}
              </div>
              <span className="text-sm" style={{ color: GRAY }}>Joined by early users across 12 countries</span>
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

          {/* Section 4 — How it works */}
          <section className="py-24 px-6 bg-[#f9fafb]">
            <div className="max-w-5xl mx-auto">
              <p className="text-center text-xs font-semibold tracking-widest mb-4" style={{ color: GRAY }}>HOW IT WORKS</p>
              <h2
                ref={(el) => { sectionRefs.current[1] = el; }}
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
                  <div key={step.num} ref={(el) => { sectionRefs.current[2 + i] = el; }} className="section-anim relative bg-white rounded-2xl p-8 border z-10" style={{ borderColor: BORDER }}>
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

          {/* Section 5 — Dashboard mockup */}
          <section className="py-24 px-6 bg-white">
            <div className="max-w-6xl mx-auto">
              <h2
                ref={(el) => { sectionRefs.current[6] = el; }}
                className="section-anim text-4xl md:text-5xl font-extrabold text-center mb-4"
                style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
              >
                A dashboard that thinks like you
              </h2>
              <p className="section-anim text-center text-lg mb-16 max-w-2xl mx-auto" style={{ color: GRAY }}>
                Track what Zyph has learned, review your insights, and chat with an AI that already has full context.
              </p>
              <div
                ref={(el) => { sectionRefs.current[7] = el; }}
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

          {/* Section 6 — Features */}
          <section className="py-24 px-6 bg-[#f9fafb]">
            <div className="max-w-5xl mx-auto">
              <h2
                ref={(el) => { sectionRefs.current[8] = el; }}
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
                    ref={(el) => { sectionRefs.current[9 + i] = el; }}
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

          {/* Section 7 — Download CTA */}
          <section id="download" className="py-24 px-6 bg-[#0a0a0a] text-white">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-4xl md:text-[56px] font-extrabold leading-tight mb-6" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
                Meet the AI that gets you.
              </h2>
              <p className="text-lg mb-10 opacity-60">
                Download the desktop app and let Zyph start learning. Free to start.
              </p>
              <Link
                href="https://github.com/EireScales/UseZyph/releases/download/v1.0.0/Zyph.Setup.1.0.0.exe"
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

          {/* Section 8 — Footer */}
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
