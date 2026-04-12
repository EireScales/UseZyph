"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase";

const BG = "#0a0a0a";
const CARD = "#111111";
const BORDER = "#1e1e1e";
const VIOLET = "#7c3aed";
const ROSE = "#e8837a";

type ObservationRow = {
  captured_at: string;
  app_name?: string | null;
  summary?: string | null;
  category?: string | null;
};

type CaughtItem = {
  headline: string;
  detail: string;
  app: string;
};

export default function CaughtPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [authChecked, setAuthChecked] = useState(false);
  const [loadingObs, setLoadingObs] = useState(true);
  const [observations, setObservations] = useState<ObservationRow[]>([]);
  const [caughtItems, setCaughtItems] = useState<CaughtItem[] | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
        error: sessionError,
      } = await supabase.auth.getUser();
      if (sessionError || !user) {
        router.replace("/auth");
        return;
      }

      const since = new Date();
      since.setDate(since.getDate() - 7);

      const { data, error: fetchError } = await supabase
        .from("observations")
        .select("captured_at, app_name, summary, category")
        .eq("user_id", user.id)
        .gte("captured_at", since.toISOString())
        .order("captured_at", { ascending: false })
        .limit(200);

      if (fetchError) {
        console.error("Observations fetch:", fetchError.message);
      }
      setObservations((data as ObservationRow[]) ?? []);
      setAuthChecked(true);
      setLoadingObs(false);
    };
    load();
  }, [router, supabase]);

  const generateCaught = useCallback(async () => {
    if (observations.length < 20) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/caught", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ observations }),
      });
      const data = (await res.json()) as {
        caught?: CaughtItem[];
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        setCaughtItems([]);
        return;
      }
      const list = Array.isArray(data.caught) ? data.caught : [];
      const normalized = list
        .slice(0, 5)
        .map((c) => ({
          headline: String(c.headline ?? "Caught in 4K 📸"),
          detail: String(c.detail ?? ""),
          app: String(c.app ?? ""),
        }));
      setCaughtItems(normalized);
    } catch {
      setError("Network error");
      setCaughtItems([]);
    } finally {
      setGenerating(false);
    }
  }, [observations]);

  if (!authChecked || loadingObs) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: BG }}
      >
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-[#7c3aed] border-t-transparent"
          aria-label="Loading"
        />
      </div>
    );
  }

  const enoughData = observations.length >= 20;

  return (
    <div
      className="p-6 md:p-8 pb-24"
      style={{ animation: "dashboardFadeIn 0.3s ease forwards", backgroundColor: BG }}
    >
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-sm text-[#666] hover:text-[#a78bfa] transition-colors"
          >
            ← Dashboard
          </Link>
        </div>

        <h1
          className="text-[28px] md:text-[32px] font-semibold text-[#f0f0f0] mb-2"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          Caught in 4K
        </h1>
        <p className="text-[#737373] text-sm mb-8 max-w-xl">
          Your screen history, roasted. Brutally honest, slightly unhinged.
        </p>

        {!enoughData ? (
          <div
            className="rounded-2xl border px-6 py-12 text-center"
            style={{ background: CARD, borderColor: BORDER }}
          >
            <p className="text-[#a3a3a3] text-sm leading-relaxed">
              Not enough data yet. Keep using Zyph for a few days.
            </p>
            <p className="text-[#555] text-xs mt-3">
              Need at least 20 observations in the last 7 days — you have{" "}
              {observations.length}.
            </p>
          </div>
        ) : generating ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div
              className="h-12 w-12 animate-spin rounded-full border-2 border-[#7c3aed] border-t-transparent"
              aria-label="Generating"
            />
            <p className="text-sm text-[#737373]">Cooking your roast…</p>
          </div>
        ) : caughtItems === null ? (
          <div
            className="rounded-2xl border p-8 text-center"
            style={{ background: CARD, borderColor: BORDER }}
          >
            <p className="text-[#c4b5fd] text-sm mb-6">
              You have {observations.length} captures from the last 7 days. Ready?
            </p>
            <button
              type="button"
              onClick={generateCaught}
              className="px-8 py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{
                background: VIOLET,
                boxShadow: "0 8px 24px -8px rgba(124,58,237,0.5)",
              }}
            >
              Generate roast
            </button>
          </div>
        ) : (
          <>
            {error && (
              <p className="text-sm text-red-400 mb-4" role="alert">
                {error}
              </p>
            )}
            <div className="space-y-4 mb-10">
              {caughtItems.length === 0 && !error ? (
                <p className="text-[#737373] text-sm">No moments returned. Try again.</p>
              ) : (
                caughtItems.map((item, i) => (
                  <article
                    key={`${item.headline}-${i}`}
                    className="rounded-2xl border p-5 pl-6"
                    style={{
                      background: CARD,
                      borderColor: BORDER,
                      borderLeftWidth: "4px",
                      borderLeftColor: ROSE,
                    }}
                  >
                    <h2 className="text-base font-bold text-white mb-2">
                      {item.headline || "Caught in 4K 📸"}
                    </h2>
                    <p className="text-[#9ca3af] text-sm leading-relaxed mb-4">
                      {item.detail}
                    </p>
                    {item.app ? (
                      <span
                        className="inline-block text-[11px] font-medium uppercase tracking-wide px-2.5 py-1 rounded-md"
                        style={{
                          background: "rgba(232,131,122,0.12)",
                          color: ROSE,
                          border: "1px solid rgba(232,131,122,0.25)",
                        }}
                      >
                        {item.app}
                      </span>
                    ) : null}
                  </article>
                ))
              )}
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={generateCaught}
                disabled={generating}
                className="text-sm font-semibold transition-colors hover:underline disabled:opacity-50"
                style={{ color: VIOLET }}
              >
                Catch me again →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
