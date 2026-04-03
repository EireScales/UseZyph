"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";

type ProfileRow = { id: string; display_name: string | null } | null;
type ObservationRow = {
  id: string;
  created_at: string;
  app_name?: string | null;
  description?: string | null;
};
type InsightRow = {
  id: string;
  type?: string | null;
  category?: string | null;
  content?: string | null;
  summary?: string | null;
  confidence?: number | null;
  updated_at?: string;
};

const CATEGORY_COLORS: Record<string, string> = {
  communication: "#7c3aed",
  interests: "#e8837a",
  "work style": "#f59e0b",
  General: "#22c55e",
};

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
        setMemberSince(new Date(user.created_at).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }));
      }

      try {
        const [profileRes, observationsRes, insightsRes, countRes] =
          await Promise.all([
            supabase.from("profiles").select("id, display_name").eq("id", user.id).single(),
            supabase
              .from("observations")
              .select("id, created_at, app_name, description")
              .eq("user_id", user.id)
              .order("created_at", { ascending: false })
              .limit(20),
            supabase
              .from("user_profile_insights")
              .select("id, type, category, content, summary, confidence, updated_at")
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
          .select("created_at")
          .eq("user_id", user.id)
          .limit(500);
        if (daysRes.data?.length) {
          const dates = new Set(
            (daysRes.data as { created_at: string }[]).map((o) =>
              o.created_at.slice(0, 10)
            )
          );
          setDaysObserved(dates.size);
        }

        const withConf = (insightsRes.data as InsightRow[])?.filter(
          (i) => i.confidence != null
        ) || [];
        if (withConf.length) {
          const avg =
            withConf.reduce((s, i) => s + Number(i.confidence), 0) /
            withConf.length;
          setConfidenceAvg(Math.round(avg * 100) / 100);
        }

        const categories = new Set(
          (insightsRes.data as InsightRow[] || []).map(
            (i) => i.category || i.type || "General"
          )
        );
        const initial: Record<string, boolean> = {};
        categories.forEach((c) => (initial[c] = true));
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || savingName) return;
    setSavingName(true);
    try {
      await supabase
        .from("profiles")
        .update({ display_name: editNameValue.trim() || null })
        .eq("id", user.id);
      setProfile((p) => (p ? { ...p, display_name: editNameValue.trim() || null } : null));
      setEditingName(false);
    } finally {
      setSavingName(false);
    }
  };

  const handleClearData = async () => {
    setClearing(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setClearing(false);
      setClearModalOpen(false);
      return;
    }
    try {
      await supabase.from("observations").delete().eq("user_id", user.id);
      await supabase.from("user_profile_insights").delete().eq("user_id", user.id);
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
      const key = i.category || i.type || "General";
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

  return (
    <div
      className="p-6 md:p-8"
      style={{ animation: "dashboardFadeIn 0.3s ease forwards" }}
    >

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-6 mb-10">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white shrink-0"
            style={{
              background: "linear-gradient(135deg, #7c3aed 0%, #e8837a 100%)",
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
                  className="px-3 py-2 rounded-lg bg-[#111] border border-[#1e1e1e] text-[#f0f0f0] text-lg font-semibold focus:outline-none focus:border-[#7c3aed] transition-colors duration-200"
                  placeholder="Display name"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleSaveName}
                  disabled={savingName}
                  className="px-3 py-2 rounded-lg bg-[#7c3aed] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all duration-200"
                >
                  {savingName ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingName(false);
                    setEditNameValue(profile?.display_name ?? "");
                  }}
                  className="px-3 py-2 rounded-lg text-[#666] hover:bg-[#141414] text-sm transition-colors duration-200"
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
                className="text-2xl font-bold text-[#f0f0f0] hover:text-white transition-colors duration-200 text-left"
              >
                {profile?.display_name?.trim() || "Add your name"}
              </button>
            )}
            {userEmail && <p className="text-[#555] text-sm mt-0.5">{userEmail}</p>}
            <p className="text-[#555] text-xs mt-0.5">Member since {memberSince || "—"}</p>
          </div>
        </div>

        {/* Identity Stats */}
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10 p-5 rounded-xl"
          style={{
            background: "#111111",
            border: "1px solid #1e1e1e",
          }}
        >
          <div>
            <p className="text-[#555] text-xs uppercase tracking-wider mb-1">Name</p>
            <p className="text-[#f0f0f0] font-medium truncate" style={{ fontFamily: "var(--font-mono)" }}>
              {profile?.display_name || "—"}
            </p>
          </div>
          <div>
            <p className="text-[#555] text-xs uppercase tracking-wider mb-1">Days observed</p>
            <p className="text-[#f0f0f0] font-medium" style={{ fontFamily: "var(--font-mono)" }}>
              {daysObserved}
            </p>
          </div>
          <div>
            <p className="text-[#555] text-xs uppercase tracking-wider mb-1">Total observations</p>
            <p className="text-[#f0f0f0] font-medium" style={{ fontFamily: "var(--font-mono)" }}>
              {totalObservations.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-[#555] text-xs uppercase tracking-wider mb-1">Confidence avg</p>
            <p className="text-[#f0f0f0] font-medium" style={{ fontFamily: "var(--font-mono)" }}>
              {confidenceAvg != null ? `${(confidenceAvg * 100).toFixed(0)}%` : "—"}
            </p>
          </div>
        </div>

        {/* Insights */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-[#f0f0f0] mb-4">
            What Zyph has learned about you
          </h2>
          {Object.keys(groupedByCategory).length === 0 ? (
            <div
              className="rounded-xl p-12 flex flex-col items-center justify-center text-center border border-[#1e1e1e]"
              style={{ background: "#111111" }}
            >
              <div
                className="w-16 h-16 rounded-full bg-[#7c3aed]/30 animate-pulse mb-4"
                style={{ boxShadow: "0 0 24px rgba(124,58,237,0.3)" }}
              />
              <p className="text-[#666] text-sm">No insights yet. Keep using Zyph to build your profile.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(groupedByCategory).map(([category, items]) => {
                const color = CATEGORY_COLORS[category] || "#7c3aed";
                const isExpanded = expandedCategories[category] !== false;
                return (
                  <div
                    key={category}
                    className="rounded-xl overflow-hidden transition-all duration-200"
                    style={{
                      background: "#111111",
                      border: "1px solid #1e1e1e",
                      borderLeft: `3px solid ${color}`,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleCategory(category)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#141414] transition-colors duration-200"
                    >
                      <span className="font-medium text-[#f0f0f0]">{category}</span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full text-[#666]"
                        style={{ background: "#1a1a1a" }}
                      >
                        {items.length} insight{items.length !== 1 ? "s" : ""}
                      </span>
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-3">
                        {items.map((insight) => {
                          const conf = insight.confidence != null ? Number(insight.confidence) : 0;
                          const pct = Math.min(100, Math.round(conf * 100));
                          const text = insight.content || insight.summary || "—";
                          return (
                            <div
                              key={insight.id}
                              className="p-3 rounded-lg transition-colors duration-200 hover:bg-[#141414]"
                              style={{ background: "#0d0d0d", border: "1px solid #1a1a1a" }}
                            >
                              <p className="text-[#f0f0f0] text-sm mb-2">{text}</p>
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
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Recent Observations Timeline */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-[#f0f0f0] mb-4">
            Recent Observations
          </h2>
          <div
            className="rounded-xl p-6 relative"
            style={{
              background: "#111111",
              border: "1px solid #1e1e1e",
            }}
          >
            {observations.length === 0 ? (
              <p className="text-[#666] text-sm">No observations yet. Use the desktop app to start.</p>
            ) : (
              <ul className="relative">
                <span
                  className="absolute left-[7px] top-2 bottom-2 w-px rounded-full"
                  style={{ background: "rgba(124,58,237,0.3)" }}
                />
                {displayObservations.map((obs) => (
                  <li
                    key={obs.id}
                    className="relative flex gap-4 pl-8 pb-6 last:pb-0"
                  >
                    <span
                      className="absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full shrink-0 border-2 border-[#111]"
                      style={{ background: "#7c3aed" }}
                    />
                    <div className="min-w-0">
                      {obs.app_name && (
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-medium mb-1 text-[#a78bfa] bg-[#1a1a2e]">
                          {obs.app_name}
                        </span>
                      )}
                      <p className="text-[#f0f0f0] text-sm">
                        {obs.description || "Activity"}
                      </p>
                      <p className="text-[#666] text-xs mt-0.5" style={{ fontFamily: "var(--font-mono)" }}>
                        {formatTimeAgo(obs.created_at)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {hasMoreObservations && (
              <button
                type="button"
                onClick={() => setObservationsLimit((n) => n + 10)}
                className="mt-4 text-sm text-[#7c3aed] hover:underline transition-opacity duration-200"
              >
                Load more
              </button>
            )}
          </div>
        </section>

        {/* Danger zone */}
        <div className="pt-4">
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
