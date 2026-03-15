"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const STEPS = 3;
const USE_OPTIONS = ["Work", "Creative", "Learning", "Communication"];

const glassCard = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  backdropFilter: "blur(24px)",
};

const glassInput = {
  background: "rgba(0,0,0,0.3)",
  border: "1px solid rgba(255,255,255,0.1)",
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [primaryUses, setPrimaryUses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleUse = (option: string) => {
    setPrimaryUses((prev) =>
      prev.includes(option) ? prev.filter((u) => u !== option) : [...prev, option]
    );
  };

  const handleComplete = async () => {
    setError(null);
    setLoading(true);
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        router.push("/auth");
        return;
      }

      const { error: upsertError } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          name: name.trim() || null,
          primary_uses: primaryUses,
        },
        { onConflict: "id" }
      );

      if (upsertError) throw upsertError;
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  const canNextStep1 = name.trim().length > 0;
  const canNextStep2 = primaryUses.length > 0;

  return (
    <div
      className="min-h-screen bg-[#000000] flex flex-col items-center justify-center px-4 py-12"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
        `,
        backgroundSize: "80px 80px",
      }}
    >
      {/* Progress bar */}
      <div className="w-full max-w-md mb-8">
        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={glassInput}
        >
          <div
            className="h-full rounded-full transition-all duration-300 ease-out"
            style={{
              width: `${(step / STEPS) * 100}%`,
              background: "linear-gradient(90deg, #7c3aed 0%, #e8837a 100%)",
            }}
          />
        </div>
        <p className="text-white/40 text-sm mt-2 text-center">
          Step {step} of {STEPS}
        </p>
      </div>

      <div
        className="w-full max-w-md rounded-2xl p-8 shadow-2xl"
        style={glassCard}
      >
        <Link href="/" className="inline-block mb-6">
          <h1 className="text-2xl font-bold text-white">Zyph</h1>
        </Link>

        {step === 1 && (
          <>
            <h2 className="text-xl font-semibold text-white mb-2">
              What&apos;s your name?
            </h2>
            <p className="text-white/50 text-sm mb-6">
              We&apos;ll use this to personalize your experience.
            </p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoFocus
              className="w-full px-4 py-3 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/50 transition-all"
              style={glassInput}
            />
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!canNextStep1}
                className="px-6 py-3 rounded-xl font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:opacity-95"
                style={{
                  background:
                    "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
                  boxShadow: "0 4px 20px rgba(124,58,237,0.35)",
                }}
              >
                Next
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-xl font-semibold text-white mb-2">
              What do you use your computer for?
            </h2>
            <p className="text-white/50 text-sm mb-6">
              Select all that apply.
            </p>
            <div className="flex flex-wrap gap-3">
              {USE_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggleUse(option)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all border ${
                    primaryUses.includes(option)
                      ? "bg-[#7c3aed]/20 text-white border-[#7c3aed]/50"
                      : "text-white/70 border-white/10 hover:border-white/20"
                  }`}
                  style={
                    primaryUses.includes(option)
                      ? {
                          boxShadow: "0 0 20px rgba(124,58,237,0.2)",
                        }
                      : glassInput
                  }
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-xl text-white/70 hover:text-white border border-white/10 hover:border-white/20 transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={!canNextStep2}
                className="px-6 py-3 rounded-xl font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:opacity-95"
                style={{
                  background:
                    "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
                  boxShadow: "0 4px 20px rgba(124,58,237,0.35)",
                }}
              >
                Next
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="text-xl font-semibold text-white mb-2">
              Download Zyph to start learning
            </h2>
            <p className="text-white/50 text-sm mb-6">
              Install the desktop app so Zyph can learn from how you work.
            </p>

            <a
              href="#"
              className="block w-full py-3.5 rounded-xl font-semibold text-white text-center transition-all hover:opacity-95 mb-4"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              Download Desktop App
            </a>

            {error && (
              <p
                className="text-sm text-[#e8837a] bg-[#e8837a]/10 border border-[#e8837a]/20 rounded-lg px-4 py-3 mb-4"
                role="alert"
              >
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={handleComplete}
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:opacity-95"
              style={{
                background:
                  "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
                boxShadow: "0 4px 20px rgba(124,58,237,0.35)",
              }}
            >
              {loading ? "Saving…" : "Continue to Dashboard"}
            </button>

            <div className="mt-6 flex justify-start">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-sm text-white/50 hover:text-white/70 transition-colors"
              >
                ← Back
              </button>
            </div>
          </>
        )}
      </div>

      <p className="mt-6 text-center text-white/40 text-sm">
        <Link href="/" className="hover:text-white/60 transition-colors">
          Skip for now
        </Link>
      </p>
    </div>
  );
}
