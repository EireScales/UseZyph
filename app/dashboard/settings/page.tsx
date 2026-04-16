"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import {
  parseSubscriptionRow,
  type SubscriptionRow,
} from "@/lib/subscription-shared";

type ProfileRow = {
  id: string;
  display_name: string | null;
  settings?: {
    capture_frequency?: string;
    idle_enabled?: boolean;
    categories?: string[];
    data_retention_days?: number;
  } | null;
};

type Toast = { type: "success" | "error"; message: string } | null;

const inputClass =
  "w-full px-4 py-2.5 rounded-lg bg-[#111] border border-[#1e1e1e] text-[#f0f0f0] placeholder-[#666] focus:outline-none focus:border-[#6366f1] focus:ring-0 transition-colors duration-200";

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [dataRetentionDays, setDataRetentionDays] = useState(90);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionRow | null>(
    null
  );
  const [portalLoading, setPortalLoading] = useState(false);

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

      setUserId(user.id);
      setEmail(user.email ?? "");

      try {
        const { data } = await supabase
          .from("profiles")
          .select("display_name, settings, subscription")
          .eq("id", user.id)
          .single();

        if (data) {
          const row = data as ProfileRow & { subscription?: unknown };
          setSubscription(parseSubscriptionRow(row.subscription));
          setDisplayName(row.display_name ?? "");
          const s = row.settings;
          if (s && typeof s.data_retention_days === "number")
            setDataRetentionDays(s.data_retention_days);
        }
      } catch (err) {
        console.error("Save error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      const { data: row, error: fetchErr } = await supabase
        .from("profiles")
        .select("settings")
        .eq("id", userId)
        .single();
      if (fetchErr) throw fetchErr;
      const prev =
        row?.settings &&
        typeof row.settings === "object" &&
        !Array.isArray(row.settings)
          ? (row.settings as Record<string, unknown>)
          : {};
      const settings = {
        ...prev,
        data_retention_days: dataRetentionDays,
      };
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: displayName.trim() || null,
          settings,
        })
        .eq("id", userId);

      if (error) throw error;
      setToast({ type: "success", message: "Saved" });
    } catch (err) {
      const message = (err as Error)?.message ?? "Failed to save";
      setToast({ type: "error", message });
    } finally {
      setSaving(false);
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        credentials: "include",
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) {
        setToast({
          type: "error",
          message: data.error ?? "Could not open billing portal",
        });
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setToast({ type: "error", message: "No portal URL returned" });
    } catch {
      setToast({ type: "error", message: "Network error" });
    } finally {
      setPortalLoading(false);
    }
  };

  const handleDeleteAllData = async () => {
    if (!userId) return;
    setDeleting(true);
    try {
      await supabase.from("observations").delete().eq("user_id", userId);
      await supabase.from("user_profile_insights").delete().eq("user_id", userId);
      await supabase
        .from("profiles")
        .update({
          settings: {},
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
      setToast({ type: "success", message: "All data deleted" });
      setDeleteModalOpen(false);
    } catch {
      setToast({ type: "error", message: "Failed to delete data" });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: "#6366f1", borderTopColor: "transparent" }}
          aria-label="Loading"
        />
      </div>
    );
  }

  const initial = displayName?.[0]?.toUpperCase() || "?";

  return (
    <div
      className="p-6 md:p-8 pb-24"
      style={{ animation: "dashboardFadeIn 0.3s ease forwards" }}
    >

      <div className="max-w-[680px] mx-auto">
        <h1 className="text-[28px] font-semibold text-[#f0f0f0] mb-8">
          Settings
        </h1>

        {/* Account */}
        <section className="mb-10">
          <h2 className="text-sm font-medium text-[#666] uppercase tracking-wider mb-4">
            Account
          </h2>
          <div className="h-px bg-[#1a1a1a] mb-6" />
          <div className="flex items-start gap-6 mb-6">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white shrink-0"
              style={{
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              }}
            >
              {initial}
            </div>
            <div className="flex-1 space-y-4 min-w-0">
              <div>
                <label className="block text-xs text-[#666] mb-1.5">
                  Display name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className={inputClass}
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-xs text-[#666] mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className={`${inputClass} opacity-80 cursor-not-allowed`}
                  placeholder="Email"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Subscription */}
        <section className="mb-10">
          <h2 className="text-sm font-medium text-[#666] uppercase tracking-wider mb-4">
            Subscription
          </h2>
          <div className="h-px bg-[#1a1a1a] mb-6" />
          <div className="rounded-xl border border-[#1e1e1e] bg-[#111] px-4 py-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[#f0f0f0] font-medium">Billing</p>
                <p className="text-[#666] text-sm mt-0.5">
                  {!subscription?.status || subscription.status === "free"
                    ? "Subscribe to Pro or Mirror to unlock higher limits and full history."
                    : subscription.stripe_customer_id
                      ? "Manage your plan, payment method, and invoices in Stripe."
                      : "Your plan is active."}
                </p>
              </div>
              {subscription?.status && subscription.status !== "free" ? (
                subscription.stripe_customer_id ? (
                  <button
                    type="button"
                    onClick={handleManageSubscription}
                    disabled={portalLoading}
                    className="shrink-0 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-[#6366f1] hover:opacity-90 disabled:opacity-50 transition-opacity duration-200"
                  >
                    {portalLoading ? "Opening…" : "Manage subscription"}
                  </button>
                ) : (
                  <div className="px-4 py-2.5 rounded-lg text-sm font-medium text-[#22c55e] border border-[#22c55e]/30 bg-[#22c55e]/10 inline-block">
                    {subscription.status === "mirror"
                      ? "Mirror plan — active"
                      : "Pro plan — active"}
                  </div>
                )
              ) : (
                <a
                  href="/pricing"
                  className="shrink-0 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-[#7c3aed] hover:opacity-90 transition-opacity duration-200 inline-block text-center"
                >
                  View pricing
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Desktop App */}
        <section className="mb-10">
          <h2 className="text-sm font-medium text-[#666] uppercase tracking-wider mb-4">
            Desktop App
          </h2>
          <div className="h-px bg-[#1a1a1a] mb-6" />
          <div className="rounded-xl border border-[#1e1e1e] bg-[#111] px-4 py-4">
            <p className="text-[#f0f0f0] font-medium mb-1">Capture settings</p>
            <p className="text-[#666] text-sm">
              Zyph captures every 30 seconds automatically. Pause or resume capturing from the desktop app tray icon.
            </p>
          </div>
        </section>

        {/* Data & Privacy */}
        <section className="mb-10">
          <h2 className="text-sm font-medium text-[#666] uppercase tracking-wider mb-4">
            Data & Privacy
          </h2>
          <div className="h-px bg-[#1a1a1a] mb-6" />
          <div className="space-y-6">
            <div className="flex items-baseline gap-2 flex-wrap">
              <label className="text-xs text-[#666]">Data retention</label>
              <input
                type="number"
                min={7}
                max={365}
                value={dataRetentionDays}
                onChange={(e) =>
                  setDataRetentionDays(Number(e.target.value) || 90)
                }
                className="w-20 px-3 py-2 rounded-lg bg-[#111] border border-[#1e1e1e] text-[#f0f0f0] focus:outline-none focus:border-[#6366f1] text-sm"
              />
              <span className="text-[#666] text-sm">days</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={async () => {
                  if (!userId) return;
                  const { data: obs } = await supabase
                    .from("observations")
                    .select("captured_at, app_name, summary, category")
                    .eq("user_id", userId)
                    .order("captured_at", { ascending: false });
                  const { data: ins } = await supabase
                    .from("user_profile_insights")
                    .select(
                      "insight_type, insight_value, confidence_score, updated_at"
                    )
                    .eq("user_id", userId);
                  const blob = new Blob(
                    [JSON.stringify({ observations: obs, insights: ins }, null, 2)],
                    { type: "application/json" }
                  );
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "zyph-data-export.json";
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium text-[#f0f0f0] border border-[#1e1e1e] hover:bg-[#141414] transition-colors duration-200"
              >
                Export my data
              </button>
              <button
                type="button"
                onClick={() => setDeleteModalOpen(true)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-red-400 border border-red-900/60 bg-transparent hover:bg-red-950/50 transition-colors duration-200"
              >
                Delete all data
              </button>
            </div>
          </div>
        </section>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 rounded-lg font-medium text-white bg-[#6366f1] hover:opacity-90 disabled:opacity-50 transition-all duration-200 flex items-center gap-2"
          >
            {saving ? (
              <>
                <span
                  className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: "#fff", borderTopColor: "transparent" }}
                  aria-hidden
                />
                Saving…
              </>
            ) : (
              "Save changes"
            )}
          </button>
        </div>
      </div>

      {/* Toasts */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border border-[#1e1e1e] shadow-lg"
          style={{ background: "#111111" }}
        >
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              toast.type === "success" ? "bg-[#22c55e]" : "bg-red-500"
            }`}
          />
          <span className="text-sm text-[#f0f0f0]">{toast.message}</span>
        </div>
      )}

      {/* Delete modal */}
      {deleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          onClick={() => !deleting && setDeleteModalOpen(false)}
        >
          <div
            className="rounded-xl p-6 max-w-md w-full border border-[#1e1e1e] bg-[#111111]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-[#f0f0f0] mb-2">
              Delete all data?
            </h3>
            <p className="text-[#666] text-sm mb-6">
              This will permanently delete all observations and insights. Your
              account will remain; only learned data is removed.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                disabled={deleting}
                className="px-4 py-2 rounded-lg text-[#999] hover:bg-[#141414] transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAllData}
                disabled={deleting}
                className="px-4 py-2 rounded-lg text-red-400 border border-red-900/50 bg-transparent hover:bg-red-950/50 disabled:opacity-50 transition-colors duration-200"
              >
                {deleting ? "Deleting…" : "Yes, delete everything"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
