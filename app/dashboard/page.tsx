"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { UpgradeModal } from "@/components/UpgradeModal";
import {
  defaultSubscription,
  isFreeTier,
  isTrialing,
  parseSubscriptionRow,
  startOfUtcDayIso,
  trialDaysRemaining,
  type SubscriptionRow,
} from "@/lib/subscription-shared";

type Profile = { id: string; name: string | null } | null;
type Observation = {
  id: string;
  captured_at: string;
  app_name?: string | null;
  summary?: string | null;
  category?: string | null;
} | Record<string, unknown>;
type ProfileInsight = {
  id: string;
  insight_value?: string | null;
  insight_type?: string | null;
  confidence_score?: number | null;
  updated_at?: string;
} | Record<string, unknown>;

function useCountUp(end: number, duration = 1200, enabled = true) {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || typeof end !== "number") {
      setValue(end);
      return;
    }
    const isNumeric = Number.isFinite(end) && !Number.isNaN(end);
    if (!isNumeric) {
      setValue(0);
      return;
    }
    const start = 0;
    let rafId: number;
    const step = (ts: number) => {
      if (startRef.current == null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const t = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(start + (end - start) * easeOut));
      if (t < 1) rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [end, duration, enabled]);

  return value;
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createSupabaseBrowserClient();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [profileInsights, setProfileInsights] = useState<ProfileInsight[]>([]);
  const [totalObservations, setTotalObservations] = useState(0);
  const [daysActive, setDaysActive] = useState(0);
  const [insightsCount, setInsightsCount] = useState(0);
  const [topApp, setTopApp] = useState<string>("—");
  const [time, setTime] = useState<Date>(() => new Date());
  const [lastActiveDaysAgo, setLastActiveDaysAgo] = useState<number | null>(null);
  const [capturesToday, setCapturesToday] = useState(0);
  const [subscription, setSubscription] = useState<SubscriptionRow>(() =>
    defaultSubscription()
  );
  const [modalDismissed, setModalDismissed] = useState(false);
  const [storageRead, setStorageRead] = useState(false);
  const [fromDesktopLimit, setFromDesktopLimit] = useState(false);

  const countTotal = useCountUp(totalObservations, 1000, !loading);
  const countDays = useCountUp(daysActive, 1000, !loading);
  const countInsights = useCountUp(insightsCount, 1000, !loading);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { user },
        error: sessionError,
      } = await supabase.auth.getUser();
      if (sessionError || !user) {
        router.replace("/auth");
        return;
      }

      try {
        const dayStart = startOfUtcDayIso();
        const [profileRes, observationsRes, insightsRes, countRes, todayCountRes] =
          await Promise.all([
            supabase
              .from("profiles")
              .select("id, name, subscription")
              .eq("id", user.id)
              .single(),
            supabase
              .from("observations")
              .select("id, captured_at, app_name, summary, category")
              .eq("user_id", user.id)
              .order("captured_at", { ascending: false })
              .limit(10),
            supabase
              .from("user_profile_insights")
              .select("id, insight_value, insight_type, confidence_score, updated_at")
              .eq("user_id", user.id)
              .order("updated_at", { ascending: false })
              .limit(5),
            supabase
              .from("observations")
              .select("id", { count: "exact", head: true })
              .eq("user_id", user.id),
            supabase
              .from("observations")
              .select("id", { count: "exact", head: true })
              .eq("user_id", user.id)
              .gte("captured_at", dayStart),
          ]);

        console.log("[dashboard] profileRes:", JSON.stringify(profileRes));
        console.log("[dashboard] profileRes.error:", profileRes.error);

        if (profileRes.data) {
          const raw = profileRes.data as {
            id: string;
            name: string | null;
            subscription?: unknown;
          };
          setProfile({ id: raw.id, name: raw.name });
          setSubscription(parseSubscriptionRow(raw.subscription));
        }
        if (todayCountRes.count != null) setCapturesToday(todayCountRes.count);
        if (observationsRes.data)
          setObservations((observationsRes.data as Observation[]) || []);
        if (insightsRes.data)
          setProfileInsights((insightsRes.data as ProfileInsight[]) || []);
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
          setDaysActive(dates.size);
        }

        const insightsCountRes = await supabase
          .from("user_profile_insights")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id);
        if (insightsCountRes.count != null)
          setInsightsCount(insightsCountRes.count);

        if (observationsRes.data?.length) {
          const apps = (observationsRes.data as { app_name?: string }[]).reduce(
            (acc: Record<string, number>, o) => {
              const app = o.app_name || "Unknown";
              acc[app] = (acc[app] || 0) + 1;
              return acc;
            },
            {}
          );
          const top = Object.entries(apps).sort((a, b) => b[1] - a[1])[0];
          if (top) setTopApp(top[0]);
        }

        const latestObs = observationsRes.data?.[0] as { captured_at?: string } | undefined;
        if (latestObs?.captured_at) {
          const last = new Date(latestObs.captured_at);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          last.setHours(0, 0, 0, 0);
          setLastActiveDaysAgo(Math.floor((today.getTime() - last.getTime()) / (24 * 60 * 60 * 1000)));
        } else {
          setLastActiveDaysAgo(null);
        }
      } catch {
        // Tables may not exist yet; keep defaults
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [router]);

  useEffect(() => {
    const tick = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    const urgent = searchParams.get("daily_limit") === "1";
    if (urgent) {
      setFromDesktopLimit(true);
      setModalDismissed(false);
      try {
        sessionStorage.removeItem("zyph_upgrade_modal_dismissed");
      } catch {
        /* private mode */
      }
      router.replace("/dashboard", { scroll: false });
    } else {
      try {
        if (sessionStorage.getItem("zyph_upgrade_modal_dismissed") === "1") {
          setModalDismissed(true);
        }
      } catch {
        /* ignore */
      }
    }
    setStorageRead(true);
  }, [searchParams, router]);

  const greeting =
    time.getHours() < 12 ? "morning" : time.getHours() < 18 ? "afternoon" : "evening";
  const displayName = profile?.name?.trim() || "there";

  const statCards = [
    {
      label: "Total Observations",
      value: countTotal.toLocaleString(),
      border: "#7c3aed",
    },
    {
      label: "Days Active",
      value: countDays.toString(),
      border: "#e8837a",
    },
    {
      label: "Insights Generated",
      value: countInsights.toString(),
      border: "#f59e0b",
    },
    { label: "Top App Used", value: topApp, border: "#22c55e" },
  ];

  const insightCategories: Record<string, ProfileInsight[]> = {};
  profileInsights.forEach((i) => {
    const cat = (i.insight_type || "General") as string;
    if (!insightCategories[cat]) insightCategories[cat] = [];
    insightCategories[cat].push(i);
  });

  const onFreePlan = isFreeTier(subscription);
  const trialing = isTrialing(subscription);
  const trialDaysLeft = trialDaysRemaining(subscription.trial_end);
  const trialEndsSoon =
    trialing && trialDaysLeft !== null && trialDaysLeft <= 3;

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

      <div className="max-w-6xl mx-auto">
        <header className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <h1
            className="text-[32px] font-semibold text-[#f0f0f0]"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Good {greeting}, {displayName}
          </h1>
          <div
            className="text-right tabular-nums text-[#444] font-medium text-sm"
            style={{ fontFamily: "var(--font-mono)" }}
            aria-live="polite"
          >
            {time.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </div>
        </header>
        <div className="h-px bg-[#1a1a1a] mb-8" />

        {trialing && trialEndsSoon && (
          <div
            className="mb-6 flex flex-col gap-3 rounded-xl border border-amber-600/40 bg-amber-950/25 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
            role="status"
          >
            <p className="text-sm text-amber-100/95">
              Your trial ends soon — upgrade to keep unlimited access
            </p>
            <Link
              href="/pricing"
              className="shrink-0 text-sm font-semibold text-amber-400 hover:text-amber-300 hover:underline"
            >
              View plans →
            </Link>
          </div>
        )}

        {trialing && !trialEndsSoon && (
          <div
            className="mb-6 flex flex-col gap-3 rounded-xl border border-[#5b21b6]/50 bg-[#1a0a2e]/80 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
            role="status"
          >
            <p className="text-sm text-[#c4b5fd]">
              {trialDaysLeft != null && trialDaysLeft > 0 ? (
                <>
                  <span className="font-semibold text-white">
                    {trialDaysLeft}
                  </span>{" "}
                  {trialDaysLeft === 1 ? "day" : "days"} left in your free trial
                </>
              ) : (
                <>You&apos;re on a free trial — Pro features are unlocked.</>
              )}
            </p>
            <Link
              href="/pricing"
              className="shrink-0 text-sm font-semibold text-[#a78bfa] hover:text-white hover:underline"
            >
              Plans & pricing →
            </Link>
          </div>
        )}

        {onFreePlan && (
          <div
            className="mb-6 flex flex-col gap-3 rounded-xl border border-[#2a1a4a] bg-[#14101c] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
            role="status"
          >
            <p className="text-sm text-[#c4b5fd]">
              You&apos;re on the <span className="font-semibold text-white">Free plan</span> — upgrade to Pro or Mirror for more captures and priority AI.
            </p>
            <Link href="/pricing" className="shrink-0 text-sm font-semibold text-[#7c3aed] hover:underline">
              Upgrade →
            </Link>
          </div>
        )}

        {!onFreePlan && !trialing && (
          <div
            className="mb-6 flex flex-col gap-3 rounded-xl border border-[#1a3a1a] bg-[#0a140a] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
            role="status"
          >
            <p className="text-sm text-[#86efac]">
              You&apos;re on the{" "}
              <span className="font-semibold text-white capitalize">
                {subscription.status === "mirror" ? "Mirror" : subscription.status === "pro" ? "Pro" : subscription.status}
              </span>{" "}
              plan
              {subscription.status === "mirror" ? " — unlimited captures enabled." : " — 150 captures/day enabled."}
            </p>
            <Link href="/pricing" className="shrink-0 text-sm font-semibold text-[#22c55e] hover:underline">
              Manage plan →
            </Link>
          </div>
        )}

        {onFreePlan &&
          capturesToday >= 15 &&
          capturesToday < 80 && (
            <div
              className="mb-6 flex flex-col gap-3 rounded-xl border border-[#3a2a4a] bg-[#161018] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
              role="status"
            >
              <p className="text-sm text-[#a78bfa]">
                You&apos;ve used{" "}
                <span className="font-semibold text-white">{capturesToday}</span>{" "}
                of{" "}
                <span className="font-semibold text-white">80</span> free
                captures today — upgrade for unlimited.
              </p>
              <Link
                href="/pricing"
                className="shrink-0 text-sm font-semibold text-[#7c3aed] hover:underline"
              >
                View Pro →
              </Link>
            </div>
          )}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl p-5 relative overflow-hidden transition-all duration-200 hover:border-[#2a2a2a]"
              style={{
                background: "#111111",
                border: "1px solid #1e1e1e",
                borderLeft: "2px solid " + stat.border,
              }}
            >
              <p
                className="text-[#555] text-[11px] uppercase tracking-widest mb-1"
                style={{ letterSpacing: "0.1em" }}
              >
                {stat.label}
              </p>
              <p
                className="text-[28px] font-medium text-white truncate"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div
              className="rounded-xl p-5 transition-all duration-200"
              style={{
                background: "#111111",
                border: "1px solid #1e1e1e",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-[#f0f0f0]">
                  Recent Activity
                </h2>
                <Link
                  href="/dashboard/profile"
                  className="text-sm text-[#7c3aed] hover:underline transition-opacity duration-200"
                >
                  View all
                </Link>
              </div>
              {observations.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div
                    className="w-12 h-12 rounded-full mb-3 opacity-60"
                    style={{ background: "#1a1a2e" }}
                  />
                  <p className="text-[#666] text-sm">
                    Start the desktop app to begin learning
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-[#1a1a1a]">
                  {observations.map((obs) => {
                    const o = obs as {
                      id: string;
                      captured_at: string;
                      app_name?: string;
                      summary?: string;
                      category?: string;
                    };
                    return (
                      <li
                        key={o.id}
                        className="flex items-start gap-3 py-3 first:pt-0"
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 mt-1.5"
                          style={{
                            background:
                              ["#7c3aed", "#e8837a", "#f59e0b", "#22c55e"][
                                o.app_name?.length ?? 0 % 4
                              ] || "#7c3aed",
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[#f0f0f0] text-sm">
                            {o.app_name && (
                              <span className="font-medium">{o.app_name}</span>
                            )}
                            {o.summary && (
                              <span className="text-[#666]">
                                {" "}
                                — {o.summary}
                              </span>
                            )}
                          </p>
                          <p
                            className="text-[#666] text-xs mt-0.5"
                            style={{ fontFamily: "var(--font-mono)" }}
                          >
                            {new Date(o.captured_at).toLocaleString()}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div
              className="rounded-xl p-5 transition-all duration-200"
              style={{
                background: "#111111",
                border: "1px solid #1e1e1e",
              }}
            >
              <h2 className="text-base font-semibold text-[#f0f0f0] mb-4">
                What Zyph knows about you
              </h2>
              {profileInsights.length === 0 ? (
                <div className="py-10 flex flex-col items-center justify-center text-center">
                  <div
                    className="w-10 h-10 rounded-full bg-[#7c3aed]/40 animate-pulse mb-3"
                    style={{ boxShadow: "0 0 20px rgba(124,58,237,0.3)" }}
                  />
                  <p className="text-[#666] text-sm">
                    Zyph is building your profile…
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(insightCategories).map(([category, items]) => (
                    <div key={category}>
                      <p className="text-[#555] text-xs uppercase tracking-wider mb-2">
                        {category}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {items.slice(0, 5).map((insight) => {
                          const i = insight as {
                            id: string;
                            insight_value?: string | null;
                          };
                          const text = i.insight_value ?? "";
                          return (
                            <span
                              key={i.id}
                              className="inline-flex px-3 py-1 rounded-full text-xs text-[#a78bfa]"
                              style={{
                                background: "#1a1a2e",
                              }}
                            >
                              {text.slice(0, 60)}
                              {text.length > 60 ? "…" : ""}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <Link
              href="/dashboard/chat"
              className="block rounded-xl p-6 transition-all duration-200 hover:border-[#2a1a4a]"
              style={{
                background: "linear-gradient(135deg, #1a0a2e 0%, #0f0a0a 100%)",
                border: "1px solid #2a1a4a",
              }}
            >
              <h3 className="text-lg font-semibold text-white mb-1">
                Chat with Zyph
              </h3>
              <p className="text-[#666] text-sm mb-4">
                Your AI has full context. Ask anything.
              </p>
              <span
                className="inline-flex items-center justify-center w-full py-2.5 rounded-lg text-sm font-medium text-white transition-colors duration-200 hover:opacity-90"
                style={{ background: "#7c3aed" }}
              >
                Open Chat →
              </span>
              <p className="text-[#22c55e] text-xs mt-3 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                Zyph knows you
              </p>
            </Link>

            <div
              className="rounded-xl p-5 transition-all duration-200"
              style={{
                background: "#111111",
                border: "1px solid #1e1e1e",
              }}
            >
              <h3 className="text-sm font-medium text-[#f0f0f0] mb-3">
                Quick Stats
              </h3>
              <div className="flex gap-1 mb-3 items-end" style={{ height: 24 }}>
                {Array.from({ length: 14 }).map((_, i) => {
                  const active = i < Math.min(daysActive, 14);
                  return (
                    <div
                      key={i}
                      className="flex-1 rounded-sm bg-[#1a1a1a] min-h-[4px]"
                      style={{
                        height: active ? `${12 + (i % 3) * 4}px` : "6px",
                        opacity: active ? 0.7 : 0.25,
                      }}
                    />
                  );
                })}
              </div>
              <p className="text-sm text-[#666] flex items-center gap-2">
                {lastActiveDaysAgo === 0 ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
                    Active today
                  </>
                ) : lastActiveDaysAgo != null ? (
                  <>Last active: {lastActiveDaysAgo} days ago</>
                ) : (
                  <>No activity yet</>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <UpgradeModal
        open={
          storageRead &&
          !loading &&
          onFreePlan &&
          !modalDismissed &&
          (capturesToday >= 80 || fromDesktopLimit)
        }
        onDismiss={() => {
          setModalDismissed(true);
          setFromDesktopLimit(false);
          try {
            sessionStorage.setItem("zyph_upgrade_modal_dismissed", "1");
          } catch {
            /* ignore */
          }
        }}
      />
    </div>
  );
}

function DashboardLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-[#7c3aed] border-t-transparent"
        aria-label="Loading"
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
}
