"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";

type InsightRow = {
  insight_type?: string | null;
  insight_value?: string | null;
};

type ObservationRow = {
  app_name?: string | null;
  captured_at: string;
  category?: string | null;
};

type DnaPayload = {
  archetype?: string;
  summary?: string;
  traits?: string[];
};

function computeStats(observations: ObservationRow[]) {
  let topApp = "—";
  let peakHour = 12;
  let dominantCategory = "Unknown";
  let daysActive = 0;

  if (observations.length === 0) {
    return { topApp, peakHour, dominantCategory, daysActive };
  }

  const appCounts: Record<string, number> = {};
  const hourCounts: Record<number, number> = {};
  const catCounts: Record<string, number> = {};
  const dates = new Set<string>();

  for (const o of observations) {
    const app = o.app_name?.trim() || "Unknown";
    appCounts[app] = (appCounts[app] || 0) + 1;

    const d = new Date(o.captured_at);
    if (!Number.isNaN(d.getTime())) {
      const h = d.getHours();
      hourCounts[h] = (hourCounts[h] || 0) + 1;
      dates.add(d.toISOString().slice(0, 10));
    }

    const cat = o.category?.trim() || "Uncategorized";
    catCounts[cat] = (catCounts[cat] || 0) + 1;
  }

  daysActive = dates.size;

  const topAppEntry = Object.entries(appCounts).sort((a, b) => b[1] - a[1])[0];
  if (topAppEntry) topApp = topAppEntry[0];

  const peakEntry = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
  if (peakEntry) peakHour = Number(peakEntry[0]);

  const topCat = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0];
  if (topCat) dominantCategory = topCat[0];

  return { topApp, peakHour, dominantCategory, daysActive };
}

function groupInsights(insights: InsightRow[]) {
  const grouped: Record<string, InsightRow[]> = {};
  for (const i of insights) {
    const type = (i.insight_type || "General").trim() || "General";
    if (!grouped[type]) grouped[type] = [];
    grouped[type].push(i);
  }
  return grouped;
}

