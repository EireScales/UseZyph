"use client";

import Link from "next/link";

const BORDER = "#1f2937";
const MUTED = "rgba(255,255,255,0.68)";
const BG = "#0a0a0a";

export default function TermsPage() {
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
        {/* Navbar (matches /privacy) */}
        <nav
          className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 h-16 border-b"
          style={{ borderColor: BORDER, background: BG }}
        >
          <Link href="/" className="text-xl font-bold text-white">
            Zyph
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/auth"
              className="hidden md:inline text-sm font-medium hover:text-white transition-colors"
              style={{ color: MUTED }}
            >
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
              Terms
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1] mb-4">
              Terms of Service
            </h1>
            <p className="text-sm mb-10" style={{ color: MUTED }}>
              Last updated: March 2025
            </p>

            <div className="space-y-10 text-[15px] leading-relaxed" style={{ color: "rgba(255,255,255,0.86)" }}>
              <section className="space-y-3">
                <h2 className="text-xl font-bold text-white">Welcome to Zyph</h2>
                <p style={{ color: MUTED }}>
                  These Terms of Service (“Terms”) apply to Zyph and our website at{" "}
                  <a href="https://usezyph.com" className="underline text-white">
                    usezyph.com
                  </a>
                  . By using Zyph, you agree to these Terms.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-white">Eligibility (18+)</h2>
                <p style={{ color: MUTED }}>
                  You must be at least 18 years old to use Zyph. By creating an account or using the app, you confirm that you meet this requirement.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-white">Your account</h2>
                <ul className="space-y-2 pl-5 list-disc" style={{ color: MUTED }}>
                  <li>You’re responsible for your account and anything that happens under it.</li>
                  <li>Keep your login details secure and let us know if you believe your account has been compromised.</li>
                  <li>Provide accurate information and keep it up to date.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-white">Screen capture consent</h2>
                <p style={{ color: MUTED }}>
                  Zyph captures your screen to provide its service (for example, learning your work patterns and building your personal AI profile). By using Zyph, you
                  consent to this collection and processing. You should only use Zyph on devices and accounts where you have permission to capture what’s on screen.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-white">Acceptable use and enforcement</h2>
                <p style={{ color: MUTED }}>
                  Please use Zyph responsibly and legally. If we believe an account is violating these Terms (or misusing the service), we may suspend or terminate
                  access to protect Zyph, other users, and our systems.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-white">Billing and subscriptions</h2>
                <p style={{ color: MUTED }}>
                  Subscription billing is handled by Stripe. Zyph may offer a 14-day free trial on eligible plans. You can cancel anytime, and changes typically take
                  effect at the end of your current billing period or trial (depending on plan terms shown at checkout).
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-white">Service availability and data loss</h2>
                <p style={{ color: MUTED }}>
                  We work hard to keep Zyph reliable, but no service is perfect. Zyph is provided on an “as is” basis, and we are not liable for data loss (including
                  lost captures, insights, or history) or interruptions. We recommend keeping your own backups of anything critical.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-white">Updates to these Terms</h2>
                <p style={{ color: MUTED }}>
                  We may update these Terms from time to time. If we make a material change, we’ll provide notice (for example, in-app or by email). Continued use of
                  Zyph after the effective date means you accept the updated Terms.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-white">Contact</h2>
                <p style={{ color: MUTED }}>
                  Questions about these Terms? Email{" "}
                  <a href="mailto:support@usezyph.com" className="underline text-white">
                    support@usezyph.com
                  </a>
                  .
                </p>
              </section>
            </div>
          </div>
        </main>

        {/* Footer (matches /privacy) */}
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
            <Link href="/terms" className="text-sm hover:text-white transition-colors" style={{ color: MUTED }}>
              Terms
            </Link>
          </div>
        </footer>
      </div>
    </>
  );
}

