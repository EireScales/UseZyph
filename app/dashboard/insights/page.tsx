"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type InsightRow = {
  id: string;
  type?: string | null;
  category?: string | null;
  content?: string | null;
  summary?: string | null;
  confidence?: number | null;
  created_at?: string;
  updated_at?: string;
};

const CATEGORY_COLORS: Record<string, string> = {
  communication: "#7c3aed",
  interests: "#e8837a",
  "work style": "#f59e0b",
  General: "#22c55e",
};

export default function InsightsPage() {
  const router = useRouter();
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
          .select("id, type, category, content, summary, confidence, created_at, updated_at")
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
          list.map((i) => i.category || i.type || "General")
        );
        setCategoriesCount(categories.size);

        const withConf = list.filter((i) => i.confidence != null);
        if (withConf.length) {
          const avg =
            withConf.reduce((s, i) => s + Number(i.confidence), 0) /
            withConf.length;
          setAvgConfidence(Math.round(avg * 100) / 100);
        }

        if (list.length) {
          const latest = list[0].updated_at || list[0].created_at;
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
    new Set(insights.map((i) => i.category || i.type || "General"))
  );
  const filteredInsights =
    selectedCategory === "All"
      ? insights
      : insights.filter(
          (i) => (i.category || i.type || "General") === selectedCategory
        );

  const statCards = [
    {
      label: "Total insights",
      value: totalCount.toString(),
      border: "#7c3aed",
    },
    {
      label: "Categories",
      value: categoriesCount.toString(),
      border: "#e8837a",
    },
    {
      label: "Avg confidence",
      value: avgConfidence != null ? `${(avgConfidence * 100).toFixed(0)}%` : "—",
      border: "#f59e0b",
    },
    {
      label: "Last updated",
      value: recentDate ? new Date(recentDate).toLocaleDateString() : "—",
      border: "#22c55e",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-[#7c3aed] border-t-transparent"
          aria-label="Loading"
        />
      </div>
    );
  }

  return (
    <div
      className="p-6 md:p-8"
      style={{ animation: "dashboardFadeIn 0.3s ease forwards" }}
    >

      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#f0f0f0] mb-6">
          Your Insights
        </h1>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl p-5 transition-all duration-200 hover:border-[#2a2a2a]"
              style={{
                background: "#111111",
                border: "1px solid #1e1e1e",
                borderLeft: "2px solid " + stat.border,
              }}
            >
              <p className="text-[#555] text-[11px] uppercase tracking-widest mb-1">
                {stat.label}
              </p>
              <p
                className="text-lg font-medium text-[#f0f0f0] truncate"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </section>

        {insights.length === 0 ? (
          <div
            className="rounded-xl p-16 flex flex-col items-center justify-center text-center border border-[#1e1e1e]"
            style={{ background: "#111111" }}
          >
            <div className="relative w-24 h-24 mb-6">
              <span
                className="absolute inset-0 rounded-full bg-[#7c3aed]/20 animate-pulse"
                style={{ animationDuration: "2s" }}
              />
              <span
                className="absolute inset-2 rounded-full bg-[#7c3aed]/30 animate-pulse"
                style={{ animationDuration: "2s", animationDelay: "0.2s" }}
              />
              <span
                className="absolute inset-4 rounded-full bg-[#7c3aed]/40 animate-pulse"
                style={{ animationDuration: "2s", animationDelay: "0.4s" }}
              />
            </div>
            <h2 className="text-xl font-semibold text-[#f0f0f0] mb-2">
              Zyph is still learning
            </h2>
            <p className="text-[#666] text-sm max-w-sm mb-4">
              Keep working as normal. Insights appear here after 2–4 weeks.
            </p>
            <a
              href="#"
              className="text-sm text-[#7c3aed] hover:underline transition-opacity duration-200"
            >
              Download desktop app →
            </a>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            <aside className="lg:w-48 shrink-0">
              <p className="text-[#555] text-xs uppercase tracking-wider mb-3">
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
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-[#7c3aed] text-white"
                          : "bg-[#141414] text-[#666] border border-[#1e1e1e] hover:border-[#333] hover:bg-[#1a1a1a]"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </aside>

            <div className="flex-1 min-w-0 space-y-4">
              {filteredInsights.map((insight) => {
                const cat = insight.category || insight.type || "General";
                const color = CATEGORY_COLORS[cat] || "#7c3aed";
                const conf = insight.confidence != null ? Number(insight.confidence) : 0;
                const pct = Math.min(100, Math.round(conf * 100));
                const text = insight.content || insight.summary || "—";
                return (
                  <div
                    key={insight.id}
                    className="rounded-xl p-4 transition-all duration-200 hover:border-[#2a2a2a] hover:-translate-y-0.5"
                    style={{
                      background: "#111111",
                      border: "1px solid #1e1e1e",
                    }}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{
                          background: `${color}20`,
                          color,
                        }}
                      >
                        {cat}
                      </span>
                      <span
                        className="text-xs text-[#666]"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {pct}%
                      </span>
                    </div>
                    <p className="text-[#f0f0f0] text-[15px] leading-relaxed mb-3">
                      {text}
                    </p>
                    <div className="h-1 rounded-full overflow-hidden bg-[#1a1a1a]">
                      <div
                        className="h-full rounded-full bg-[#7c3aed] transition-all duration-300"
                        style={{ width: `${pct}%` }}
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
