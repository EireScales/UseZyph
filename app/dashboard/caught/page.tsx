"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase";

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
      <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", background: "#08090a", marginTop: "80px" }}>
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: "#6366f1", borderTopColor: "transparent" }}
          aria-label="Loading"
        />
      </div>
    );
  }

  const enoughData = observations.length >= 20;

  return (
    <div style={{ padding: "32px 40px", animation: "dashboardFadeIn 0.3s ease forwards" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital,wght@0,400;1,400&family=Inter:wght@400;500;600;700&display=swap');
        .back-link:hover { color: #8a8f98 !important; }
        .regen-btn:hover { background: rgba(255,255,255,0.04) !important; color: #F2F2F2 !important; }
        .gen-btn:hover { opacity: 0.88; }
      `}</style>

      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        {/* Back link */}
        <Link
          href="/dashboard"
          className="back-link"
          style={{ fontSize: "13px", color: "#3f3f46", display: "inline-flex", alignItems: "center", gap: "6px", textDecoration: "none", marginBottom: "24px", fontFamily: "Inter, sans-serif", transition: "color 0.15s" }}
        >
          ← Dashboard
        </Link>

        {/* Heading */}
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: "36px", color: "#F2F2F2", letterSpacing: "-0.02em", marginBottom: "8px" }}>
          Caught in 4K
        </h1>
        <p style={{ fontSize: "15px", color: "#525252", marginBottom: "32px", fontFamily: "Inter, sans-serif" }}>
          Your screen history, roasted.
        </p>

        {!enoughData ? (
          /* Not enough data */
          <div
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "12px",
              padding: "48px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                background: "rgba(99,102,241,0.08)",
                border: "1px solid rgba(99,102,241,0.15)",
                borderRadius: "10px",
                margin: "0 auto 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
            <p style={{ fontSize: "15px", color: "#525252", fontFamily: "Inter, sans-serif" }}>
              Not enough data yet. Keep using Zyph for a few days.
            </p>
            <p style={{ fontSize: "13px", color: "#3f3f46", marginTop: "6px", fontFamily: "Inter, sans-serif" }}>
              Need at least 20 observations in the last 7 days — you have {observations.length}.
            </p>
          </div>

        ) : generating ? (
          /* Generating spinner */
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: "80px", gap: "16px" }}>
            <div
              className="h-10 w-10 animate-spin rounded-full border-2 border-t-transparent"
              style={{ borderColor: "#6366f1", borderTopColor: "transparent" }}
              aria-label="Generating"
            />
            <p style={{ fontSize: "14px", color: "#525252", fontFamily: "Inter, sans-serif" }}>Cooking your roast…</p>
          </div>

        ) : caughtItems === null ? (
          /* Ready to generate */
          <div
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "12px",
              padding: "40px",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: "14px", color: "#8a8f98", marginBottom: "24px", fontFamily: "Inter, sans-serif" }}>
              You have {observations.length} captures from the last 7 days. Ready?
            </p>
            <button
              type="button"
              onClick={generateCaught}
              className="gen-btn"
              style={{
                padding: "12px 32px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#fff",
                background: "#6366f1",
                border: "none",
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
                transition: "opacity 0.15s",
              }}
            >
              Generate roast
            </button>
          </div>

        ) : (
          /* Results */
          <>
            {error && (
              <p style={{ fontSize: "13px", color: "#f87171", marginBottom: "16px", fontFamily: "Inter, sans-serif" }} role="alert">
                {error}
              </p>
            )}

            <div style={{ marginBottom: "24px" }}>
              {caughtItems.length === 0 && !error ? (
                <p style={{ fontSize: "14px", color: "#525252", fontFamily: "Inter, sans-serif" }}>No moments returned. Try again.</p>
              ) : (
                caughtItems.map((item, i) => (
                  <article
                    key={`${item.headline}-${i}`}
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      borderLeft: "2px solid #e8837a",
                      borderRadius: "10px",
                      padding: "20px 24px",
                      marginBottom: "12px",
                    }}
                  >
                    <p style={{ fontSize: "10px", fontWeight: 600, color: "#e8837a", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px", fontFamily: "Inter, sans-serif" }}>
                      📸 Caught in 4K
                    </p>
                    <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#F2F2F2", marginBottom: "8px", letterSpacing: "-0.01em", fontFamily: "Inter, sans-serif" }}>
                      {item.headline || "Caught in 4K 📸"}
                    </h2>
                    <p style={{ fontSize: "14px", color: "#8a8f98", lineHeight: 1.7, marginBottom: item.app ? "12px" : 0, fontFamily: "Inter, sans-serif" }}>
                      {item.detail}
                    </p>
                    {item.app && (
                      <span
                        style={{
                          display: "inline-block",
                          fontSize: "11px",
                          fontWeight: 500,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          padding: "3px 10px",
                          borderRadius: "5px",
                          background: "rgba(99,102,241,0.1)",
                          color: "#818cf8",
                          border: "1px solid rgba(99,102,241,0.2)",
                          fontFamily: "Inter, sans-serif",
                        }}
                      >
                        {item.app}
                      </span>
                    )}
                  </article>
                ))
              )}
            </div>

            <button
              type="button"
              onClick={generateCaught}
              disabled={generating}
              className="regen-btn"
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#8a8f98",
                borderRadius: "8px",
                padding: "10px 20px",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                display: "block",
                fontFamily: "Inter, sans-serif",
                transition: "background 0.15s, color 0.15s",
                opacity: generating ? 0.5 : 1,
              }}
            >
              Catch me again →
            </button>
          </>
        )}
      </div>
    </div>
  );
}
