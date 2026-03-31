"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const BG = "#0a0a0a";
const VIOLET = "#7c3aed";
const CARD = "#111111";
const BORDER = "#1e1e1e";
const MUTED = "#737373";
const SUBTLE = "#404040";

type Billing = "monthly" | "annual";

const TRUST = [
  "Cancel anytime",
  "No surprise charges",
  "14-day free trial",
] as const;

const FREE_FEATURES = [
  "20 screen captures per day",
  "Basic chat with your profile",
  "7-day activity history",
  "Standard insight updates",
];

const PRO_FEATURES = [
  "50 screen captures per day",
  "Priority AI analysis & faster responses",
  "Full history — keep every moment",
  "Early access to new features",
];

const MIRROR_FEATURES = [
  "Unlimited captures",
  "Priority AI analysis & faster responses",
  "Full history — keep every moment",
  "Early access to new features",
  "Priority support",
];

const COMPARE_ROWS: { label: string; free: string; pro: string; mirror: string }[] =
  [
    { label: "Daily captures", free: "20", pro: "50", mirror: "Unlimited" },
    { label: "AI chat", free: "Basic", pro: "Priority", mirror: "Priority" },
    {
      label: "Activity history",
      free: "7 days",
      pro: "Full archive",
      mirror: "Full archive",
    },
    {
      label: "Profile insights",
      free: "Standard",
      pro: "Deeper & faster",
      mirror: "Deeper & faster",
    },
    { label: "New features", free: "—", pro: "Early access", mirror: "Early access" },
    { label: "Support", free: "Community", pro: "Priority", mirror: "Priority" },
];

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M20 6L9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function PricingPage() {
  const router = useRouter();
  const [billing, setBilling] = useState<Billing>("annual");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startProCheckout() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          interval: billing,
          tier: "pro",
          source: "pricing",
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (res.status === 401) {
        router.push("/auth?next=/pricing");
        return;
      }
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Try again.");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError("No checkout URL returned.");
    } catch {
      setError("Network error. Check your connection.");
    } finally {
      setLoading(false);
    }
  }

  async function startMirrorCheckout() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          interval: billing,
          tier: "mirror",
          source: "pricing",
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (res.status === 401) {
        router.push("/auth?next=/pricing");
        return;
      }
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Try again.");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError("No checkout URL returned.");
    } catch {
      setError("Network error. Check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @keyframes pricing-shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes pricing-float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(12px, -20px) scale(1.03); }
        }
        .pricing-noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
        }
      `}</style>

      <div
        className="relative min-h-screen overflow-x-hidden text-[#f0f0f0]"
        style={{ backgroundColor: BG }}
      >
        {/* Ambient */}
        <div
          className="pointer-events-none fixed inset-0 pricing-noise opacity-90"
          aria-hidden
        />
        <div
          className="pointer-events-none fixed -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full blur-[120px] opacity-[0.22]"
          style={{
            background: `radial-gradient(ellipse at center, ${VIOLET} 0%, transparent 65%)`,
            animation: "pricing-float 18s ease-in-out infinite",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none fixed bottom-0 right-0 h-[400px] w-[500px] translate-x-1/4 translate-y-1/4 rounded-full blur-[100px] opacity-[0.12]"
          style={{
            background: `radial-gradient(circle at center, #e8837a 0%, transparent 70%)`,
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none fixed inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
          aria-hidden
        />

        {/* Nav */}
        <header
          className="relative z-20 border-b px-6 py-5 md:px-10"
          style={{ borderColor: BORDER, backgroundColor: "rgba(10,10,10,0.75)" }}
        >
          <nav className="mx-auto flex max-w-6xl items-center justify-between">
            <Link
              href="/"
              className="text-lg font-bold tracking-tight text-white transition-opacity hover:opacity-90"
            >
              Zyph
            </Link>
            <div className="flex items-center gap-6">
              <Link
                href="/auth"
                className="text-sm font-medium transition-colors hover:text-white"
                style={{ color: MUTED }}
              >
                Sign in
              </Link>
              <Link
                href="/auth"
                className="rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: `linear-gradient(135deg, ${VIOLET} 0%, #5b21b6 100%)`,
                  boxShadow: `0 0 24px -4px ${VIOLET}66`,
                }}
              >
                Get started
              </Link>
            </div>
          </nav>
        </header>

        <main className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-16 md:px-10 md:pt-20">
          {/* Hero */}
          <div className="mx-auto max-w-2xl text-center">
            <p
              className="mb-4 text-xs font-semibold uppercase tracking-[0.25em]"
              style={{ color: VIOLET }}
            >
              Pricing
            </p>
            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-white md:text-5xl lg:text-[3.25rem]">
              Your AI that{" "}
              <span className="relative inline-block">
                <span
                  className="relative z-10 bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(90deg, #fff 0%, #c4b5fd 45%, ${VIOLET} 100%)`,
                  }}
                >
                  actually knows you.
                </span>
                <span
                  className="absolute -bottom-1 left-0 right-0 h-3 opacity-40"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${VIOLET}, transparent)`,
                    filter: "blur(8px)",
                  }}
                  aria-hidden
                />
              </span>
            </h1>
            <p
              className="mx-auto mt-5 max-w-lg text-base leading-relaxed md:text-lg"
              style={{ color: MUTED }}
            >
              One subscription unlocks an AI that remembers how you work—not
              just what you typed last Tuesday.
            </p>
          </div>

          {/* Trust */}
          <ul className="mx-auto mt-10 flex flex-wrap items-center justify-center gap-3 md:gap-4">
            {TRUST.map((t) => (
              <li
                key={t}
                className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium"
                style={{
                  borderColor: BORDER,
                  backgroundColor: "rgba(17,17,17,0.8)",
                  color: "#a3a3a3",
                }}
              >
                <span
                  className="flex h-5 w-5 items-center justify-center rounded-full text-white"
                  style={{ backgroundColor: `${VIOLET}33`, color: "#c4b5fd" }}
                >
                  <CheckIcon className="h-3 w-3" />
                </span>
                {t}
              </li>
            ))}
          </ul>

          {/* Billing toggle */}
          <div className="mx-auto mt-14 flex flex-col items-center gap-4">
            <p className="text-sm font-medium" style={{ color: SUBTLE }}>
              Billing
            </p>
            <div
              className="relative grid w-full max-w-md grid-cols-2 rounded-full p-1"
              style={{
                backgroundColor: CARD,
                border: `1px solid ${BORDER}`,
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
              }}
              role="group"
              aria-label="Billing period"
            >
              <span
                className="pointer-events-none absolute top-1 bottom-1 z-0 rounded-full transition-all duration-300 ease-out"
                style={{
                  width: "calc(50% - 6px)",
                  left: billing === "monthly" ? "4px" : "calc(50% + 2px)",
                  background: `linear-gradient(135deg, ${VIOLET}cc 0%, #5b21b6 100%)`,
                  boxShadow: `0 0 20px -2px ${VIOLET}88`,
                }}
                aria-hidden
              />
              <button
                type="button"
                onClick={() => setBilling("monthly")}
                className="relative z-10 flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors md:px-6"
                style={{
                  color: billing === "monthly" ? "#fff" : MUTED,
                }}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBilling("annual")}
                className="relative z-10 flex flex-wrap items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors md:px-6"
                style={{
                  color: billing === "annual" ? "#fff" : MUTED,
                }}
              >
                <span>Annual</span>
                <span
                  className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
                  style={{
                    background: `linear-gradient(90deg, #22c55e, #16a34a)`,
                    boxShadow: "0 0 12px rgba(34,197,94,0.35)",
                  }}
                >
                  Save 75%
                </span>
              </button>
            </div>
            <p className="text-center text-xs" style={{ color: SUBTLE }}>
              Annual: Pro is{" "}
              <span className="font-semibold text-white">$39.99/year</span>, Mirror
              is <span className="font-semibold text-white">$59.99/year</span>.
            </p>
          </div>

          {/* Cards */}
          <div className="mt-14 grid gap-6 md:grid-cols-3 md:gap-8">
            {/* Free */}
            <article
              className="relative flex flex-col rounded-2xl border p-8 md:p-10"
              style={{
                borderColor: BORDER,
                backgroundColor: CARD,
              }}
            >
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white">Free</h2>
                <p className="mt-1 text-sm" style={{ color: MUTED }}>
                  Dip your toes. Zyph still learns you.
                </p>
              </div>
              <div className="mb-8">
                <span className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
                  $0
                </span>
                <span className="text-base font-medium" style={{ color: MUTED }}>
                  {" "}
                  / forever
                </span>
              </div>
              <ul className="mb-10 flex flex-1 flex-col gap-4">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex gap-3 text-sm" style={{ color: "#d4d4d4" }}>
                    <span
                      className="mt-0.5 flex shrink-0 text-emerald-400/90"
                      aria-hidden
                    >
                      <CheckIcon />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth"
                className="inline-flex w-full items-center justify-center rounded-xl border py-3.5 text-sm font-semibold transition-colors hover:bg-white/[0.04]"
                style={{ borderColor: SUBTLE, color: "#fff" }}
              >
                Start on Free
              </Link>
            </article>

            {/* Pro */}
            <article
              className="relative flex flex-col overflow-hidden rounded-2xl p-8 md:p-10"
              style={{
                backgroundColor: "#0f0f12",
                border: `1px solid ${VIOLET}55`,
                boxShadow: `0 0 0 1px rgba(124,58,237,0.15), 0 24px 80px -24px ${VIOLET}66`,
              }}
            >
              <div
                className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-30 blur-3xl"
                style={{ background: VIOLET }}
                aria-hidden
              />
              <div className="relative mb-6 flex items-start justify-between gap-4">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold text-white">Pro</h2>
                    <span
                      className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
                      style={{
                        background: `linear-gradient(90deg, ${VIOLET}, #a78bfa)`,
                      }}
                    >
                      Most popular
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: MUTED }}>
                    For power users who live in flow state.
                  </p>
                </div>
              </div>

              <div className="relative mb-2">
                {billing === "monthly" ? (
                  <>
                    <span className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
                      $9.99
                    </span>
                    <span className="text-base font-medium" style={{ color: MUTED }}>
                      {" "}
                      / month
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
                      $39.99
                    </span>
                    <span className="text-base font-medium" style={{ color: MUTED }}>
                      {" "}
                      / year
                    </span>
                    <p className="mt-2 text-sm font-medium" style={{ color: "#a78bfa" }}>
                      ≈ $3.33/mo · billed annually
                    </p>
                  </>
                )}
              </div>

              <ul className="relative mb-8 mt-6 flex flex-1 flex-col gap-4">
                {PRO_FEATURES.map((f) => (
                  <li key={f} className="flex gap-3 text-sm text-white/90">
                    <span
                      className="mt-0.5 flex shrink-0 text-violet-400"
                      aria-hidden
                    >
                      <CheckIcon />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <div
                className="relative mb-6 rounded-xl border px-4 py-3 text-sm leading-relaxed"
                style={{
                  borderColor: `${VIOLET}40`,
                  background: `linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(91,33,182,0.06) 100%)`,
                }}
              >
                <p className="font-semibold text-white">14-day free trial</p>
                <p className="mt-1 text-xs md:text-sm" style={{ color: "#c4b5fd" }}>
                  Start free, no card required… just kidding—we need it, but you
                  won&apos;t be charged for 14 days.
                </p>
              </div>

              {error ? (
                <p className="relative mb-3 text-center text-sm text-red-400">
                  {error}
                </p>
              ) : null}

              <button
                type="button"
                onClick={startProCheckout}
                disabled={loading}
                className="relative w-full rounded-xl py-4 text-sm font-bold text-white transition-all hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  background: `linear-gradient(90deg, ${VIOLET} 0%, #6d28d9 50%, #5b21b6 100%)`,
                  backgroundSize: "200% 100%",
                  animation: loading ? "none" : "pricing-shimmer 4s linear infinite",
                  boxShadow: `0 8px 32px -8px ${VIOLET}aa`,
                }}
              >
                {loading ? "Opening checkout…" : "Start My Free Trial"}
              </button>
            </article>

            {/* Mirror */}
            <article
              className="relative flex flex-col overflow-hidden rounded-2xl p-8 md:p-10"
              style={{
                backgroundColor: "#0f0f12",
                border: `1px solid ${VIOLET}55`,
                boxShadow: `0 0 0 1px rgba(124,58,237,0.15), 0 24px 80px -24px ${VIOLET}66`,
              }}
            >
              <div
                className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-30 blur-3xl"
                style={{ background: VIOLET }}
                aria-hidden
              />
              <div className="relative mb-6 flex items-start justify-between gap-4">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold text-white">Mirror</h2>
                    <span
                      className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
                      style={{
                        background: `linear-gradient(90deg, ${VIOLET}, #a78bfa)`,
                      }}
                    >
                      Most powerful
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: MUTED }}>
                    For professionals who want total recall.
                  </p>
                </div>
              </div>

              <div className="relative mb-2">
                {billing === "monthly" ? (
                  <>
                    <span className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
                      $24.99
                    </span>
                    <span className="text-base font-medium" style={{ color: MUTED }}>
                      {" "}
                      / month
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
                      $59.99
                    </span>
                    <span className="text-base font-medium" style={{ color: MUTED }}>
                      {" "}
                      / year
                    </span>
                    <p className="mt-2 text-sm font-medium" style={{ color: "#a78bfa" }}>
                      ≈ $5.00/mo · billed annually
                    </p>
                  </>
                )}
              </div>

              <ul className="relative mb-8 mt-6 flex flex-1 flex-col gap-4">
                {MIRROR_FEATURES.map((f) => (
                  <li key={f} className="flex gap-3 text-sm text-white/90">
                    <span
                      className="mt-0.5 flex shrink-0 text-violet-400"
                      aria-hidden
                    >
                      <CheckIcon />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <div
                className="relative mb-6 rounded-xl border px-4 py-3 text-sm leading-relaxed"
                style={{
                  borderColor: `${VIOLET}40`,
                  background: `linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(91,33,182,0.06) 100%)`,
                }}
              >
                <p className="font-semibold text-white">14-day free trial</p>
                <p className="mt-1 text-xs md:text-sm" style={{ color: "#c4b5fd" }}>
                  Start free, no card required… just kidding—we need it, but you
                  won&apos;t be charged for 14 days.
                </p>
              </div>

              {error ? (
                <p className="relative mb-3 text-center text-sm text-red-400">
                  {error}
                </p>
              ) : null}

              <button
                type="button"
                onClick={startMirrorCheckout}
                disabled={loading}
                className="relative w-full rounded-xl py-4 text-sm font-bold text-white transition-all hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  background: `linear-gradient(90deg, ${VIOLET} 0%, #6d28d9 50%, #5b21b6 100%)`,
                  backgroundSize: "200% 100%",
                  animation: loading ? "none" : "pricing-shimmer 4s linear infinite",
                  boxShadow: `0 8px 32px -8px ${VIOLET}aa`,
                }}
              >
                {loading ? "Opening checkout…" : "Start My Free Trial"}
              </button>
            </article>
          </div>

          {/* Comparison */}
          <div className="mt-24 md:mt-28">
            <h2 className="text-center text-2xl font-bold text-white md:text-3xl">
              Compare plans
            </h2>
            <p className="mx-auto mt-3 max-w-md text-center text-sm" style={{ color: MUTED }}>
              Same Zyph brain. Pro removes the guardrails.
            </p>

            <div
              className="mt-10 overflow-hidden rounded-2xl border"
              style={{ borderColor: BORDER, backgroundColor: CARD }}
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                      <th
                        className="px-6 py-4 font-semibold text-white md:px-8"
                        scope="col"
                      >
                        Feature
                      </th>
                      <th
                        className="px-6 py-4 font-semibold md:px-8"
                        style={{ color: MUTED }}
                        scope="col"
                      >
                        Free
                      </th>
                      <th
                        className="px-6 py-4 font-semibold md:px-8"
                        scope="col"
                        style={{ color: "#c4b5fd" }}
                      >
                        Pro
                      </th>
                      <th
                        className="px-6 py-4 font-semibold md:px-8"
                        scope="col"
                        style={{ color: "#c4b5fd" }}
                      >
                        Mirror
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARE_ROWS.map((row, i) => (
                      <tr
                        key={row.label}
                        style={{
                          borderBottom:
                            i < COMPARE_ROWS.length - 1
                              ? `1px solid ${BORDER}`
                              : undefined,
                        }}
                        className="transition-colors hover:bg-white/[0.02]"
                      >
                        <th
                          className="px-6 py-4 font-medium text-white/90 md:px-8"
                          scope="row"
                        >
                          {row.label}
                        </th>
                        <td className="px-6 py-4 md:px-8" style={{ color: MUTED }}>
                          {row.free}
                        </td>
                        <td className="px-6 py-4 font-medium text-white/95 md:px-8">
                          {row.pro}
                        </td>
                        <td className="px-6 py-4 font-medium text-white/95 md:px-8">
                          {row.mirror}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Bottom CTA strip */}
          <div
            className="mt-16 flex flex-col items-center justify-between gap-6 rounded-2xl border px-8 py-10 text-center md:flex-row md:text-left"
            style={{
              borderColor: `${VIOLET}35`,
              background: `linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(17,17,17,0.9) 50%)`,
            }}
          >
            <div>
              <p className="text-lg font-bold text-white">
                Ready for an AI that doesn&apos;t reset every morning?
              </p>
              <p className="mt-1 text-sm" style={{ color: MUTED }}>
                Go Mirror with a 14-day trial. Downgrade or cancel whenever.
              </p>
            </div>
            <button
              type="button"
              onClick={startMirrorCheckout}
              disabled={loading}
              className="shrink-0 rounded-xl px-8 py-3.5 text-sm font-bold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
              style={{
                background: VIOLET,
                boxShadow: `0 8px 24px -6px ${VIOLET}`,
              }}
            >
              {loading ? "Please wait…" : "Start My Free Trial"}
            </button>
          </div>
        </main>

        <footer
          className="relative z-10 border-t px-6 py-10 md:px-10"
          style={{ borderColor: BORDER }}
        >
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 text-sm md:flex-row" style={{ color: MUTED }}>
            <Link href="/" className="font-bold text-white hover:underline">
              Zyph
            </Link>
            <div className="flex flex-wrap justify-center gap-6">
              <Link href="/auth" className="hover:text-white">
                Sign in
              </Link>
              <Link href="/" className="hover:text-white">
                Home
              </Link>
            </div>
            <p>© {new Date().getFullYear()} Zyph</p>
          </div>
        </footer>
      </div>
    </>
  );
}
