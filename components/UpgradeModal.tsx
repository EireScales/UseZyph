"use client";

import Link from "next/link";
import { useEffect } from "react";

const VIOLET = "#7c3aed";

type UpgradeModalProps = {
  open: boolean;
  onDismiss: () => void;
};

export function UpgradeModal({ open, onDismiss }: UpgradeModalProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onDismiss]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-modal-title"
      aria-describedby="upgrade-modal-desc"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        aria-label="Close dialog"
        onClick={onDismiss}
      />

      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border shadow-2xl"
        style={{ animation: "dashboardFadeIn 0.25s ease forwards" }}
        style={{
          borderColor: "rgba(124, 58, 237, 0.35)",
          background:
            "linear-gradient(165deg, #14101c 0%, #0a0a0a 45%, #0d0a12 100%)",
          boxShadow: `0 0 0 1px rgba(124,58,237,0.12), 0 24px 80px -20px rgba(124,58,237,0.45)`,
        }}
      >
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full opacity-40 blur-3xl"
          style={{ background: VIOLET }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full opacity-25 blur-3xl"
          style={{ background: "#5b21b6" }}
          aria-hidden
        />

        <div className="relative p-6 md:p-8">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span
              className="inline-flex items-center rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
              style={{
                background: `linear-gradient(90deg, ${VIOLET}, #a78bfa)`,
              }}
            >
              Limit reached
            </span>
            <button
              type="button"
              onClick={onDismiss}
              className="rounded-lg p-1.5 text-[#666] transition-colors hover:bg-white/5 hover:text-[#aaa]"
              aria-label="Dismiss"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <h2
            id="upgrade-modal-title"
            className="text-xl font-bold leading-tight text-white md:text-2xl"
          >
            You&apos;ve used all 80 free captures today
          </h2>
          <p
            id="upgrade-modal-desc"
            className="mt-3 text-sm leading-relaxed text-[#9ca3af]"
          >
            Pro unlocks unlimited screen learning, priority AI analysis, and your
            full history — so Zyph never stops knowing you.
          </p>

          <ul className="mt-5 space-y-2.5 text-sm text-[#d1d5db]">
            {[
              "Up to 150 captures/day on Pro, unlimited on Mirror",
              "Priority AI analysis",
              "Full activity history",
              "Early access to new features",
            ].map((line) => (
              <li key={line} className="flex items-center gap-2.5">
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-emerald-400/90"
                  style={{ background: "rgba(34, 197, 94, 0.12)" }}
                  aria-hidden
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {line}
              </li>
            ))}
          </ul>

          <div
            className="mt-6 rounded-xl border px-4 py-3 text-center"
            style={{
              borderColor: "rgba(124, 58, 237, 0.25)",
              background: "rgba(124, 58, 237, 0.08)",
            }}
          >
            <p className="text-xs font-medium text-[#c4b5fd]">
              Pro <span className="text-white">$9.99/mo</span> · Mirror{" "}
              <span className="text-white">$24.99/mo</span>
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/pricing"
              className="inline-flex flex-1 items-center justify-center rounded-xl py-3.5 text-sm font-bold text-white transition-all hover:brightness-110 active:scale-[0.99]"
              style={{
                background: `linear-gradient(90deg, ${VIOLET} 0%, #6d28d9 50%, #5b21b6 100%)`,
                boxShadow: `0 8px 28px -6px ${VIOLET}aa`,
              }}
              onClick={onDismiss}
            >
              Start Free Trial
            </Link>
            <button
              type="button"
              onClick={onDismiss}
              className="py-3 text-sm font-medium text-[#888] transition-colors hover:text-[#ccc]"
            >
              Maybe later
            </button>
          </div>

          <p className="mt-4 text-center text-[11px] text-[#555]">
            14-day trial · Cancel anytime · No surprise charges
          </p>
        </div>
      </div>
    </div>
  );
}
