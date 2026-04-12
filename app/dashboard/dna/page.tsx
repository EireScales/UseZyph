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
  const [groupedInsights, setGroupedInsights] = useState<
    Record<string, InsightRow[]>
  >({});
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
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ animation: "dashboardFadeIn 0.3s ease forwards" }}
      >
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-[#7c3aed] border-t-transparent"
          aria-label="Loading"
        />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ animation: "dashboardFadeIn 0.3s ease forwards" }}
    >
      <div className="max-w-2xl mx-auto p-6 md:p-8">
        <h1 className="text-[28px] font-semibold text-[#f0f0f0] mb-2">
          Zyph DNA
        </h1>
        <p className="text-[#555] text-sm mb-8">
          Your work identity, distilled from everything Zyph has observed.
        </p>

        {error && (
          <div
            className="rounded-xl p-4 mb-6 text-sm text-[#fca5a5]"
            style={{ background: "#1a0a0a", border: "1px solid #3f1a1a" }}
          >
            {error}
          </div>
        )}

        {/* Main DNA card */}
        <div
          className="rounded-2xl p-8 mb-6 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #1a0a2e 0%, #0f0a0a 100%)",
            border: "1px solid #2a1a4a",
          }}
        >
          <p className="text-xs font-semibold tracking-widest text-[#7c3aed] uppercase mb-3">
            Your Archetype
          </p>
          <h2 className="text-4xl font-extrabold text-white mb-3">
            {archetype || "—"}
          </h2>
          <p className="text-[#a78bfa] text-lg leading-relaxed mb-8">
            {summary || "—"}
          </p>

          {/* Stat pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Top App", value: topApp },
              {
                label: "Peak Hour",
                value: `${String(peakHour).padStart(2, "0")}:00`,
              },
              { label: "Focus Mode", value: dominantCategory },
              { label: "Days Active", value: String(daysActive) },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl p-3 text-center"
                style={{
                  background: "rgba(124,58,237,0.1)",
                  border: "1px solid rgba(124,58,237,0.2)",
                }}
              >
                <p className="text-[#666] text-xs uppercase tracking-wider mb-1">
                  {stat.label}
                </p>
                <p className="text-white font-semibold text-sm truncate">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Traits */}
        {traits.length > 0 && (
          <div
            className="rounded-xl p-5 mb-6"
            style={{ background: "#111111", border: "1px solid #1e1e1e" }}
          >
            <p className="text-[#555] text-xs uppercase tracking-wider mb-3">
              Core Traits
            </p>
            <div className="flex flex-wrap gap-2">
              {traits.map((trait, idx) => (
                <span
                  key={`${trait}-${idx}`}
                  className="px-3 py-1.5 rounded-full text-sm text-[#a78bfa]"
                  style={{ background: "#1a1a2e" }}
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
            className="rounded-xl p-5 mb-4"
            style={{ background: "#111111", border: "1px solid #1e1e1e" }}
          >
            <p className="text-[#555] text-xs uppercase tracking-wider mb-3">
              {type}
            </p>
            <div className="flex flex-wrap gap-2">
              {items.slice(0, 4).map((i, idx) => (
                <span
                  key={`${type}-${idx}`}
                  className="px-3 py-1 rounded-full text-xs text-[#a78bfa]"
                  style={{ background: "#1a1a2e" }}
                >
                  {i.insight_value?.slice(0, 60)}
                </span>
              ))}
            </div>
          </div>
        ))}

        {/* Share + Regenerate buttons */}
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={() =>
              window.open(
                `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  `My Zyph DNA: I'm ${archetype}. usezyph.com #ZyphDNA`
                )}`
              )
            }
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white"
            style={{ background: "#1da1f2" }}
          >
            Share on X →
          </button>
          <button
            type="button"
            onClick={generateDNA}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white"
            style={{ background: "#7c3aed" }}
          >
            Regenerate
          </button>
        </div>
      </div>
    </div>
  );
}
