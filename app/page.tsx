"use client";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#000000] text-white overflow-x-hidden">
        {/* Grid overlay */}
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
          }}
        />

        {/* Floating orbs */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div
            className="absolute w-[400px] h-[400px] rounded-full opacity-20 blur-[120px]"
            style={{
              background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)",
              left: "10%",
              top: "20%",
              animation: "float1 18s ease-in-out infinite",
            }}
          />
          <div
            className="absolute w-[350px] h-[350px] rounded-full opacity-20 blur-[100px]"
            style={{
              background: "radial-gradient(circle, #e8837a 0%, transparent 70%)",
              right: "15%",
              top: "40%",
              animation: "float2 22s ease-in-out infinite",
            }}
          />
          <div
            className="absolute w-[300px] h-[300px] rounded-full opacity-15 blur-[100px]"
            style={{
              background: "radial-gradient(circle, #d4956a 0%, transparent 70%)",
              left: "50%",
              bottom: "20%",
              animation: "float3 20s ease-in-out infinite",
            }}
          />
          <div
            className="absolute w-[280px] h-[280px] rounded-full opacity-15 blur-[90px]"
            style={{
              background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)",
              right: "30%",
              bottom: "35%",
              animation: "float1 25s ease-in-out infinite",
            }}
          />
          <div
            className="absolute w-[320px] h-[320px] rounded-full opacity-10 blur-[110px]"
            style={{
              background: "radial-gradient(circle, #e8837a 0%, transparent 70%)",
              left: "35%",
              top: "60%",
              animation: "float2 19s ease-in-out infinite",
            }}
          />
        </div>

        {/* Navbar */}
        <nav
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-12 h-16"
          style={{
            background: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <span className="font-bold text-white text-lg">Zyph</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-white/90 hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button
              type="button"
              className="px-5 py-2.5 rounded-full text-sm font-medium bg-white/10 text-white border border-white/20 hover:bg-white/15 transition-colors"
            >
              Get Started
            </button>
          </div>
        </nav>

        <main className="relative z-10">
          {/* Hero */}
          <section className="min-h-screen flex flex-col items-center justify-center px-6 pt-16 pb-24 text-center">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
                animation: "fadeUp 0.8s ease-out",
              }}
            >
              <span
                className="w-2 h-2 rounded-full bg-[#7c3aed]"
                style={{ animation: "pulse-glow 2s ease-in-out infinite" }}
              />
              <span className="text-xs font-medium tracking-widest text-white/70">
                NOW IN BETA
              </span>
            </div>

            <h1
              className="font-extrabold leading-[1.1] tracking-tight mb-6 max-w-5xl"
              style={{
                fontSize: "clamp(3.8rem, 9vw, 8.5rem)",
                fontWeight: 800,
                background: "linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.5) 50%, rgba(255,200,190,0.9) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3)) drop-shadow(0 4px 12px rgba(0,0,0,0.2)) drop-shadow(0 0 40px rgba(124,58,237,0.15))",
              }}
            >
              {"Your AI that actually knows you"
                .split(" ")
                .map((word, i) => (
                  <span
                    key={i}
                    className="inline-block mr-[0.25em]"
                    style={{
                      animation: `breeze 4s ease-in-out infinite`,
                      animationDelay: `${i * 0.08}s`,
                    }}
                  >
                    {word}
                  </span>
                ))}
            </h1>

            <p
              className="text-lg max-w-[520px] mb-10"
              style={{
                color: "rgba(255,255,255,0.4)",
                animation: "fadeUp 0.8s ease-out 0.2s both",
              }}
            >
              A personal AI that learns from how you work, think, and communicate—so it can help you without the busywork.
            </p>

            <div
              className="flex flex-wrap items-center justify-center gap-4 mb-14"
              style={{ animation: "fadeUp 0.8s ease-out 0.35s both" }}
            >
              <button
                type="button"
                className="px-8 py-4 rounded-2xl font-semibold text-white transition-all hover:opacity-95"
                style={{
                  background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
                  boxShadow: "0 4px 24px rgba(124,58,237,0.4)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                Get Started — it&apos;s free
              </button>
              <button
                type="button"
                className="px-8 py-4 rounded-2xl font-semibold text-white border border-white/20 transition-all hover:bg-white/5"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  backdropFilter: "blur(12px)",
                }}
              >
                Download Desktop App
              </button>
            </div>

            <div
              className="flex items-center gap-4"
              style={{ animation: "fadeUp 0.8s ease-out 0.5s both" }}
            >
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-[#000] flex items-center justify-center text-sm font-medium"
                    style={{
                      background: i % 2 === 0 ? "#7c3aed" : "#e8837a",
                    }}
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <span className="text-sm text-white/35">
                Trusted by early users across 12 countries
              </span>
            </div>
          </section>

          {/* How it works */}
          <section className="px-6 lg:px-12 py-24 lg:py-32">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <span className="text-xs font-medium tracking-widest text-white/60">
                HOW IT WORKS
              </span>
            </div>
            <h2
              className="text-4xl lg:text-5xl font-bold mb-16 max-w-2xl"
              style={{
                background: "linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.7) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Zyph becomes you
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-16">
              {[
                {
                  step: "01",
                  title: "Zyph watches quietly",
                  desc: "Install and runs silently in the background.",
                  border: "#7c3aed",
                  emoji: "👁️",
                },
                {
                  step: "02",
                  title: "It learns who you are",
                  desc: "Reads screen, words, and workflow to understand your context.",
                  border: "#e8837a",
                  emoji: "🧠",
                },
                {
                  step: "03",
                  title: "Your profile takes shape",
                  desc: "Builds a personal intelligence profile over time.",
                  border: "#d4956a",
                  emoji: "📋",
                },
                {
                  step: "04",
                  title: "AI that already knows you",
                  desc: "Responds like a close colleague—no lengthy context needed.",
                  border: "#7c3aed",
                  emoji: "✨",
                },
              ].map((card) => (
                <div
                  key={card.step}
                  className="relative rounded-2xl p-8 overflow-hidden"
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
                  <span
                    className="absolute top-6 right-6 text-6xl opacity-20"
                    aria-hidden
                  >
                    {card.emoji}
                  </span>
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mb-4"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      color: "white",
                    }}
                  >
                    {card.step}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {card.title}
                  </h3>
                  <p className="text-white/50">{card.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                className="px-10 py-4 rounded-2xl font-semibold text-white transition-all hover:opacity-95"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  backdropFilter: "blur(12px)",
                }}
              >
                Start for free
              </button>
            </div>
          </section>

          {/* Footer */}
          <footer
            className="px-6 py-8 text-center border-t border-white/5"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            <p className="text-sm">
              © 2026 Zyph. Built for the people who never stop.
            </p>
          </footer>
        </main>
      </div>
  );
}