export default function DnaPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [archetype, setArchetype] = useState("");
  const [summary, setSummary] = useState("");
  const [traits, setTraits] = useState<string[]>([]);
  const [topApp, setTopApp] = useState("—");
  const [peakHour, setPeakHour] = useState(12);
  const [dominantCategory, setDominantCategory] = useState("Unknown");
  const [daysActive, setDaysActive] = useState(0);
  const [groupedInsights, setGroupedInsights] = useState<Record<string, InsightRow[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAndGenerate = useCallback(async () => {
    const {
      data: { user },
      error: sessionError,
    } = await supabase.auth.getUser();
    if (sessionError || !user) {
      router.replace("/auth");
      return null;
    }

    const [insightsRes, obsRes] = await Promise.all([
      supabase
        .from("user_profile_insights")
        .select("insight_type, insight_value")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false }),
      supabase
        .from("observations")
        .select("app_name, captured_at, category")
        .eq("user_id", user.id)
        .order("captured_at", { ascending: false })
        .limit(300),
    ]);

    const insights = (insightsRes.data as InsightRow[]) ?? [];
    const observations = (obsRes.data as ObservationRow[]) ?? [];

    const stats = computeStats(observations);
    setTopApp(stats.topApp);
    setPeakHour(stats.peakHour);
    setDominantCategory(stats.dominantCategory);
    setDaysActive(stats.daysActive);
    setGroupedInsights(groupInsights(insights));

    const res = await fetch("/api/dna", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        insights,
        topApp: stats.topApp,
        peakHour: stats.peakHour,
        dominantCategory: stats.dominantCategory,
        daysActive: stats.daysActive,
      }),
    });

    const json = (await res.json()) as { dna?: DnaPayload; error?: string };
    if (!res.ok) {
      setError(json.error ?? "Failed to generate DNA");
      setArchetype("");
      setSummary("");
      setTraits([]);
      return null;
    }

    const d = json.dna;
    setError(null);
    setArchetype(String(d?.archetype ?? ""));
    setSummary(String(d?.summary ?? ""));
    setTraits(Array.isArray(d?.traits) ? d.traits.map(String) : []);
    return true;
  }, [router, supabase]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        await loadAndGenerate();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadAndGenerate]);

  const generateDNA = async () => {
    setLoading(true);
    setError(null);
    try {
      await loadAndGenerate();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginTop: "80px", animation: "dashboardFadeIn 0.3s ease forwards" }}>
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: "#6366f1", borderTopColor: "transparent" }}
          aria-label="Loading"
        />
        <p style={{ fontSize: "14px", color: "#525252", marginTop: "16px", fontFamily: "Inter, sans-serif" }}>
          Analysing your patterns...
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: "32px 40px", animation: "dashboardFadeIn 0.3s ease forwards" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital,wght@0,400;1,400&family=Inter:wght@400;500;600;700&display=swap');
        .regen-btn:hover { opacity: 0.88; }
        .share-btn:hover { opacity: 0.88; }
      `}</style>

      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        {/* Heading */}
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: "28px", color: "#F2F2F2", letterSpacing: "-0.02em", marginBottom: "4px" }}>
          Zyph DNA
        </h1>
        <p style={{ fontSize: "14px", color: "#525252", marginBottom: "32px", fontFamily: "Inter, sans-serif" }}>
          Your work identity, distilled from everything Zyph has observed.
        </p>

        {/* Error */}
        {error && (
          <div
            style={{
              borderRadius: "10px",
              padding: "14px 18px",
              marginBottom: "20px",
              fontSize: "13px",
              color: "#fca5a5",
              background: "rgba(239,68,68,0.06)",
              border: "1px solid rgba(239,68,68,0.15)",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {error}
          </div>
        )}

        {!archetype && !error ? (
          /* No insights state */
          <div
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "10px",
              padding: "48px",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: "15px", color: "#525252", fontFamily: "Inter, sans-serif" }}>
              Not enough data to generate your DNA yet. Keep using Zyph.
            </p>
          </div>
        ) : (
          <>
            {/* Main DNA card */}
            <div
              style={{
                background: "linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(99,102,241,0.04) 100%)",
                border: "1px solid rgba(99,102,241,0.2)",
                borderRadius: "14px",
                padding: "32px",
                marginBottom: "16px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Background glow */}
              <div
                style={{
                  position: "absolute",
                  top: "-40px",
                  right: "-40px",
                  width: "200px",
                  height: "200px",
                  background: "rgba(99,102,241,0.08)",
                  borderRadius: "50%",
                  filter: "blur(40px)",
                  pointerEvents: "none",
                }}
                aria-hidden
              />

              <p style={{ fontSize: "10px", fontWeight: 600, color: "#818cf8", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "12px", fontFamily: "Inter, sans-serif" }}>
                Your Archetype
              </p>
              <h2 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: "clamp(28px, 4vw, 44px)", color: "#F2F2F2", letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: "12px" }}>
                {archetype || "—"}
              </h2>
              <p style={{ fontSize: "16px", color: "#a5b4fc", lineHeight: 1.65, marginBottom: "28px", fontFamily: "Inter, sans-serif" }}>
                {summary || "—"}
              </p>

              {/* Stat pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-[10px]">
                {[
                  { label: "Top App", value: topApp },
                  { label: "Peak Hour", value: `${String(peakHour).padStart(2, "0")}:00` },
                  { label: "Focus Mode", value: dominantCategory },
                  { label: "Days Active", value: String(daysActive) },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    style={{
                      background: "rgba(99,102,241,0.08)",
                      border: "1px solid rgba(99,102,241,0.15)",
                      borderRadius: "8px",
                      padding: "12px 14px",
                      textAlign: "center",
                    }}
                  >
                    <p style={{ fontSize: "9px", color: "#818cf8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px", fontFamily: "Inter, sans-serif" }}>
                      {stat.label}
                    </p>
                    <p style={{ fontSize: "15px", fontWeight: 600, color: "#F2F2F2", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Traits */}
            {traits.length > 0 && (
              <div
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "10px",
                  padding: "20px",
                  marginBottom: "12px",
                }}
              >
                <p style={{ fontSize: "10px", fontWeight: 600, color: "#525252", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px", fontFamily: "Inter, sans-serif" }}>
                  Core Traits
                </p>
                <div style={{ display: "flex", flexWrap: "wrap" }}>
                  {traits.map((trait, idx) => (
                    <span
                      key={`${trait}-${idx}`}
                      style={{
                        background: "rgba(99,102,241,0.08)",
                        border: "1px solid rgba(99,102,241,0.15)",
                        color: "#818cf8",
                        borderRadius: "99px",
                        padding: "5px 14px",
                        fontSize: "13px",
                        display: "inline-flex",
                        marginRight: "8px",
                        marginBottom: "8px",
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Insights grouped by type */}
            {Object.entries(groupedInsights).map(([type, items]) => (
              <div
                key={type}
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "10px",
                  padding: "16px 20px",
                  marginBottom: "8px",
                }}
              >
                <p style={{ fontSize: "10px", fontWeight: 600, color: "#525252", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px", fontFamily: "Inter, sans-serif" }}>
                  {type}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap" }}>
                  {items.slice(0, 4).map((i, idx) => (
                    <span
                      key={`${type}-${idx}`}
                      style={{
                        background: "rgba(99,102,241,0.08)",
                        border: "1px solid rgba(99,102,241,0.15)",
                        color: "#818cf8",
                        borderRadius: "99px",
                        padding: "5px 14px",
                        fontSize: "12px",
                        display: "inline-flex",
                        marginRight: "8px",
                        marginBottom: "8px",
                        fontFamily: "Inter, sans-serif",
                        maxWidth: "280px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {i.insight_value?.slice(0, 60)}
                    </span>
                  ))}
                </div>
              </div>
            ))}

            {/* Action buttons */}
            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button
                type="button"
                onClick={() =>
                  window.open(
                    `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                      `My Zyph DNA: I'm ${archetype}. usezyph.com #ZyphDNA`
                    )}`
                  )
                }
                className="share-btn"
                style={{
                  flex: 1,
                  background: "#1d9bf0",
                  color: "#fff",
                  borderRadius: "8px",
                  padding: "11px 20px",
                  fontSize: "14px",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                  transition: "opacity 0.15s",
                }}
              >
                Share on X →
              </button>
              <button
                type="button"
                onClick={generateDNA}
                className="regen-btn"
                style={{
                  flex: 1,
                  background: "#6366f1",
                  color: "#fff",
                  borderRadius: "8px",
                  padding: "11px 20px",
                  fontSize: "14px",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                  transition: "opacity 0.15s",
                }}
              >
                Regenerate
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
