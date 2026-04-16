"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";

type InsightRow = {
  id: string;
  insight_type?: string | null;
  insight_value?: string | null;
  confidence_score?: number | null;
  updated_at?: string;
};

const CATEGORY_COLORS: Record<string, string> = {
  communication: "#6366f1",
  interests: "#f97316",
  "work style": "#f59e0b",
  General: "#22c55e",
};

export default function InsightsPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<InsightRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [categoriesCount, setCategoriesCount] = useState(0);
  const [avgConfidence, setAvgConfidence] = useState<number | null>(null);
  const [recentDate, setRecentDate] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
        error: sessionError,
      } = await supabase.auth.getUser();
      if (sessionError || !user) {
        router.replace("/auth");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_profile_insights")
          .select("id, insight_value, insight_type, confidence_score, updated_at")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false });

        if (error) throw error;
        const list = (data as InsightRow[]) || [];
        setInsights(list);

        const countRes = await supabase
          .from("user_profile_insights")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id);
        if (countRes.count != null) setTotalCount(countRes.count);

        const categories = new Set(
          list.map((i) => i.insight_type || "General")
        );
        setCategoriesCount(categories.size);

        const withConf = list.filter((i) => i.confidence_score != null);
        if (withConf.length) {
          const avg =
            withConf.reduce((s, i) => s + Number(i.confidence_score), 0) /
            withConf.length;
          setAvgConfidence(Math.round(avg * 100) / 100);
        }

        if (list.length) {
          const latest = list[0].updated_at;
          if (latest) setRecentDate(latest);
        }
      } catch {
        // table may not exist
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const categories = Array.from(
    new Set(insights.map((i) => i.insight_type || "General"))
  );
  const filteredInsights =
    selectedCategory === "All"
      ? insights
      : insights.filter(
          (i) => (i.insight_type || "General") === selectedCategory
        );

  const statCards = [
    { label: "Total insights", value: totalCount.toString(), accent: "#6366f1" },
    { label: "Categories", value: categoriesCount.toString(), accent: "#f97316" },
    {
      label: "Avg confidence",
      value: avgConfidence != null ? `${(avgConfidence * 100).toFixed(0)}%` : "—",
      accent: "#f59e0b",
    },
    {
      label: "Last updated",
      value: recentDate ? new Date(recentDate).toLocaleDateString() : "—",
      accent: "#22c55e",
    },
  ];

  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center" }}>
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: "#6366f1", borderTopColor: "transparent" }}
          aria-label="Loading"
        />
      </div>
    );
  }

  return (
    <div style={{ padding: "32px 40px", animation: "dashboardFadeIn 0.3s ease forwards" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital,wght@0,400;1,400&family=Inter:wght@400;500;600;700&display=swap');
      `}</style>

      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 600, color: "#F2F2F2", marginBottom: "24px", fontFamily: "Inter, sans-serif", letterSpacing: "-0.02em" }}>
          Your Insights
        </h1>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" style={{ marginBottom: "28px" }}>
          {statCards.map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderLeft: `3px solid ${stat.accent}`,
                borderRadius: "10px",
                padding: "18px",
              }}
            >
              <p style={{ fontSize: "11px", color: "#525252", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px", fontFamily: "Inter, sans-serif" }}>
                {stat.label}
              </p>
              <p style={{ fontSize: "18px", fontWeight: 600, color: "#F2F2F2", fontVariantNumeric: "tabular-nums", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {insights.length === 0 ? (
          <div
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "10px",
              padding: "64px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <div style={{ position: "relative", width: "80px", height: "80px", marginBottom: "24px" }}>
              <span
                className="absolute inset-0 rounded-full animate-pulse"
                style={{ background: "rgba(99,102,241,0.12)", animationDuration: "2s" }}
              />
              <span
                className="absolute inset-2 rounded-full animate-pulse"
                style={{ background: "rgba(99,102,241,0.18)", animationDuration: "2s", animationDelay: "0.2s" }}
              />
              <span
                className="absolute inset-4 rounded-full animate-pulse"
                style={{ background: "rgba(99,102,241,0.24)", animationDuration: "2s", animationDelay: "0.4s" }}
              />
            </div>
            <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#F2F2F2", marginBottom: "8px", fontFamily: "Inter, sans-serif" }}>
              Zyph is still learning
            </h2>
            <p style={{ color: "#8a8f98", fontSize: "13px", maxWidth: "320px", marginBottom: "10px", lineHeight: 1.6, fontFamily: "Inter, sans-serif" }}>
              Keep working as normal. Insights appear here after 2–4 weeks.
            </p>
            <p style={{ color: "#525252", fontSize: "13px", maxWidth: "320px", lineHeight: 1.6, fontFamily: "Inter, sans-serif" }}>
              Insights appear here as Zyph learns from your activity.
            </p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            <aside style={{ width: "176px", flexShrink: 0 }}>
              <p style={{ fontSize: "11px", color: "#525252", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px", fontFamily: "Inter, sans-serif" }}>
                Category
              </p>
              <div className="flex flex-wrap gap-2 lg:flex-col">
                {["All", ...categories].map((cat) => {
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "100px",
                        fontSize: "13px",
                        fontWeight: 500,
                        cursor: "pointer",
                        border: isActive ? "none" : "1px solid rgba(255,255,255,0.07)",
                        background: isActive ? "#6366f1" : "rgba(255,255,255,0.02)",
                        color: isActive ? "#fff" : "#8a8f98",
                        fontFamily: "Inter, sans-serif",
                        transition: "all 0.15s",
                      }}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </aside>

            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
              {filteredInsights.map((insight) => {
                const cat = insight.insight_type || "General";
                const color = CATEGORY_COLORS[cat] || "#6366f1";
                const conf = insight.confidence_score != null ? Number(insight.confidence_score) : 0;
                const pct = Math.min(100, Math.round(conf * 100));
                const text = insight.insight_value || "—";
                return (
                  <div
                    key={insight.id}
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: "10px",
                      padding: "16px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", marginBottom: "8px" }}>
                      <span
                        style={{
                          padding: "3px 8px",
                          borderRadius: "5px",
                          fontSize: "12px",
                          fontWeight: 500,
                          background: `${color}18`,
                          color,
                          fontFamily: "Inter, sans-serif",
                        }}
                      >
                        {cat}
                      </span>
                      <span style={{ fontSize: "12px", color: "#525252", fontFamily: "monospace" }}>
                        {pct}%
                      </span>
                    </div>
                    <p style={{ color: "#F2F2F2", fontSize: "14px", lineHeight: 1.6, marginBottom: "12px", fontFamily: "Inter, sans-serif" }}>
                      {text}
                    </p>
                    <div style={{ height: "3px", borderRadius: "2px", background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          borderRadius: "2px",
                          background: "#6366f1",
                          width: `${pct}%`,
                          transition: "width 0.3s",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
