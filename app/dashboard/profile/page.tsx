"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";

type ProfileRow = { id: string; display_name: string | null } | null;
type ObservationRow = {
  id: string;
  captured_at: string;
  app_name?: string | null;
  summary?: string | null;
};
type InsightRow = {
  id: string;
  insight_type?: string | null;
  insight_value?: string | null;
  confidence_score?: number | null;
  updated_at?: string;
};

const CATEGORY_COLORS: Record<string, string> = {
  communication: "#7c3aed",
  interests: "#e8837a",
  "work style": "#f59e0b",
  work: "#7c3aed",
  creative: "#e8837a",
  learning: "#f59e0b",
  other: "#22c55e",
  general: "#22c55e",
  General: "#22c55e",
};

function getCategoryColor(category: string): string {
  const k = category.trim().toLowerCase();
  return CATEGORY_COLORS[k] || CATEGORY_COLORS[category] || "#7c3aed";
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const num = parseInt(n, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function ConfidenceRing({ value }: { value: number | null }) {
  const r = 44;
  const stroke = 6;
  const size = (r + stroke) * 2;
  const c = 2 * Math.PI * r;
  if (value == null) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-2">
        <div
          className="rounded-full border-2 border-dashed border-[#2a2a2a] flex items-center justify-center text-[#555] text-xs"
          style={{ width: size, height: size }}
        >
          —
        </div>
        <span className="text-xs text-[#666] uppercase tracking-wider">
          Confidence
        </span>
      </div>
    );
  }
  const pct = Math.min(100, Math.max(0, Math.round(value * 100)));
  const offset = c - (pct / 100) * c;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="absolute inset-0 -rotate-90"
          aria-hidden
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="#1e1e1e"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="#7c3aed"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            style={{
              filter: "drop-shadow(0 0 6px rgba(124,58,237,0.55))",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold tabular-nums text-white">{pct}%</span>
        </div>
      </div>
      <span className="text-xs text-[#888] uppercase tracking-wider">
        Avg confidence
      </span>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileRow>(null);
  const [observations, setObservations] = useState<ObservationRow[]>([]);
  const [insights, setInsights] = useState<InsightRow[]>([]);
  const [totalObservations, setTotalObservations] = useState(0);
  const [daysObserved, setDaysObserved] = useState(0);
  const [confidenceAvg, setConfidenceAvg] = useState<number | null>(null);
  const [memberSince, setMemberSince] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [observationsLimit, setObservationsLimit] = useState(10);

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

      if (user.email) setUserEmail(user.email);
      if (user.created_at) {
        setMemberSince(
          new Date(user.created_at).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })
        );
      }

      try {
        const [profileRes, observationsRes, insightsRes, countRes] =
          await Promise.all([
            supabase
              .from("profiles")
              .select("id, display_name")
              .eq("id", user.id)
              .single(),
            supabase
              .from("observations")
              .select("id, captured_at, app_name, summary")
              .eq("user_id", user.id)
              .order("captured_at", { ascending: false })
              .limit(20),
            supabase
              .from("user_profile_insights")
              .select("id, insight_type, insight_value, confidence_score, updated_at")
              .eq("user_id", user.id),
            supabase
              .from("observations")
              .select("id", { count: "exact", head: true })
              .eq("user_id", user.id),
          ]);

        if (profileRes.data) setProfile(profileRes.data as ProfileRow);
        if (observationsRes.data)
          setObservations((observationsRes.data as ObservationRow[]) || []);
        if (insightsRes.data)
          setInsights((insightsRes.data as InsightRow[]) || []);

        if (countRes.count != null) setTotalObservations(countRes.count);

        const daysRes = await supabase
          .from("observations")
          .select("captured_at")
          .eq("user_id", user.id)
          .limit(500);
        if (daysRes.data?.length) {
          const dates = new Set(
            (daysRes.data as { captured_at: string }[]).map((o) =>
              o.captured_at.slice(0, 10)
            )
          );
          setDaysObserved(dates.size);
        }

        const withConf =
          (insightsRes.data as InsightRow[])?.filter(
            (i) => i.confidence_score != null
          ) || [];
        if (withConf.length) {
          const avg =
            withConf.reduce((s, i) => s + Number(i.confidence_score), 0) /
            withConf.length;
          setConfidenceAvg(Math.round(avg * 100) / 100);
        }

        const categories = new Set(
          (insightsRes.data as InsightRow[] | undefined)?.map(
            (i) => i.insight_type || "General"
          ) || []
        );
        const initial: Record<string, boolean> = {};
        categories.forEach((c) => {
          initial[c] = true;
        });
        setExpandedCategories(initial);
      } catch {
        // tables may not exist
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const handleSaveName = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || savingName) return;
    setSavingName(true);
    try {
      await supabase
        .from("profiles")
        .update({ display_name: editNameValue.trim() || null })
        .eq("id", user.id);
      setProfile((p) =>
        p ? { ...p, display_name: editNameValue.trim() || null } : null
      );
      setEditingName(false);
    } finally {
      setSavingName(false);
    }
  };

  const handleClearData = async () => {
    setClearing(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setClearing(false);
      setClearModalOpen(false);
      return;
    }
    try {
      await supabase.from("observations").delete().eq("user_id", user.id);
      await supabase
        .from("user_profile_insights")
        .delete()
        .eq("user_id", user.id);
      setObservations([]);
      setInsights([]);
      setTotalObservations(0);
      setDaysObserved(0);
      setConfidenceAvg(null);
      setClearModalOpen(false);
    } catch {
      // show error in modal if needed
    } finally {
      setClearing(false);
    }
  };

  const toggleCategory = (key: string) => {
    setExpandedCategories((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const groupedByCategory = insights.reduce<Record<string, InsightRow[]>>(
    (acc, i) => {
      const key = i.insight_type || "General";
      if (!acc[key]) acc[key] = [];
      acc[key].push(i);
      return acc;
    },
    {}
  );

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

  const initial = profile?.display_name?.[0]?.toUpperCase() || "?";
  const displayObservations = observations.slice(0, observationsLimit);
  const hasMoreObservations = observations.length > observationsLimit;
  const displayName = profile?.display_name?.trim() || "Add your name";
  const categoryCount = Object.keys(groupedByCategory).length;

  const appBadgeColors = [
    "#7c3aed",
    "#e8837a",
    "#f59e0b",
    "#22c55e",
    "#38bdf8",
  ];

  return (
    <div
      className="min-w-0 pb-8"
      style={{ animation: "dashboardFadeIn 0.3s ease forwards" }}
    >
      {/* Full-width hero */}
      <div
        className="relative w-screen max-w-none left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mb-10 overflow-hidden border-b border-[#1f1f2e]"
        style={{
          background:
            "linear-gradient(135deg, rgba(124,58,237,0.22) 0%, rgba(91,33,182,0.12) 40%, rgba(10,10,14,0.95) 100%), radial-gradient(ellipse 80% 60% at 20% 0%, rgba(124,58,237,0.25), transparent 55%)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-4xl px-6 md:px-8 py-10 md:py-12">
          <div className="flex flex-col sm:flex-row sm:items-center gap-8">
            <div
              className="h-24 w-24 shrink-0 rounded-2xl flex items-center justify-center text-4xl font-bold text-white shadow-lg"
              style={{
                background:
                  "linear-gradient(145deg, #7c3aed 0%, #5b21b6 45%, #e8837a 100%)",
                boxShadow:
                  "0 0 0 1px rgba(255,255,255,0.08), 0 20px 50px -12px rgba(124,58,237,0.55)",
              }}
            >
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              {editingName ? (
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={editNameValue}
                    onChange={(e) => setEditNameValue(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-[#111]/80 border border-[#2a2a3a] text-[#f0f0f0] text-lg font-semibold focus:outline-none focus:border-[#a78bfa] focus:ring-1 focus:ring-[#7c3aed]/40 transition-colors duration-200"
                    placeholder="Display name"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleSaveName}
                    disabled={savingName}
                    className="px-3 py-2 rounded-lg bg-[#7c3aed] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all duration-200 shadow-md shadow-violet-900/30"
                  >
                    {savingName ? "Saving…" : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingName(false);
                      setEditNameValue(profile?.display_name ?? "");
                    }}
                    className="px-3 py-2 rounded-lg text-[#a3a3a3] hover:bg-white/5 text-sm transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setEditNameValue(profile?.display_name ?? "");
                    setEditingName(true);
                  }}
                  className="text-2xl md:text-3xl font-bold text-white hover:text-violet-100 transition-colors duration-200 text-left tracking-tight"
                >
                  {displayName}
                </button>
              )}
              {userEmail && (
                <p className="text-[#b4b4c0] text-sm mt-2 truncate max-w-full">
                  {userEmail}
                </p>
              )}
              <p className="text-[#8b8b9a] text-xs mt-1.5 flex items-center gap-2">
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400/90"
                  style={{ boxShadow: "0 0 8px rgba(52,211,153,0.5)" }}
                />
                Member since {memberSince || "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 md:px-8">
        {/* Stats + confidence ring */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12 items-stretch">
          <div
            className="rounded-2xl p-6 relative overflow-hidden"
            style={{
              background: "#111111",
              border: "1px solid #1e1e1e",
              borderLeft: "4px solid #7c3aed",
              boxShadow:
                "0 0 32px -8px rgba(124,58,237,0.35), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            <p className="text-[#737373] text-xs font-medium uppercase tracking-wider mb-2">
              Total observations
            </p>
            <p
              className="text-3xl md:text-4xl font-bold text-white tabular-nums"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {totalObservations.toLocaleString()}
            </p>
          </div>
          <div
            className="rounded-2xl p-6 relative overflow-hidden"
            style={{
              background: "#111111",
              border: "1px solid #1e1e1e",
              borderLeft: "4px solid #e8837a",
              boxShadow:
                "0 0 32px -8px rgba(232,131,122,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            <p className="text-[#737373] text-xs font-medium uppercase tracking-wider mb-2">
              Days observed
            </p>
            <p
              className="text-3xl md:text-4xl font-bold text-white tabular-nums"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {daysObserved}
            </p>
          </div>
          <div
            className="rounded-2xl p-6 relative overflow-hidden"
            style={{
              background: "#111111",
              border: "1px solid #1e1e1e",
              borderLeft: "4px solid #f59e0b",
              boxShadow:
                "0 0 32px -8px rgba(245,158,11,0.28), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            <p className="text-[#737373] text-xs font-medium uppercase tracking-wider mb-2">
              Insight categories
            </p>
            <p
              className="text-3xl md:text-4xl font-bold text-white tabular-nums"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {categoryCount}
            </p>
            <p className="text-[#555] text-xs mt-2">{insights.length} total insights</p>
          </div>
          <div
            className="rounded-2xl p-6 flex items-center justify-center"
            style={{
              background: "#111111",
              border: "1px solid #1e1e1e",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            <ConfidenceRing value={confidenceAvg} />
          </div>
        </div>

        {/* Insights */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-5 tracking-tight">
            What Zyph has learned about you
          </h2>
          {Object.keys(groupedByCategory).length === 0 ? (
            <div
              className="rounded-2xl p-14 flex flex-col items-center justify-center text-center border border-[#1e1e1e]"
              style={{ background: "#111111" }}
            >
              <div
                className="w-16 h-16 rounded-full bg-[#7c3aed]/30 animate-pulse mb-4"
                style={{ boxShadow: "0 0 24px rgba(124,58,237,0.3)" }}
              />
              <p className="text-[#888] text-sm max-w-sm">
                No insights yet. Keep using Zyph to build your profile.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedByCategory).map(([category, items]) => {
                const color = getCategoryColor(category);
                const { r, g, b } = hexToRgb(color);
                const isExpanded = expandedCategories[category] !== false;
                return (
                  <div
                    key={category}
                    className="rounded-2xl overflow-hidden transition-all duration-200 border border-[#1e1e1e]"
                    style={{
                      background: `linear-gradient(135deg, rgba(${r},${g},${b},0.09) 0%, #111111 55%)`,
                      boxShadow: `inset 0 0 0 1px rgba(${r},${g},${b},0.12)`,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleCategory(category)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.03] transition-colors duration-200"
                    >
                      <span
                        className="font-semibold text-white flex items-center gap-2"
                      >
                        <span
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{
                            background: color,
                            boxShadow: `0 0 10px ${color}99`,
                          }}
                        />
                        {category}
                      </span>
                      <span
                        className="text-xs px-2.5 py-1 rounded-full text-[#b4b4c0]"
                        style={{ background: "rgba(0,0,0,0.35)" }}
                      >
                        {items.length} insight{items.length !== 1 ? "s" : ""}
                      </span>
                    </button>
                    {isExpanded && (
                      <div className="px-5 pb-5 pt-0 flex flex-wrap gap-2">
                        {items.map((insight) => {
                          const conf =
                            insight.confidence_score != null
                              ? Number(insight.confidence_score)
                              : 0;
                          const pct = Math.min(100, Math.round(conf * 100));
                          const text = insight.insight_value || "—";
                          return (
                            <div
                              key={insight.id}
                              className="group flex flex-col gap-2 rounded-xl px-3 py-2.5 max-w-full"
                              style={{
                                background: "rgba(0,0,0,0.35)",
                                border: `1px solid rgba(${r},${g},${b},0.2)`,
                              }}
                            >
                              <span
                                className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium text-[#f0f0f0] leading-snug"
                                style={{
                                  background: `rgba(${r},${g},${b},0.18)`,
                                  border: `1px solid rgba(${r},${g},${b},0.35)`,
                                }}
                              >
                                {text}
                              </span>
                              <div className="h-1 rounded-full overflow-hidden bg-[#1a1a1a] w-full min-w-[120px]">
                                <div
                                  className="h-full rounded-full transition-all duration-300"
                                  style={{
                                    width: `${pct}%`,
                                    background: color,
                                    boxShadow: `0 0 8px ${color}66`,
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Recent Observations Timeline */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-5 tracking-tight">
            Recent observations
          </h2>
          <div
            className="rounded-2xl p-6 md:p-8 relative overflow-hidden"
            style={{
              background: "#111111",
              border: "1px solid #1e1e1e",
            }}
          >
            {observations.length === 0 ? (
              <p className="text-[#888] text-sm">
                No observations yet. Use the desktop app to start.
              </p>
            ) : (
              <ul className="relative pl-1">
                <span
                  className="absolute left-[11px] top-3 bottom-8 w-[2px] rounded-full pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(124,58,237,0.65) 0%, rgba(124,58,237,0.15) 100%)",
                  }}
                  aria-hidden
                />
                {displayObservations.map((obs, idx) => {
                  const badgeColor =
                    appBadgeColors[idx % appBadgeColors.length];
                  return (
                    <li
                      key={obs.id}
                      className="relative flex gap-4 pl-10 pb-8 last:pb-0"
                    >
                      <span
                        className="absolute left-0 top-1.5 w-6 h-6 rounded-full shrink-0 border-[3px] border-[#111] z-10"
                        style={{
                          background: badgeColor,
                          boxShadow: `0 0 0 2px rgba(124,58,237,0.35), 0 0 12px ${badgeColor}55`,
                        }}
                      />
                      <div className="min-w-0 flex-1 pt-0.5">
                        {obs.app_name && (
                          <span
                            className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wide mb-2"
                            style={{
                              background: `${badgeColor}22`,
                              color: badgeColor,
                              border: `1px solid ${badgeColor}44`,
                            }}
                          >
                            {obs.app_name}
                          </span>
                        )}
                        <p className="text-[#f0f0f0] text-sm leading-relaxed font-medium">
                          {obs.summary || "Activity"}
                        </p>
                        <p
                          className="text-[#737373] text-xs mt-2 tabular-nums"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          {formatNiceDate(obs.captured_at)} ·{" "}
                          {formatTimeAgo(obs.captured_at)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            {hasMoreObservations && (
              <button
                type="button"
                onClick={() => setObservationsLimit((n) => n + 10)}
                className="mt-6 text-sm font-medium text-[#a78bfa] hover:text-violet-300 transition-colors duration-200"
              >
                Load more
              </button>
            )}
          </div>
        </section>

        {/* Danger zone */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setClearModalOpen(true)}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-red-400 border border-red-900/50 bg-transparent hover:bg-red-950/50 transition-colors duration-200"
          >
            Clear all my data
          </button>
        </div>
      </div>

      {clearModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          onClick={() => !clearing && setClearModalOpen(false)}
        >
          <div
            className="rounded-xl p-6 max-w-md w-full shadow-xl border border-[#1e1e1e] bg-[#111111]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-[#f0f0f0] mb-2">
              Clear all my data?
            </h3>
            <p className="text-[#666] text-sm mb-6">
              This will permanently delete your observations and profile
              insights. This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setClearModalOpen(false)}
                disabled={clearing}
                className="px-4 py-2 rounded-lg text-[#999] hover:bg-[#141414] transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearData}
                disabled={clearing}
                className="px-4 py-2 rounded-lg text-red-400 border border-red-900/50 bg-transparent hover:bg-red-950/50 disabled:opacity-50 transition-colors duration-200"
              >
                {clearing ? "Clearing…" : "Yes, clear everything"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatTimeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffM = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffMs / 86400000);
  if (diffM < 1) return "Just now";
  if (diffM < 60) return `${diffM}m ago`;
  if (diffH < 24) return `${diffH}h ago`;
  if (diffD < 7) return `${diffD}d ago`;
  return d.toLocaleDateString();
}

function formatNiceDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
