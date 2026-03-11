"use client";

import Link from "next/link";

const COLORS = {
  purple: "#7c3aed",
  rose: "#e8837a",
  black: "#000000",
} as const;

export default function Home() {
  const heroWords = "Your AI that actually knows you".split(" ");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap');
        :root {
          --zyph-purple: ${COLORS.purple};
          --zyph-rose: ${COLORS.rose};
          --zyph-black: ${COLORS.black};
        }
        html { scroll-behavior: smooth; }
        @keyframes heroWordIn {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes orbBreathe {
          0%, 100% { transform: scale(1); opacity: 0.25; }
          50% { transform: scale(1.1); opacity: 0.35; }
        }
        .hero-word { animation: heroWordIn 0.8s ease-out forwards; opacity: 0; }
        .orb { animation: orbBreathe 8s ease-in-out infinite alternate; }
        .card-hover { transition: all 0.3s ease; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(124, 58, 237, 0.15); }
      `}</style>

      <div
        className="min-h-screen text-white overflow-x-hidden"
        style={{ background: "var(--zyph-black)", fontFamily: "'Inter', sans-serif" }}
      >
        {/* Breathing orbs — hero background */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div
            className="orb absolute w-[min(80vw,600px)] h-[min(80vw,600px)] rounded-full blur-[120px]"
            style={{
              background: `radial-gradient(circle, ${COLORS.purple} 0%, transparent 70%)`,
              left: "-10%",
              top: "-10%",
            }}
          />
          <div
            className="orb absolute w-[min(70vw,500px)] h-[min(70vw,500px)] rounded-full blur-[100px]"
            style={{
              background: `radial-gradient(circle, ${COLORS.rose} 0%, transparent 70%)`,
              right: "-5%",
              bottom: "-15%",
            }}
          />
        </div>

        {/* Navbar */}
        <nav
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-12 h-16"
          style={{
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(124, 58, 237, 0.2)",
            boxShadow: "0 0 20px rgba(124, 58, 237, 0.05)",
          }}
        >
          <Link
            href="/"
            className="text-lg font-bold text-white tracking-wide"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Zyph
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/auth"
              className="text-sm font-medium text-white/90 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth"
              className="px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-95"
              style={{
                background: COLORS.purple,
                boxShadow: `0 4px 14px ${COLORS.purple}40`,
              }}
            >
              Get Started
            </Link>
          </div>
        </nav>

        <main className="relative z-10">
          {/* 1. Hero — full viewport */}
          <section className="min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-24 text-center">
            <h1
              className="font-extrabold leading-[1.1] tracking-tight mb-8 max-w-5xl"
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: "clamp(2.5rem, 7vw, 5rem)",
                background: `linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.7) 50%, ${COLORS.rose} 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {heroWords.map((word, i) => (
                <span
                  key={i}
                  className="hero-word inline-block mr-[0.2em]"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  {word}
                </span>
              ))}
            </h1>
            <p
              className="text-lg max-w-[540px] mb-10 text-white/60 leading-relaxed"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              A personal AI that learns from how you work, think, and
              communicate—so it can help you without the busywork.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
              <Link
                href="/auth"
                className="px-8 py-4 rounded-full font-semibold text-white transition-all hover:opacity-95"
                style={{
                  background: COLORS.purple,
                  boxShadow: `0 4px 24px ${COLORS.purple}66`,
                }}
              >
                Get Started — it&apos;s free
              </Link>
              <Link
                href="#"
                className="px-8 py-4 rounded-full font-semibold text-white border border-white/15 transition-all hover:bg-white/5"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  backdropFilter: "blur(12px)",
                }}
              >
                Download Desktop App
              </Link>
            </div>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className="flex -space-x-3">
                {["A", "B", "C", "D", "E"].map((letter, i) => (
                  <div
                    key={letter}
                    className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center text-sm font-semibold"
                    style={{
                      background: `linear-gradient(135deg, ${COLORS.purple} 0%, ${COLORS.rose} 100%)`,
                    }}
                  >
                    {letter}
                  </div>
                ))}
              </div>
              <span className="text-sm text-white/45">
                Trusted by early users across 12 countries
              </span>
            </div>
          </section>

          {/* 2. Problem / Solution banner */}
          <section
            className="w-full py-24 px-6"
            style={{
              borderTop: "1px solid rgba(124, 58, 237, 0.2)",
              borderBottom: "1px solid rgba(124, 58, 237, 0.2)",
              background: "rgba(0,0,0,0.3)",
            }}
          >
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-stretch gap-0">
              <div className="flex-1 py-8 md:py-12 md:pr-12 flex flex-col justify-center">
                <p
                  className="text-2xl md:text-3xl font-bold leading-snug text-white/95"
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    color: "rgba(255, 200, 200, 0.95)",
                  }}
                >
                  Every other AI starts from zero. Every. Single. Time.
                </p>
              </div>
              <div
                className="w-px shrink-0 self-stretch min-h-[80px] md:min-h-0"
                style={{
                  background: `linear-gradient(180deg, transparent, ${COLORS.purple}, ${COLORS.rose}, transparent)`,
                  boxShadow: `0 0 20px ${COLORS.purple}60`,
                }}
              />
              <div className="flex-1 py-8 md:py-12 md:pl-12 flex flex-col justify-center">
                <p
                  className="text-xl md:text-2xl font-semibold leading-snug text-white/90"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  Zyph remembers everything. It learns your style, your work,
                  your world — and gets smarter every day.
                </p>
              </div>
            </div>
          </section>

          {/* 3. How it works */}
          <section className="py-24 px-6 lg:px-12">
            <div className="max-w-5xl mx-auto">
              <div
                className="inline-block px-4 py-2 rounded-full mb-6 text-xs font-semibold tracking-widest text-white/60"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                HOW IT WORKS
              </div>
              <h2
                className="text-4xl lg:text-5xl font-bold mb-16 text-white"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Zyph becomes you
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {[
                  {
                    step: "01",
                    icon: "eye",
                    title: "Zyph watches quietly",
                    desc: "Runs silently in the background, capturing how you work.",
                    border: COLORS.purple,
                  },
                  {
                    step: "02",
                    icon: "brain",
                    title: "It learns who you are",
                    desc: "Reads your screen, words, and workflow to understand your context.",
                    border: COLORS.rose,
                  },
                  {
                    step: "03",
                    icon: "user",
                    title: "Your profile takes shape",
                    desc: "Builds a deep personal intelligence profile over 2–4 weeks.",
                    border: COLORS.purple,
                  },
                  {
                    step: "04",
                    icon: "sparkles",
                    title: "AI that already knows you",
                    desc: "Responds like a close colleague — no lengthy context needed.",
                    border: COLORS.rose,
                  },
                ].map((card) => (
                  <div
                    key={card.step}
                    className="card-hover relative rounded-2xl p-8 overflow-hidden"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      backdropFilter: "blur(20px)",
                    }}
                  >
                    <div
                      className="absolute top-0 left-0 right-0 h-1"
                      style={{ background: card.border }}
                    />
                    <div className="flex items-start gap-4">
                      <span
                        className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0"
                        style={{
                          background: "rgba(255,255,255,0.08)",
                          color: "white",
                        }}
                      >
                        {card.step}
                      </span>
                      <div>
                        <h3
                          className="text-xl font-semibold text-white mb-2"
                          style={{ fontFamily: "'Syne', sans-serif" }}
                        >
                          {card.title}
                        </h3>
                        <p className="text-white/55 leading-relaxed">
                          {card.desc}
                        </p>
                      </div>
                    </div>
                    {card.icon === "eye" && (
                      <svg className="absolute top-6 right-6 w-8 h-8 text-white/15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                    {card.icon === "brain" && (
                      <svg className="absolute top-6 right-6 w-8 h-8 text-white/15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                    )}
                    {card.icon === "user" && (
                      <svg className="absolute top-6 right-6 w-8 h-8 text-white/15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    )}
                    {card.icon === "sparkles" && (
                      <svg className="absolute top-6 right-6 w-8 h-8 text-white/15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-center">
                <Link
                  href="/auth"
                  className="px-10 py-4 rounded-2xl font-semibold text-white transition-all hover:opacity-95"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  Start for free
                </Link>
              </div>
            </div>
          </section>

          {/* 4. Feature highlights — 3 columns */}
          <section className="py-24 px-6 lg:px-12">
            <div className="max-w-5xl mx-auto">
              <h2
                className="text-3xl lg:text-4xl font-bold text-white mb-16 text-center"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Built for people who move fast
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    emoji: "🧠",
                    title: "Knows your style",
                    body: "Writes emails, messages, and docs in your exact voice.",
                  },
                  {
                    emoji: "⚡",
                    title: "Zero setup",
                    body: "No prompts, no onboarding, no re-explaining yourself.",
                  },
                  {
                    emoji: "🔒",
                    title: "Private by design",
                    body: "Your data stays yours. Always.",
                  },
                ].map((f) => (
                  <div
                    key={f.title}
                    className="card-hover rounded-2xl p-8 text-center"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      backdropFilter: "blur(20px)",
                    }}
                  >
                    <span className="text-4xl mb-4 block">{f.emoji}</span>
                    <h3
                      className="text-xl font-bold text-white mb-3"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                      {f.title}
                    </h3>
                    <p className="text-white/55 leading-relaxed">{f.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 5. Testimonials */}
          <section className="py-24 px-6 lg:px-12">
            <div className="max-w-5xl mx-auto">
              <h2
                className="text-3xl lg:text-4xl font-bold text-white mb-16 text-center"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                What early users say
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    quote:
                      "Finally an AI that doesn't make me feel like I'm talking to a stranger every time.",
                    name: "Sarah K.",
                    role: "Founder",
                  },
                  {
                    quote:
                      "The writing assistant alone is worth it. It sounds exactly like me.",
                    name: "Marcus T.",
                    role: "Sales Lead",
                  },
                  {
                    quote:
                      "I use it before every client call. Game changer.",
                    name: "Priya M.",
                    role: "Consultant",
                  },
                ].map((t) => (
                  <div
                    key={t.name}
                    className="rounded-2xl p-8 flex flex-col"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      backdropFilter: "blur(20px)",
                    }}
                  >
                    <p className="text-white/90 leading-relaxed mb-6 flex-1">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white"
                        style={{
                          background: `linear-gradient(135deg, ${COLORS.purple} 0%, ${COLORS.rose} 100%)`,
                        }}
                      >
                        {t.name[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{t.name}</p>
                        <p className="text-sm text-white/50">{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 6. Final CTA */}
          <section
            className="py-24 px-6 relative"
            style={{
              background: `radial-gradient(ellipse 80% 60% at 50% 50%, ${COLORS.purple}20 0%, ${COLORS.rose}08 40%, transparent 70%)`,
            }}
          >
            <div className="max-w-3xl mx-auto text-center">
              <h2
                className="text-4xl lg:text-5xl font-bold text-white mb-6"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Meet the AI that gets you.
              </h2>
              <p className="text-white/60 text-lg mb-10">
                Join the beta. Free to start.
              </p>
              <Link
                href="/auth"
                className="inline-block px-10 py-4 rounded-full font-semibold text-white transition-all hover:opacity-95"
                style={{
                  background: COLORS.purple,
                  boxShadow: `0 8px 32px ${COLORS.purple}66`,
                }}
              >
                Get Started — it&apos;s free
              </Link>
            </div>
          </section>

          {/* 7. Footer */}
          <footer
            className="py-8 px-6 text-center border-t border-white/5"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            <p className="text-sm">
              © 2025 Zyph. Built for people who think fast.
            </p>
          </footer>
        </main>
      </div>
    </>
  );
}
