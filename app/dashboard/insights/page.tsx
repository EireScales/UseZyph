"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const glassCard = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  backdropFilter: "blur(24px)",
};

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

export default function InsightsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<InsightRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [categoriesCount, setCategoriesCount] = useState(0);
  const [avgConfidence, setAvgConfidence] = useState<number | null>(null);
  const [recentDate, setRecentDate] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
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
    fetch();
  }, [router]);

  const groupedByType = insights.reduce<Record<string, InsightRow[]>>(
    (acc, i) => {
      const key = i.type || i.category || "General";
      if (!acc[key]) acc[key] = [];
      acc[key].push(i);
      return acc;
    },
    {}
  );

  const statCards = [
    { label: "Total insights", value: totalCount.toString(), border: "#7c3aed" },
    {
      label: "Categories",
      value: categoriesCount.toString(),
      border: "#e8837a",
    },
    {
      label: "Avg confidence",
      value: avgConfidence != null ? `${(avgConfidence * 100).toFixed(0)}%` : "—",
      border: "#d4956a",
    },
    {
      label: "Last updated",
      value: recentDate
        ? new Date(recentDate).toLocaleDateString()
        : "—",
      border: "#7c3aed",
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
      className="min-h-screen p-8"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
        `,
        backgroundSize: "80px 80px",
      }}
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Your Insights</h1>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl p-5 relative overflow-hidden"
              style={glassCard}
            >
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ background: stat.border }}
              />
              <p className="text-white/50 text-sm mb-1">{stat.label}</p>
              <p className="text-lg font-semibold text-white truncate">
                {stat.value}
              </p>
            </div>
          ))}
        </section>

        {insights.length === 0 ? (
          <div
            className="rounded-2xl p-12 flex flex-col items-center justify-center text-center"
            style={glassCard}
          >
            <div
              className="w-20 h-20 rounded-full mb-6 opacity-80"
              style={{
                background:
                  "radial-gradient(circle, rgba(124,58,237,0.4) 0%, transparent 70%)",
                animation: "pulse-glow 2.5s ease-in-out infinite",
              }}
            />
            <h2 className="text-xl font-semibold text-white mb-2">
              Zyph is still learning
            </h2>
            <p className="text-white/50 text-sm max-w-sm">
              Use the desktop app and keep working as usual. Insights will appear
              here as your profile builds.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedByType).map(([typeName, items]) => (
              <div key={typeName}>
                <h2 className="text-lg font-semibold text-white mb-4">
                  {typeName}
                </h2>
                <div className="space-y-4">
                  {items.map((insight) => (
                    <div
                      key={insight.id}
                      className="rounded-2xl p-6"
                      style={glassCard}
                    >
                      <p className="text-white/80 text-sm leading-relaxed">
                        {insight.content || insight.summary || "—"}
                      </p>
                      <div className="mt-3 flex items-center gap-3 text-xs text-white/40">
                        {insight.confidence != null && (
                          <span>
                            {(Number(insight.confidence) * 100).toFixed(0)}%
                            confidence
                          </span>
                        )}
                        {(insight.updated_at || insight.created_at) && (
                          <span>
                            {new Date(
                              insight.updated_at || insight.created_at!
                            ).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
