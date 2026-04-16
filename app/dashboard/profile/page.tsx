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
  communication: "#6366f1",
  interests: "#f97316",
  "work style": "#f59e0b",
  work: "#6366f1",
  creative: "#f97316",
  learning: "#f59e0b",
  other: "#22c55e",
  general: "#22c55e",
  General: "#22c55e",
};

function getCategoryColor(category: string): string {
  const k = category.trim().toLowerCase();
  return CATEGORY_COLORS[k] || CATEGORY_COLORS[category] || "#6366f1";
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
          className="rounded-full flex items-center justify-center text-xs"
          style={{ width: size, height: size, border: "2px dashed rgba(255,255,255,0.1)", color: "#525252" }}
        >
          —
        </div>
        <span style={{ fontSize: "11px", color: "#525252", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "Inter, sans-serif" }}>
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
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="#6366f1"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            style={{ filter: "drop-shadow(0 0 6px rgba(99,102,241,0.55))" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span style={{ fontSize: "20px", fontWeight: 700, color: "#F2F2F2", fontVariantNumeric: "tabular-nums" }}>{pct}%</span>
        </div>
      </div>
      <span style={{ fontSize: "11px", color: "#525252", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "Inter, sans-serif" }}>
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
      <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center" }}>
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: "#6366f1", borderTopColor: "transparent" }}
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

  const appBadgeColors = ["#6366f1", "#f97316", "#f59e0b", "#22c55e", "#38bdf8"];

  return (
    <div style={{ padding: "32px 40px", animation: "dashboardFadeIn 0.3s ease forwards" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital,wght@0,400;1,400&family=Inter:wght@400;500;600;700&display=swap');
      `}</style>

      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        {/* Profile card */}
        <div
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "12px",
            padding: "24px 28px",
            marginBottom: "28px",
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div
              style={{
                width: "68px",
                height: "68px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "26px",
                fontWeight: 700,
                color: "#fff",
                flexShrink: 0,
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              }}
            >
              {initial}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              {editingName ? (
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={editNameValue}
                    onChange={(e) => setEditNameValue(e.target.value)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "#F2F2F2",
                      fontSize: "18px",
                      fontWeight: 600,
                      outline: "none",
                      fontFamily: "Inter, sans-serif",
                    }}
                    placeholder="Display name"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleSaveName}
                    disabled={savingName}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      background: "#6366f1",
                      color: "#fff",
                      fontSize: "13px",
                      fontWeight: 500,
                      border: "none",
                      cursor: "pointer",
                      opacity: savingName ? 0.5 : 1,
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {savingName ? "Saving…" : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingName(false);
                      setEditNameValue(profile?.display_name ?? "");
                    }}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      background: "transparent",
                      color: "#8a8f98",
                      fontSize: "13px",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "Inter, sans-serif",
                    }}
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
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left" }}
                >
                  <span style={{ fontSize: "20px", fontWeight: 600, color: "#F2F2F2", fontFamily: "Inter, sans-serif", letterSpacing: "-0.02em" }}>
                    {displayName}
                  </span>
                </button>
              )}
              {userEmail && (
                <p style={{ color: "#8a8f98", fontSize: "13px", marginTop: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "Inter, sans-serif" }}>
                  {userEmail}
                </p>
              )}
              <p style={{ color: "#525252", fontSize: "12px", marginTop: "6px", display: "flex", alignItems: "center", gap: "6px", fontFamily: "Inter, sans-serif" }}>
                <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e", flexShrink: 0, boxShadow: "0 0 6px rgba(34,197,94,0.5)" }} />
                Member since {memberSince || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Stats + confidence ring */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" style={{ marginBottom: "32px" }}>
          {[
            { label: "Total observations", value: totalObservations.toLocaleString(), accent: "#6366f1" },
            { label: "Days observed", value: daysObserved.toString(), accent: "#f97316" },
            { label: "Insight categories", value: categoryCount.toString(), sub: `${insights.length} total insights`, accent: "#f59e0b" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderLeft: `3px solid ${stat.accent}`,
                borderRadius: "10px",
                padding: "20px",
              }}
            >
              <p style={{ fontSize: "11px", color: "#525252", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px", fontFamily: "Inter, sans-serif" }}>
                {stat.label}
              </p>
              <p style={{ fontSize: "30px", fontWeight: 700, color: "#F2F2F2", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
                {stat.value}
              </p>
              {stat.sub && (
                <p style={{ fontSize: "12px", color: "#525252", marginTop: "6px", fontFamily: "Inter, sans-serif" }}>{stat.sub}</p>
              )}
            </div>
          ))}
          <div
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "10px",
              padding: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ConfidenceRing value={confidenceAvg} />
          </div>
        </div>

        {/* Insights */}
        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#F2F2F2", marginBottom: "14px", fontFamily: "Inter, sans-serif" }}>
            What Zyph has learned about you
          </h2>
          {Object.keys(groupedByCategory).length === 0 ? (
            <div
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "10px",
                padding: "56px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              <div
                className="animate-pulse"
                style={{ width: "44px", height: "44px", borderRadius: "50%", background: "rgba(99,102,241,0.18)", marginBottom: "14px" }}
              />
              <p style={{ color: "#8a8f98", fontSize: "13px", fontFamily: "Inter, sans-serif", lineHeight: 1.6 }}>
                No insights yet. Keep using Zyph to build your profile.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {Object.entries(groupedByCategory).map(([category, items]) => {
                const color = getCategoryColor(category);
                const { r, g, b } = hexToRgb(color);
                const isExpanded = expandedCategories[category] !== false;
                return (
                  <div
                    key={category}
                    style={{
                      background: `rgba(${r},${g},${b},0.04)`,
                      border: `1px solid rgba(${r},${g},${b},0.12)`,
                      borderRadius: "10px",
                      overflow: "hidden",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleCategory(category)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "13px 18px",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <span style={{ fontWeight: 600, color: "#F2F2F2", display: "flex", alignItems: "center", gap: "8px", fontFamily: "Inter, sans-serif", fontSize: "13px" }}>
                        <span
                          style={{
                            width: "7px",
                            height: "7px",
                            borderRadius: "50%",
                            flexShrink: 0,
                            background: color,
                            boxShadow: `0 0 8px ${color}88`,
                          }}
                        />
                        {category}
                      </span>
                      <span
                        style={{
                          fontSize: "12px",
                          padding: "3px 10px",
                          borderRadius: "100px",
                          color: "#8a8f98",
                          background: "rgba(255,255,255,0.05)",
                          fontFamily: "Inter, sans-serif",
                        }}
                      >
                        {items.length} insight{items.length !== 1 ? "s" : ""}
                      </span>
                    </button>
                    {isExpanded && (
                      <div style={{ padding: "0 18px 18px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
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
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "8px",
                                background: "rgba(0,0,0,0.25)",
                                border: `1px solid rgba(${r},${g},${b},0.15)`,
                                borderRadius: "8px",
                                padding: "10px 12px",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "12px",
                                  fontWeight: 500,
                                  color: "#F2F2F2",
                                  background: `rgba(${r},${g},${b},0.15)`,
                                  border: `1px solid rgba(${r},${g},${b},0.25)`,
                                  borderRadius: "100px",
                                  padding: "4px 10px",
                                  fontFamily: "Inter, sans-serif",
                                }}
                              >
                                {text}
                              </span>
                              <div style={{ height: "3px", borderRadius: "2px", background: "rgba(255,255,255,0.06)", overflow: "hidden", minWidth: "120px" }}>
                                <div
                                  style={{
                                    height: "100%",
                                    borderRadius: "2px",
                                    width: `${pct}%`,
                                    background: color,
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
        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#F2F2F2", marginBottom: "14px", fontFamily: "Inter, sans-serif" }}>
            Recent observations
          </h2>
          <div
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "10px",
              padding: "24px",
            }}
          >
            {observations.length === 0 ? (
              <p style={{ color: "#8a8f98", fontSize: "13px", fontFamily: "Inter, sans-serif" }}>
                No observations yet. Use the desktop app to start.
              </p>
            ) : (
              <ul style={{ position: "relative", paddingLeft: "4px" }}>
                <span
                  style={{
                    position: "absolute",
                    left: "11px",
                    top: "12px",
                    bottom: "32px",
                    width: "2px",
                    borderRadius: "2px",
                    pointerEvents: "none",
                    background: "linear-gradient(180deg, rgba(99,102,241,0.5) 0%, rgba(99,102,241,0.06) 100%)",
                  }}
                  aria-hidden
                />
                {displayObservations.map((obs, idx) => {
                  const badgeColor = appBadgeColors[idx % appBadgeColors.length];
                  return (
                    <li
                      key={obs.id}
                      style={{ position: "relative", display: "flex", gap: "16px", paddingLeft: "40px", paddingBottom: "28px" }}
                      className="last:pb-0"
                    >
                      <span
                        style={{
                          position: "absolute",
                          left: 0,
                          top: "6px",
                          width: "22px",
                          height: "22px",
                          borderRadius: "50%",
                          flexShrink: 0,
                          background: badgeColor,
                          border: "3px solid #08090a",
                          zIndex: 10,
                          boxShadow: `0 0 10px ${badgeColor}44`,
                        }}
                      />
                      <div style={{ minWidth: 0, flex: 1, paddingTop: "2px" }}>
                        {obs.app_name && (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              padding: "3px 8px",
                              borderRadius: "5px",
                              fontSize: "11px",
                              fontWeight: 600,
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                              marginBottom: "6px",
                              background: `${badgeColor}18`,
                              color: badgeColor,
                              border: `1px solid ${badgeColor}33`,
                              fontFamily: "Inter, sans-serif",
                            }}
                          >
                            {obs.app_name}
                          </span>
                        )}
                        <p style={{ color: "#F2F2F2", fontSize: "13px", lineHeight: 1.6, fontWeight: 500, fontFamily: "Inter, sans-serif" }}>
                          {obs.summary || "Activity"}
                        </p>
                        <p style={{ color: "#525252", fontSize: "12px", marginTop: "6px", fontFamily: "monospace" }}>
                          {formatNiceDate(obs.captured_at)} · {formatTimeAgo(obs.captured_at)}
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
                style={{
                  marginTop: "20px",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#818cf8",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                Load more
              </button>
            )}
          </div>
        </section>

        {/* Danger zone */}
        <div>
          <button
            type="button"
            onClick={() => setClearModalOpen(true)}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 500,
              color: "#f87171",
              background: "transparent",
              border: "1px solid rgba(239,68,68,0.3)",
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Clear all my data
          </button>
        </div>
      </div>

      {clearModalOpen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", background: "rgba(0,0,0,0.72)" }}
          onClick={() => !clearing && setClearModalOpen(false)}
        >
          <div
            style={{
              borderRadius: "12px",
              padding: "24px",
              maxWidth: "420px",
              width: "100%",
              background: "#0f1011",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: "17px", fontWeight: 600, color: "#F2F2F2", marginBottom: "8px", fontFamily: "Inter, sans-serif" }}>
              Clear all my data?
            </h3>
            <p style={{ color: "#8a8f98", fontSize: "13px", marginBottom: "24px", lineHeight: 1.6, fontFamily: "Inter, sans-serif" }}>
              This will permanently delete your observations and profile
              insights. This cannot be undone.
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setClearModalOpen(false)}
                disabled={clearing}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  color: "#8a8f98",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearData}
                disabled={clearing}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  color: "#f87171",
                  background: "transparent",
                  border: "1px solid rgba(239,68,68,0.3)",
                  cursor: "pointer",
                  fontSize: "13px",
                  opacity: clearing ? 0.5 : 1,
                  fontFamily: "Inter, sans-serif",
                }}
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
