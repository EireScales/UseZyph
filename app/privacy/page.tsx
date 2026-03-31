"use client";

import Link from "next/link";

const BORDER = "#1f2937";
const MUTED = "rgba(255,255,255,0.68)";
const BG = "#0a0a0a";

export default function PrivacyPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&display=swap');
        html { scroll-behavior: smooth; }
        a { text-underline-offset: 3px; }
      `}</style>

      <div
        className="min-h-screen"
        style={{ background: BG, color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif" }}
      >
        {/* Navbar (homepage style, dark variant) */}
        <nav
          className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 h-16 border-b"
          style={{ borderColor: BORDER, background: BG }}
        >
          <Link href="/" className="text-xl font-bold text-white">
            Zyph
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/auth" className="hidden md:inline text-sm font-medium hover:text-white transition-colors" style={{ color: MUTED }}>
              Sign In
            </Link>
            <Link
              href="/auth"
              className="px-6 py-2.5 rounded-full text-sm font-semibold text-white"
              style={{ background: "#7c3aed" }}
            >
              Get Started
            </Link>
          </div>
        </nav>

        <main className="px-6 md:px-12 py-16">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-semibold tracking-[0.22em] uppercase mb-4" style={{ color: MUTED }}>
              Privacy
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1] mb-4">
              Privacy Policy
            </h1>
            <p className="text-sm mb-10" style={{ color: MUTED }}>
              Last updated: March 2025
            </p>

            <div className="space-y-10 text-[15px] leading-relaxed" style={{ color: "rgba(255,255,255,0.86)" }}>
              <section className="space-y-3">
                <h2 className="text-xl font-bold text-white">The short version</h2>
                <p style={{ color: MUTED }}>
                  Zyph (“we”, “us”) helps you build a personal AI profile by learning from your on-screen activity. We collect data only to provide and improve Zyph,
                  we don’t sell it, and you stay in control.
                </p>
                <p style={{ color: MUTED }}>
                  This policy applies to Zyph and our website at{" "}
                  <a href="https://usezyph.com" className="underline text-white">
                    usezyph.com
                  </a>
                  .
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-white">What we collect</h2>
                <p style={{ color: MUTED }}>
                  Zyph may collect screen capture data and related metadata (like timestamps and app/window names) to build your personal AI profile and generate
                  summaries/insights for you.
                </p>
                <p style={{ color: MUTED }}>
                  We also collect typical account and usage data, such as your email address, authentication information, and basic product analytics needed to run the
                  service reliably.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-white">How we use your data</h2>
                <ul className="space-y-2 pl-5 list-disc" style={{ color: MUTED }}>
                  <li>Provide Zyph’s core features (learning, insights, and chat with your profile).</li>
                  <li>Maintain and improve reliability, security, and performance.</li>
                  <li>Support billing, customer support, and account management.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-white">Where your data is stored</h2>
                <p style={{ color: MUTED }}>
                  We store your data securely using Supabase. We take reasonable steps to protect data at rest and in transit, and we restrict access to authorized
                  personnel and systems.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-white">Sharing and selling</h2>
                <p style={{ color: MUTED }}>
                  We never sell your personal data to third parties. We only share data with service providers when needed to operate Zyph (for example, infrastructure
                  providers), and only for the purpose of delivering the service.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-white">Payments</h2>
                <p style={{ color: MUTED }}>
                  Payments are processed by Stripe. We do not store your full card details on our servers. Stripe may collect and process payment information according
                  to their policies.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-white">Your choices and control</h2>
                <p style={{ color: MUTED }}>
                  You can delete your account and all associated data at any time. If you need help, contact us and we’ll assist.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-white">Contact</h2>
                <p style={{ color: MUTED }}>
                  Questions or requests? Email{" "}
                  <a href="mailto:support@usezyph.com" className="underline text-white">
                    support@usezyph.com
                  </a>
                  .
                </p>
              </section>
            </div>
          </div>
        </main>

        {/* Footer (homepage style, dark variant) */}
        <footer
          className="flex flex-wrap items-center justify-between px-6 md:px-12 h-24 border-t"
          style={{ borderColor: BORDER, background: BG }}
        >
          <div className="flex items-center gap-4">
            <Link href="/" className="text-lg font-bold text-white">
              Zyph
            </Link>
            <span className="text-sm" style={{ color: MUTED }}>
              © 2025 Zyph. All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/auth" className="text-sm hover:text-white transition-colors" style={{ color: MUTED }}>
              Sign In
            </Link>
            <Link href="/privacy" className="text-sm hover:text-white transition-colors" style={{ color: MUTED }}>
              Privacy
            </Link>
            <Link href="#" className="text-sm hover:text-white transition-colors" style={{ color: MUTED }}>
              Terms
            </Link>
          </div>
        </footer>
      </div>
    </>
  );
}

